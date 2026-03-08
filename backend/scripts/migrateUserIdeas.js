import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "KindCrew-ContentIdeas";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function migrateIdeas(fromUserId, toUserId) {
  try {
    console.log(`\n🔄 Migrating ideas from '${fromUserId}' to '${toUserId}'...\n`);

    // 1. Get all ideas for the source userId
    const queryParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": fromUserId,
      },
    };

    const result = await docClient.send(new QueryCommand(queryParams));
    const ideas = result.Items || [];

    if (ideas.length === 0) {
      console.log(`❌ No ideas found for userId: ${fromUserId}`);
      return;
    }

    console.log(`✅ Found ${ideas.length} ideas to migrate\n`);

    // 2. For each idea, delete old and create new with updated userId
    let successCount = 0;
    let errorCount = 0;

    for (const idea of ideas) {
      try {
        console.log(`   Migrating: ${idea.topic.substring(0, 60)}...`);

        // Delete old record
        await docClient.send(
          new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
              userId: fromUserId,
              ideaId: idea.ideaId,
            },
          })
        );

        // Create new record with updated userId
        const updatedIdea = {
          ...idea,
          userId: toUserId,
          updatedAt: new Date().toISOString(),
        };

        await docClient.send(
          new PutCommand({
            TableName: TABLE_NAME,
            Item: updatedIdea,
          })
        );

        successCount++;
        console.log(`      ✅ Migrated successfully`);
      } catch (err) {
        errorCount++;
        console.error(`      ❌ Error: ${err.message}`);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📝 Total: ${ideas.length}\n`);
  } catch (error) {
    console.error("❌ Migration error:", error.message);
  } finally {
    rl.close();
  }
}

async function main() {
  console.log("\n=== DynamoDB Ideas Migration Tool ===\n");
  console.log("This tool will migrate all ideas from one userId to another.");
  console.log("⚠️  WARNING: This operation cannot be undone!\n");

  const fromUserId = await question("Enter SOURCE userId (ideas will be moved FROM this user): ");
  const toUserId = await question("Enter TARGET userId (ideas will be moved TO this user): ");

  if (!fromUserId || !toUserId) {
    console.log("\n❌ Both userIds are required. Exiting...\n");
    rl.close();
    return;
  }

  if (fromUserId === toUserId) {
    console.log("\n❌ Source and target userId cannot be the same. Exiting...\n");
    rl.close();
    return;
  }

  console.log(`\nYou are about to migrate ideas:`);
  console.log(`  FROM: ${fromUserId}`);
  console.log(`  TO:   ${toUserId}`);

  const confirm = await question('\nType "YES" to confirm: ');

  if (confirm !== "YES") {
    console.log("\n❌ Migration cancelled.\n");
    rl.close();
    return;
  }

  await migrateIdeas(fromUserId, toUserId);
}

main();
