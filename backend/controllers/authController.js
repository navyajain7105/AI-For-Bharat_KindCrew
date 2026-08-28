import userService from "../services/user.service.js";
import creatorProfileService from "../services/creatorProfile.service.js";
import {
  exchangeCodeForTokens,
  getAuthorizationUrl,
  refreshCognitoTokens,
} from "../utils/cognito.js";
import {
  getVerifiedCognitoIdentity,
} from "../src/modules/auth/auth.identity.js";
import { verifyCognitoIdToken } from "../src/modules/auth/cognitoTokenVerifier.js";
import { errorResponse } from "../utils/response.js";
import crypto from "crypto";

const getFrontendBaseUrl = (req) => {
  const configuredUrl = (process.env.FRONTEND_URL || "").trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

export const handleIdentityLinkingRequired = (res, error) => {
  if (error?.code !== "IDENTITY_LINKING_REQUIRED") return false;

  res.status(409).json({
    success: false,
    code: "IDENTITY_LINKING_REQUIRED",
    message: "This email is already associated with another login method.",
  });
  return true;
};

/**
 * Initiate OAuth login flow - redirect to Cognito
 */
export const handleLogin = (req, res) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");

    req.session.oauthState = state;
    req.session.oauthNonce = nonce;

    const authUrl = getAuthorizationUrl(state, nonce);
    res.redirect(authUrl);
  } catch (error) {
    console.error("Login failed:", error.message);
    const frontendBaseUrl = getFrontendBaseUrl(req);
    res.redirect(`${frontendBaseUrl}?error=login_failed`);
  }
};

/**
 * Handle OAuth callback from Cognito
 */
export const handleCallback = async (req, res) => {
  try {
    const frontendBaseUrl = getFrontendBaseUrl(req);
    const { code, state, error } = req.query;

    if (error) {
      return res.redirect(`${frontendBaseUrl}?error=${error}`);
    }

    if (!state || state !== req.session.oauthState) {
      return res.redirect(`${frontendBaseUrl}?error=invalid_state`);
    }

    if (!code) {
      return res.redirect(`${frontendBaseUrl}?error=missing_code`);
    }

    const tokens = await exchangeCodeForTokens(
      code,
      process.env.COGNITO_REDIRECT_URI,
    );

    let user;
    try {
      const claims = await verifyCognitoIdToken(
        tokens.idToken,
        req.session.oauthNonce,
      );
      const identity = getVerifiedCognitoIdentity(claims);
      user = await userService.resolveAuthenticatedUser(identity, {
        name: claims.name || claims.email,
        profileImage: claims.picture || null,
        givenName: claims.given_name || null,
        familyName: claims.family_name || null,
        locale: claims.locale || null,
      }, { recordLogin: true });
      await userService.addAuthProvider(
        user.userId,
        "cognito",
        identity.providerUserId,
      );
    } catch (dbError) {
      if (handleIdentityLinkingRequired(res, dbError)) return;

      console.error("Database error during callback:", dbError.message);
      return res.status(503).json({
        success: false,
        error: "Authentication could not be completed. Please try again.",
      });
    }

    req.session.user = {
      userId: user.userId,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
    };
    req.session.auth = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    delete req.session.oauthState;
    delete req.session.oauthNonce;

    let redirectPath = "/onboarding";
    if (user.settings?.onboardingSkipped === true) {
      redirectPath = "/dashboard";
    } else {
      try {
        const profile = await creatorProfileService.getProfileByUserId(
          user.userId,
        );
        if (profile) redirectPath = "/dashboard";
      } catch (_error) {
        // Expected when user has not created a profile yet.
      }
    }

    const redirectUrl = `${frontendBaseUrl}${redirectPath}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("Callback failed:", error.message);
    const frontendBaseUrl = getFrontendBaseUrl(req);
    res.redirect(`${frontendBaseUrl}?error=auth_failed`);
  }
};

export const getSession = (req, res) => {
  if (!req.session.user || !req.session.auth?.accessToken) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  return res.json({
    success: true,
    data: {
      user: req.session.user,
      accessToken: req.session.auth.accessToken,
    },
  });
};

export const refreshSession = async (req, res) => {
  try {
    const refreshToken = req.session.auth?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(errorResponse("Unauthorized"));
    }

    const tokens = await refreshCognitoTokens(refreshToken);
    req.session.auth = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };

    return res.json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch (error) {
    console.error("Cognito session refresh failed:", error.message);
    return res.status(401).json(errorResponse("Unauthorized"));
  }
};

/**
 * Handle logout - destroy session and redirect to Cognito logout
 */
export const handleLogout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err.message);
      }
    });

    const cognitoDomain = process.env.COGNITO_DOMAIN;
    const clientId = process.env.COGNITO_CLIENT_ID;
    const logoutUri = getFrontendBaseUrl(req);

    const cognitoLogoutUrl =
      `${cognitoDomain}/logout?` +
      `client_id=${clientId}&` +
      `logout_uri=${encodeURIComponent(logoutUri)}`;

    res.redirect(cognitoLogoutUrl);
  } catch (error) {
    console.error("Logout failed:", error.message);
    const frontendBaseUrl = getFrontendBaseUrl(req);
    res.redirect(frontendBaseUrl);
  }
};

export const skipOnboarding = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    await userService.updateUserSettings(userId, { onboardingSkipped: true });

    if (req.session.user) {
      req.session.user.settings = {
        ...(req.session.user.settings || {}),
        onboardingSkipped: true,
      };
    }

    res.json({ success: true, message: "Onboarding skipped status saved" });
  } catch (error) {
    console.error("skipOnboarding error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
