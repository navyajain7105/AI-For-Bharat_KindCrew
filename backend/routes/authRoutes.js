import express from "express";
import {
  handleLogin,
  handleCallback,
  handleLogout,
  getSession,
  refreshSession,
  skipOnboarding,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

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

// Persist user preference to skip onboarding (FTUX)
router.post("/skip-onboarding", authMiddleware, skipOnboarding);

export default router;
