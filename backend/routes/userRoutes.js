import { Router } from "express";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import docClient, { usersTable } from "../config/dynamodb.js";

const router = Router();

/**
 * GET /api/users/list
 * List all users with their auth providers
 * ⚠️ DEVELOPMENT ONLY - Remove this endpoint in production!
 */
router.get("/list", async (req, res) => {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: usersTable,
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return res.json({
        success: true,
        message: "No users found",
        users: [],
        total: 0,
      });
    }

    // Format user data for better readability
    const users = result.Items.map((user) => ({
      userId: user.userId,
      email: user.email,
      name: user.name || null,
      givenName: user.givenName || null,
      familyName: user.familyName || null,
      profileImage: user.profileImage || null,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified || false,
      authProviders: user.authProviders || [],
      loginHistory: user.loginHistory || [],
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    }));

    res.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message,
    });
  }
});

export default router;
