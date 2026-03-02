/**
 * KindCrew-Users Table Setup
 *
 * This script helps you add the required EmailIndex GSI to your existing KindCrew-Users table
 *
 * The EmailIndex GSI is required for:
 * - Finding users by email during login
 * - OAuth user lookup
 */

import {
  UpdateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: process.env.AWS_ACCESS_KEY_ID
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
});

const usersTable = process.env.DYNAMODB_USERS_TABLE || "KindCrew-Users";

const addEmailIndex = async () => {
  try {
    console.log(`Checking table "${usersTable}"...`);

    // Check current table structure
    const tableInfo = await client.send(
      new DescribeTableCommand({ TableName: usersTable }),
    );

    // Check if EmailIndex already exists
    const hasEmailIndex = tableInfo.Table.GlobalSecondaryIndexes?.some(
      (gsi) => gsi.IndexName === "EmailIndex",
    );

    if (hasEmailIndex) {
      console.log("✓ EmailIndex already exists on KindCrew-Users table");
      return;
    }

    console.log("Adding EmailIndex to KindCrew-Users table...");

    // Add GSI for email lookup
    await client.send(
      new UpdateTableCommand({
        TableName: usersTable,
        AttributeDefinitions: [
          {
            AttributeName: "email",
            AttributeType: "S",
          },
        ],
        GlobalSecondaryIndexUpdates: [
          {
            Create: {
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
          },
        ],
      }),
    );

    console.log("✓ EmailIndex added successfully!");
    console.log("\nNote: Index creation may take a few minutes to complete.");
    console.log("You can check the status in AWS Console.");
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
      console.error(`\n❌ Table "${usersTable}" not found!`);
      console.error("Please create the KindCrew-Users table first with:");
      console.error("- Primary Key: userId (String)\n");
    } else {
      console.error("Error:", error.message);
    }
  }
};

addEmailIndex();
