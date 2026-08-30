import dynamodb from "../../../services/dynamodb.service.js";
import docClient, { creatorProfilesTable } from "../../../config/dynamodb.js";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export class CreatorProfileRepository {
  constructor(database = dynamodb) {
    this.database = database;
  }

  async findById(creatorId) {
    return this.database.getCreatorProfile(creatorId);
  }

  async findByUserId(userId) {
    return this.database.getCreatorProfileByUserId(userId);
  }

  async create(profile) {
    return this.database.createCreatorProfile(profile);
  }

  async update(creatorId, updates) {
    return this.database.updateCreatorProfile(creatorId, updates);
  }

  async delete(creatorId) {
    // Implement real delete using DeleteCommand on docClient to fix the legacy get-only delete stub
    await docClient.send(
      new DeleteCommand({
        TableName: creatorProfilesTable,
        Key: { creatorId },
      }),
    );
  }
}

export default new CreatorProfileRepository();
