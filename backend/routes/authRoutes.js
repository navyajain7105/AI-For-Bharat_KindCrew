import express from "express";
import {
  handleLogin,
  handleCallback,
  handleLogout,
  getSession,
  refreshSession,
} from "../controllers/authController.js";

const router = express.Router();

// GET /api/auth/login - Initiate OAuth flow
router.get("/login", handleLogin);

// GET /api/auth/callback - Handle Cognito callback
router.get("/callback", handleCallback);

// GET /api/auth/logout - Logout and clear Cognito session (changed to GET for redirect)
router.get("/logout", handleLogout);

// Bootstrap and refresh Cognito access tokens without URL transport.
router.get("/session", getSession);
router.post("/refresh", refreshSession);

export default router;
