import { v4 as uuidv4 } from "uuid";
import User from "../../../models/User.js";
import usersRepository from "./users.repository.js";
import {
  hasMatchingProviderIdentity,
  normalizeEmail,
  normalizeProviderIdentity,
} from "./userIdentity.js";

export class IdentityLinkingRequiredError extends Error {
  constructor(identity, existingUserId) {
    super("Identity linking is required for this email");
    this.name = "IdentityLinkingRequiredError";
    this.code = "IDENTITY_LINKING_REQUIRED";
    this.identity = identity;
    this.existingUserId = existingUserId;
  }
}

export class UsersService {
  constructor(repository = usersRepository, generateUserId = uuidv4) {
    this.repository = repository;
    this.generateUserId = generateUserId;
  }

  async createUser(identity, name, additionalData = {}) {
    const normalizedIdentity = normalizeProviderIdentity(identity);
    const normalizedEmail = normalizedIdentity.email;
    const validation = User.validate({
      email: normalizedEmail,
      name,
      role: "user",
      status: "active",
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    const user = User.create(
      this.generateUserId(),
      normalizedEmail,
      name,
      [
        {
          type: normalizedIdentity.provider,
          providerId: normalizedIdentity.providerUserId,
          linkedAt: new Date().toISOString(),
        },
      ],
      {
        givenName: additionalData.givenName,
        familyName: additionalData.familyName,
        profileImage: additionalData.profileImage,
        emailVerified: normalizedIdentity.emailVerified,
        locale: additionalData.locale,
      },
    );

    return this.repository.create(user);
  }

  async findOrCreateUser(email, name, authProvider, additionalData = {}) {
    const identity = normalizeProviderIdentity({
      provider: authProvider,
      providerUserId: additionalData.cognitoId,
      email,
      emailVerified: additionalData.emailVerified,
    });

    const providerUser = await this.repository.findByProviderIdentity(
      identity.provider,
      identity.providerUserId,
    );

    if (providerUser) {
      await this.repository.updateOnLogin(
        providerUser.userId,
        this.getLoginUpdates(name, identity, additionalData),
        identity.provider,
      );
      return this.repository.findById(providerUser.userId);
    }

    const normalizedEmail = normalizeEmail(identity.email);
    const emailUser = normalizedEmail
      ? await this.repository.findByEmail(normalizedEmail)
      : null;

    if (emailUser) {
      if (!hasMatchingProviderIdentity(emailUser, identity)) {
        throw new IdentityLinkingRequiredError(identity, emailUser.userId);
      }

      await this.repository.updateOnLogin(
        emailUser.userId,
        this.getLoginUpdates(name, identity, additionalData),
        identity.provider,
      );
      return this.repository.findById(emailUser.userId);
    }

    return this.createUser(identity, name, additionalData);
  }

  async resolveAuthenticatedUser(identity, userData = {}, options = {}) {
    const normalizedIdentity = normalizeProviderIdentity(identity);
    const providerUser = await this.repository.findByProviderIdentity(
      normalizedIdentity.provider,
      normalizedIdentity.providerUserId,
    );

    if (providerUser && options.recordLogin) {
      await this.repository.updateOnLogin(
        providerUser.userId,
        this.getLoginUpdates(userData.name, normalizedIdentity, userData),
        normalizedIdentity.provider,
      );
      return this.repository.findById(providerUser.userId);
    }

    if (providerUser) return providerUser;

    const normalizedEmail = normalizeEmail(normalizedIdentity.email);
    if (normalizedIdentity.emailVerified && normalizedEmail) {
      const emailUser = await this.repository.findByEmail(normalizedEmail);
      if (emailUser) {
        throw new IdentityLinkingRequiredError(
          normalizedIdentity,
          emailUser.userId,
        );
      }
    }

    if (!normalizedEmail) {
      throw new Error(
        "Verified Cognito identity email is required to create a user",
      );
    }

    return this.createUser(
      normalizedIdentity,
      userData.name || normalizedEmail,
      userData,
    );
  }

  getLoginUpdates(name, identity, additionalData) {
    return {
      name,
      emailVerified: identity.emailVerified,
      profileImage: additionalData.profileImage,
      givenName: additionalData.givenName,
      familyName: additionalData.familyName,
      locale: additionalData.locale,
      lastLogin: new Date().toISOString(),
    };
  }

  async getUserById(userId) {
    return this.repository.findById(userId);
  }

  async updateProfile(userId, updates) {
    const allowedUpdates = [
      "name",
      "profileImage",
      "status",
      "givenName",
      "familyName",
      "locale",
    ];
    const filteredUpdates = {};

    Object.keys(updates).forEach((key) => {
      if (allowedUpdates.includes(key)) filteredUpdates[key] = updates[key];
    });

    return this.repository.update(userId, filteredUpdates);
  }

  async addAuthProvider(userId, authProvider, providerId) {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error("User not found");

    if (
      hasMatchingProviderIdentity(user, {
        provider: authProvider,
        providerUserId: providerId,
      })
    ) {
      return user;
    }

    const authProviders = [
      ...(user.authProviders || []),
      {
        type: authProvider,
        providerId,
        linkedAt: new Date().toISOString(),
      },
    ];

    return this.repository.update(userId, { authProviders });
  }
}

export default new UsersService();
