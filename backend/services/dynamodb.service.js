import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import docClient, { usersTable } from "../config/dynamodb.js";
import { v4 as uuidv4 } from "uuid";

/**
 * DynamoDB Service for KindCrew
 * Handles user operations with KindCrew-Users table
 */

class DynamoDBService {
  // Create user
  async createUser(userData) {
    const userId = uuidv4();
    const now = new Date().toISOString();

    const user = {
      userId,
      email: userData.email,
      name: userData.name,
      profileImage: userData.profileImage || null,
      givenName: userData.givenName || null,
      familyName: userData.familyName || null,
      emailVerified: userData.emailVerified || false,
      locale: userData.locale || null,
      authProviders: userData.authProviders || [],
      role: userData.role || "user",
      status: userData.status || "active",
      loginHistory: userData.loginHistory || [],
      createdAt: now,
      lastLogin: now,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: usersTable,
        Item: user,
      }),
    );

    return user;
  }

  // Get user by userId
  async getUserById(userId) {
    const result = await docClient.send(
      new GetCommand({
        TableName: usersTable,
        Key: { userId },
      }),
    );

    return result.Item;
  }

  // Get user by email
  async getUserByEmail(email) {
    const result = await docClient.send(
      new QueryCommand({
        TableName: usersTable,
        IndexName: "EmailIndex",
        KeyConditionExpression: "email = :email",
        ExpressionAttributeValues: {
          ":email": email,
        },
      }),
    );

    return result.Items?.[0];
  }

  // Update user
  async updateUser(userId, updates) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((key, index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpression.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = updates[key];
    });

    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const result = await docClient.send(
      new UpdateCommand({
        TableName: usersTable,
        Key: { userId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return result.Attributes;
  }

  // Update user on login - records login history
  async updateUserOnLogin(userId, updates, loginMethod) {
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    // Add standard updates
    Object.keys(updates).forEach((key, index) => {
      const attrName = `#attr${index}`;
      const attrValue = `:val${index}`;
      updateExpression.push(`${attrName} = ${attrValue}`);
      expressionAttributeNames[attrName] = key;
      expressionAttributeValues[attrValue] = updates[key];
    });

    // Add new login to history
    const loginEntry = {
      timestamp: new Date().toISOString(),
      loginMethod: loginMethod,
    };

    updateExpression.push(
      "#loginHistory = list_append(if_not_exists(#loginHistory, :empty_list), :newLogin)",
    );
    expressionAttributeNames["#loginHistory"] = "loginHistory";
    expressionAttributeValues[":empty_list"] = [];
    expressionAttributeValues[":newLogin"] = [loginEntry];

    // Update lastLogin and updatedAt
    updateExpression.push("#lastLogin = :lastLogin");
    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#lastLogin"] = "lastLogin";
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":lastLogin"] = new Date().toISOString();
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const result = await docClient.send(
      new UpdateCommand({
        TableName: usersTable,
        Key: { userId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      }),
    );

    return result.Attributes;
  }
}

export default new DynamoDBService();
