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

/**
 * Thrown during normal login when the email belongs to an existing account
 * that uses a different authentication provider. Not related to the explicit
 * account-linking flow (Settings → Security).
 */
export class LoginMethodConflictError extends Error {
  constructor() {
    super("This email is already connected to a different login method");
    this.name = "LoginMethodConflictError";
    this.code = "LOGIN_METHOD_CONFLICT";
    // Deliberately carries no identity/userId to avoid information leakage.
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

    // Step 1: Primary lookup by provider + providerUserId
    let providerUser = await this.repository.findByProviderIdentity(
      normalizedIdentity.provider,
      normalizedIdentity.providerUserId,
    );

    // Step 2: Legacy fallback for Google logins.
    // Existing Google-only users may store providerId = Cognito federated sub
    // or may have type = "cognito" from past callback bugs.
    if (!providerUser && normalizedIdentity.provider === "google") {
      let legacyUser = null;
      let matchedOldType = "google";
      let matchedOldId = null;

      if (identity.cognitoSub) {
        legacyUser = await this.repository.findByProviderIdentity("google", identity.cognitoSub);
        if (legacyUser) {
          matchedOldType = "google";
          matchedOldId = identity.cognitoSub;
        }
      }

      if (!legacyUser && identity.cognitoSub) {
        legacyUser = await this.repository.findByProviderIdentity("cognito", identity.cognitoSub);
        if (legacyUser) {
          matchedOldType = "cognito";
          matchedOldId = identity.cognitoSub;
        }
      }

      if (!legacyUser && normalizedIdentity.providerUserId) {
        legacyUser = await this.repository.findByProviderIdentity("google", `Google_${normalizedIdentity.providerUserId}`);
        if (legacyUser) {
          matchedOldType = "google";
          matchedOldId = `Google_${normalizedIdentity.providerUserId}`;
        }
      }

      if (!legacyUser && normalizedIdentity.providerUserId) {
        legacyUser = await this.repository.findByProviderIdentity("cognito", normalizedIdentity.providerUserId);
        if (legacyUser) {
          matchedOldType = "cognito";
          matchedOldId = normalizedIdentity.providerUserId;
        }
      }

      if (legacyUser && matchedOldId) {
        await this.migrateProviderIdentity(
          legacyUser.userId,
          matchedOldType,
          matchedOldId,
          normalizedIdentity.providerUserId,
          "google",
        );
        providerUser = await this.repository.findById(legacyUser.userId);
      }
    }

    if (providerUser && options.recordLogin) {
      await this.repository.updateOnLogin(
        providerUser.userId,
        this.getLoginUpdates(userData.name, normalizedIdentity, userData, providerUser),
        normalizedIdentity.provider,
      );
      return this.repository.findById(providerUser.userId);
    }

    if (providerUser) return providerUser;

    const normalizedEmail = normalizeEmail(normalizedIdentity.email);
    if (normalizedIdentity.emailVerified && normalizedEmail) {
      const emailUser = await this.repository.findByEmail(normalizedEmail);
      if (emailUser) {
        // Check if emailUser contains an unmigrated legacy Google provider record
        const legacyProviderRecord = (emailUser.authProviders || []).find(
          (p) =>
            p.type === "google" ||
            (p.type === "cognito" &&
              ((identity.cognitoSub && (p.providerId === identity.cognitoSub || p.providerUserId === identity.cognitoSub)) ||
                (p.providerId === normalizedIdentity.providerUserId || p.providerUserId === normalizedIdentity.providerUserId))),
        );

        if (legacyProviderRecord && normalizedIdentity.provider === "google") {
          const oldId = legacyProviderRecord.providerId || legacyProviderRecord.providerUserId;
          await this.migrateProviderIdentity(
            emailUser.userId,
            legacyProviderRecord.type,
            oldId,
            normalizedIdentity.providerUserId,
            "google",
          );

          if (typeof this.repository.addAuthProvider === "function") {
            await this.addAuthProvider(emailUser.userId, "google", normalizedIdentity.providerUserId);
          }

          providerUser = (await this.repository.findById?.(emailUser.userId)) || emailUser;
          if (options.recordLogin && typeof this.repository.updateOnLogin === "function") {
            await this.repository.updateOnLogin(
              providerUser.userId,
              this.getLoginUpdates(userData.name, normalizedIdentity, userData, providerUser),
              normalizedIdentity.provider,
            );
            return (await this.repository.findById?.(providerUser.userId)) || providerUser;
          }
          return providerUser;
        }

        // A genuine different-provider conflict during normal login.
        // Use LoginMethodConflictError (not IdentityLinkingRequiredError) so
        // the callback can show a correct user-facing message rather than
        // redirecting through the account-linking flow.
        throw new LoginMethodConflictError();
      }
    }

    if (!normalizedEmail) {
      throw new Error(
        "Verified Cognito identity email is required to create a user",
      );
    }

    return this.createUser(
      identity,
      userData.name || normalizedEmail,
      userData,
    );
  }

  getLoginUpdates(name, identity, additionalData, existingUser = null) {
    const isGeneric = (val) =>
      !val ||
      typeof val !== "string" ||
      !val.trim() ||
      val.trim().toLowerCase() === "user" ||
      val.includes("@");

    const existingName = existingUser?.name;
    const incomingName = name;

    let finalName;
    if (!isGeneric(existingName)) {
      finalName = existingName;
    } else if (!isGeneric(incomingName)) {
      finalName = incomingName;
    } else {
      finalName = existingName || incomingName;
    }

    const updates = {
      name: finalName,
      emailVerified: identity.emailVerified ?? existingUser?.emailVerified,
    };

    if (additionalData?.profileImage || existingUser?.profileImage) {
      updates.profileImage = additionalData?.profileImage || existingUser?.profileImage;
    }
    if (additionalData?.givenName || existingUser?.givenName) {
      updates.givenName = additionalData?.givenName || existingUser?.givenName;
    }
    if (additionalData?.familyName || existingUser?.familyName) {
      updates.familyName = additionalData?.familyName || existingUser?.familyName;
    }
    if (additionalData?.locale || existingUser?.locale) {
      updates.locale = additionalData?.locale || existingUser?.locale;
    }

    return updates;
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

  async updateUserSettings(userId, settings) {
    const user = await this.repository.findById(userId);
    if (!user) throw new Error("User not found");

    const mergedSettings = {
      ...(user.settings || {}),
      ...settings,
    };

    return this.repository.update(userId, { settings: mergedSettings });
  }

  /**
   * Migrate a single provider record's providerId and type from old values to new values.
   * Updates ONLY the exact authProviders entry that matches { type: providerType, providerId: oldProviderId }.
   */
  async migrateProviderIdentity(userId, providerType, oldProviderId, newProviderId, newProviderType = providerType) {
    if (oldProviderId === newProviderId && providerType === newProviderType) return;

    const user = await this.repository.findById(userId);
    if (!user) throw new Error("User not found");

    const authProviders = (user.authProviders || []).map((entry) => {
      if (
        entry.type === providerType &&
        (entry.providerId || entry.providerUserId) === oldProviderId
      ) {
        return {
          ...entry,
          type: newProviderType,
          providerId: newProviderId,
        };
      }
      return entry;
    });

    return this.repository.update(userId, { authProviders });
  }
}

export default new UsersService();
