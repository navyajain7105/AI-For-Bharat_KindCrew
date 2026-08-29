import express from "express";
import {
  handleLogin,
  handleCallback,
  handleLogout,
  getSession,
  refreshSession,
  skipOnboarding,
  getProviders,
  linkPassword,
  linkGoogle,
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

// GET /api/auth/providers - Get user auth provider connections (Checkpoint 2D)
router.get("/providers", authMiddleware, getProviders);

// Account Linking routes (Checkpoint 2E)
router.post("/link-password", authMiddleware, linkPassword);
// link-google is a browser-navigation redirect that authenticates via session
// cookie — it cannot use the Bearer-token authMiddleware.
router.get("/link-google", linkGoogle);

export default router;
