import dynamoDBService from "../../../services/dynamodb.service.js";

export function createUsersRepository(database = dynamoDBService) {
  return {
  findById(userId) {
    return database.getUserById(userId);
  },

  findByEmail(email) {
    return database.getUserByEmail(email);
  },

  findByProviderIdentity(provider, providerUserId) {
    return database.getUserByProviderIdentity(
      provider,
      providerUserId,
    );
  },

  create(user) {
    return database.createUser(user);
  },

  updateOnLogin(userId, updates, loginMethod) {
    return database.updateUserOnLogin(userId, updates, loginMethod);
  },

  update(userId, updates) {
    return database.updateUser(userId, updates);
  },
  };
}

export default createUsersRepository();
