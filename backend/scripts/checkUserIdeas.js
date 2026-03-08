import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import dotenv from "dotenv";

dotenv.config();

const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "KindCrew-ContentIdeas";

async function checkAllIdeas() {
  try {
    console.log("\n📊 Checking all ideas in database...\n");

    const command = new ScanCommand({
      TableName: TABLE_NAME,
    });

    const result = await docClient.send(command);
    
    if (!result.Items || result.Items.length === 0) {
      console.log("❌ No ideas found in database");
      return;
    }

    console.log(`✅ Found ${result.Items.length} ideas:\n`);
    
    // Group by userId
    const userIdMap = {};
    
    result.Items.forEach((item) => {
      const userId = item.userId?.S || "unknown";
      if (!userIdMap[userId]) {
        userIdMap[userId] = [];
      }
      userIdMap[userId].push({
        ideaId: item.ideaId?.S || "unknown",
        topic: item.topic?.S || "unknown",
        platform: item.platform?.S || "unknown",
        createdAt: item.createdAt?.S || "unknown",
      });
    });

    // Display grouped by userId
    Object.entries(userIdMap).forEach(([userId, ideas]) => {
      console.log(`\n👤 userId: ${userId}`);
      console.log(`   Ideas count: ${ideas.length}`);
      ideas.forEach((idea, index) => {
        console.log(`   ${index + 1}. ${idea.topic.substring(0, 60)}...`);
        console.log(`      Platform: ${idea.platform} | Created: ${idea.createdAt}`);
      });
    });

    console.log("\n");
  } catch (error) {
    console.error("❌ Error checking ideas:", error.message);
  }
}

checkAllIdeas();
