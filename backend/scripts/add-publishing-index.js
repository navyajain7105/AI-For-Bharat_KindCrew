
/**
 * Helper script to add UserIdIndex GSI to existing publishing table if necessary
 * Run with `node scripts/add-publishing-index.js` after configuring AWS credentials.
 */

import {
  DynamoDBClient,
  DescribeTableCommand,
  UpdateTableCommand,
} from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }),
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT }),
});

const tableName = process.env.DYNAMODB_PUBLISHING_TABLE || "KindCrew-PublishingSchedules";

async function ensureIndex() {
  try {
    const desc = await client.send(new DescribeTableCommand({ TableName: tableName }));
    const gsis = desc.Table.GlobalSecondaryIndexes || [];
    const hasIndex = gsis.some((i) => i.IndexName === "UserIdIndex");
    if (hasIndex) {
      console.log("✅ UserIdIndex already present on table", tableName);
      return;
    }
    console.log("⚠️  UserIdIndex missing - creating...");
    await client.send(
      new UpdateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
              IndexName: "UserIdIndex",
              KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
              Projection: { ProjectionType: "ALL" },
              ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
            },
          },
        ],
      }),
    );
    console.log("✅ Requested index creation (may take a minute to become active)");
  } catch (err) {
    console.error("Error ensuring index:", err);
    process.exit(1);
  }
}

ensureIndex();
