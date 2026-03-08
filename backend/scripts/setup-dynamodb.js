import {
  CreateTableCommand,
  DescribeTableCommand,
  UpdateTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const usersTableName = process.env.DYNAMODB_USERS_TABLE || "KindCrew-Users";
const publishingTableName =
  process.env.DYNAMODB_PUBLISHING_TABLE || "KindCrew-PublishingSchedules";

async function setupDynamoDB() {
  try {
    // helper to ensure a table with optional GSIs
    async function ensureTable(name, keySchema, attrDefs, gsis = []) {
      try {
        const describeCommand = new DescribeTableCommand({
          TableName: name,
        });
        const info = await client.send(describeCommand);
        console.log(`✅ Table "${name}" exists`);
        return info;
      } catch (err) {
        if (err.name === "ResourceNotFoundException") {
          console.log(`⚠️  Table "${name}" does not exist. Creating...`);
          const createCommand = new CreateTableCommand({
            TableName: name,
            KeySchema: keySchema,
            AttributeDefinitions: attrDefs,
            BillingMode: "PROVISIONED",
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5,
            },
            GlobalSecondaryIndexes: gsis,
          });
          await client.send(createCommand);
          console.log(`✅ Table "${name}" created successfully!`);
          return;
        }
        throw err;
      }
    }

    // ensure users table
    await ensureTable(
      usersTableName,
      [
        { AttributeName: "userId", KeyType: "HASH" },
      ],
      [
        { AttributeName: "userId", AttributeType: "S" },
        { AttributeName: "email", AttributeType: "S" },
      ],
      [
        {
          IndexName: "EmailIndex",
          KeySchema: [{ AttributeName: "email", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
      ],
    );

    // ensure publishing schedules table
    await ensureTable(
      publishingTableName,
      [
        { AttributeName: "scheduleId", KeyType: "HASH" },
      ],
      [
        { AttributeName: "scheduleId", AttributeType: "S" },
        { AttributeName: "userId", AttributeType: "S" },
      ],
      [
        {
          IndexName: "UserIdIndex",
          KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
        },
      ],
    );

    console.log("📋 Setup complete");
  } catch (error) {
    console.error("❌ Error setting up DynamoDB:");
    console.error(error.message);
    console.error("\nPlease check:");
    console.error("1. AWS credentials are correct in .env");
    console.error("2. IAM user has DynamoDB permissions");
    console.error("3. Region is set correctly (ap-south-1)");
    process.exit(1);
  }
}

setupDynamoDB();
setupDynamoDB();
