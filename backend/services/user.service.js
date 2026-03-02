import dynamoDBService from "../services/dynamodb.service.js";

/**
 * User Service
 * Handles user operations with KindCrew-Users table
 */

class UserService {
  // Create new user (during signup/OAuth)
  async createUser(email, name, authProvider, additionalData = {}) {
    const userData = {
      email,
      name,
      profileImage: additionalData.profileImage || null,
      givenName: additionalData.givenName || null,
      familyName: additionalData.familyName || null,
      emailVerified: additionalData.emailVerified || false,
      locale: additionalData.locale || null,
      authProviders: [
        {
          type: authProvider, // "cognito"
          providerId: additionalData.cognitoId || email,
          linkedAt: new Date().toISOString(),
        },
      ],
      role: "user",
      status: "active",
      loginHistory: [
        {
          timestamp: new Date().toISOString(),
          loginMethod: authProvider,
        },
      ],
    };

    return await dynamoDBService.createUser(userData);
  }

  // Find or create user (for OAuth login) - also records login
  async findOrCreateUser(email, name, authProvider, additionalData = {}) {
    // Try to find existing user
    let user = await dynamoDBService.getUserByEmail(email);

    if (!user) {
      // Create new user if doesn't exist
      user = await this.createUser(email, name, authProvider, additionalData);
    } else {
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
