import dynamoDBService from "../services/dynamodb.service.js";
import User from "../models/User.js";

/**
 * User Service
 * Business logic layer for user operations
 * Handles user creation, authentication, and profile management
 * Follows MVC architecture pattern
 */

class UserService {
  // Create new user (during signup/OAuth)
  async createUser(email, name, authProvider, additionalData = {}) {
    const { v4: uuidv4 } = await import("uuid");

    // Validate user data
    const validation = User.validate({
      email,
      name,
      role: "user",
      status: "active",
    });

    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
    }

    // Create user instance using model
    const authProviders = [
      {
        type: authProvider,
        providerId: additionalData.cognitoId || email,
        linkedAt: new Date().toISOString(),
      },
    ];

    const userData = User.create(uuidv4(), email, name, authProviders, {
      givenName: additionalData.givenName,
      familyName: additionalData.familyName,
      profileImage: additionalData.profileImage,
      emailVerified: additionalData.emailVerified,
      locale: additionalData.locale,
    });

    return await dynamoDBService.createUser(userData);
  }

  // Find or create user (for OAuth login) - also records login
  async findOrCreateUser(email, name, authProvider, additionalData = {}) {
    // Try to find existing user by email
    let user = await dynamoDBService.getUserByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = await this.createUser(email, name, authProvider, additionalData);
    } else {
      // Check if this auth provider is already linked
      const providerExists = user.authProviders?.some(
        (provider) => provider.type === authProvider,
      );

      // If new provider, add it to the authProviders array
      if (!providerExists) {
        await this.addAuthProvider(
          user.userId,
          authProvider,
          additionalData.cognitoId || email,
        );
      }

      // Update existing user with latest info and record login
      await dynamoDBService.updateUserOnLogin(
        user.userId,
        {
          name,
          profileImage: additionalData.profileImage,
          givenName: additionalData.givenName,
          familyName: additionalData.familyName,
          emailVerified: additionalData.emailVerified,
          locale: additionalData.locale,
          lastLogin: new Date().toISOString(),
        },
        authProvider,
      );
      // Fetch updated user
      user = await dynamoDBService.getUserById(user.userId);
    }

    return user;
  }

  // Get user by ID
  async getUserById(userId) {
    return await dynamoDBService.getUserById(userId);
  }

  // Update user profile
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
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    return await dynamoDBService.updateUser(userId, filteredUpdates);
  }

  // Add auth provider to existing user
  async addAuthProvider(userId, authProvider, providerId) {
    const user = await dynamoDBService.getUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    const newProvider = {
      type: authProvider,
      providerId,
      linkedAt: new Date().toISOString(),
    };

    const updatedProviders = [...(user.authProviders || []), newProvider];

    return await dynamoDBService.updateUser(userId, {
      authProviders: updatedProviders,
    });
  }
}

export default new UserService();
