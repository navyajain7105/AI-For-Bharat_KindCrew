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

const tableName = process.env.DYNAMODB_USERS_TABLE || "KindCrew-Users";

async function setupDynamoDB() {
  try {
    console.log(`🔍 Checking if table "${tableName}" exists...`);

    // Check if table exists
    try {
      const describeCommand = new DescribeTableCommand({
        TableName: tableName,
      });
      const tableInfo = await client.send(describeCommand);

      console.log(`✅ Table "${tableName}" exists`);
      console.log(
        "📋 Current indexes:",
        tableInfo.Table.GlobalSecondaryIndexes?.map((i) => i.IndexName) ||
          "None",
      );

      // Check if EmailIndex exists
      const hasEmailIndex = tableInfo.Table.GlobalSecondaryIndexes?.some(
        (index) => index.IndexName === "EmailIndex",
      );

      if (hasEmailIndex) {
        console.log("✅ EmailIndex already exists!");
        return;
      }

      console.log("⚠️  EmailIndex is missing. Creating...");

      // Check table billing mode
      const billingMode =
        tableInfo.Table.BillingModeSummary?.BillingMode || "PROVISIONED";
      console.log(`📊 Table billing mode: ${billingMode}`);

      const gsiConfig = {
        IndexName: "EmailIndex",
        KeySchema: [
          {
            AttributeName: "email",
            KeyType: "HASH",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      };

      // Only add throughput for provisioned mode
      if (billingMode === "PROVISIONED") {
        gsiConfig.ProvisionedThroughput = {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        };
      }

      // Add EmailIndex GSI
      const updateCommand = new UpdateTableCommand({
        TableName: tableName,
        AttributeDefinitions: [
          {
            AttributeName: "email",
            AttributeType: "S",
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: gsiConfig,
          },
        ],
      });

      await client.send(updateCommand);
      console.log("✅ EmailIndex created successfully!");
      console.log("⏳ Index is being created (this may take 1-2 minutes)");
      console.log(
        "💡 You can check status in AWS Console: DynamoDB → Tables → KindCrew-Users → Indexes",
      );
    } catch (error) {
      if (error.name === "ResourceNotFoundException") {
        console.log(`⚠️  Table "${tableName}" does not exist. Creating...`);

        // Create table with EmailIndex
        const createCommand = new CreateTableCommand({
          TableName: tableName,
          KeySchema: [
            {
              AttributeName: "userId",
              KeyType: "HASH",
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: "userId",
              AttributeType: "S",
            },
            {
              AttributeName: "email",
              AttributeType: "S",
            },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: "EmailIndex",
              KeySchema: [
                {
                  AttributeName: "email",
                  KeyType: "HASH",
                },
              ],
              Projection: {
                ProjectionType: "ALL",
              },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
          BillingMode: "PROVISIONED",
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        });

        await client.send(createCommand);
        console.log(
          `✅ Table "${tableName}" created successfully with EmailIndex!`,
        );
        console.log("⏳ Table is being created (this may take 1-2 minutes)");
      } else {
        throw error;
      }
    }
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
