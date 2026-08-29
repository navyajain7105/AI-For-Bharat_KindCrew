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
import { successResponse, errorResponse } from "../utils/response.js";
import cognitoLinkingService from "../src/modules/auth/cognitoLinking.service.js";
import crypto from "crypto";

/** Cognito access tokens are valid for 1 hour by default. */
const COGNITO_ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
/**
 * Refresh the session token this many ms before it actually expires so we
 * never hand the frontend a token that is about to immediately expire.
 */
const SAFETY_WINDOW_MS = 60 * 1000; // 60 seconds

const getFrontendBaseUrl = (req) => {
  const configuredUrl = (process.env.FRONTEND_URL || "").trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

export const handleIdentityLinkingRequired = (res, error, req) => {
  if (error?.code !== "IDENTITY_LINKING_REQUIRED") return false;

  const frontendBaseUrl = req ? getFrontendBaseUrl(req) : (process.env.FRONTEND_URL || "http://localhost:3000");
  res.redirect(
    `${frontendBaseUrl}/?linking=error&reason=${encodeURIComponent(
      "This email is already associated with an existing KindCrew account. Please sign in with your primary account (e.g. Google) first, then connect additional login methods in Settings.",
    )}`,
  );
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

    // ACCOUNT LINKING CALLBACK FLOW
    if (req.session.linkingUserId) {
      const linkingUserId = req.session.linkingUserId;
      delete req.session.linkingUserId;

      try {
        const claims = await verifyCognitoIdToken(
          tokens.idToken,
          req.session.oauthNonce,
        );
        const identity = getVerifiedCognitoIdentity(claims);

        if (identity.provider !== "google") {
          return res.redirect(
            `${frontendBaseUrl}/settings?linking=error&reason=${encodeURIComponent(
              "Account linking requires logging in with Google",
            )}`,
          );
        }

        await cognitoLinkingService.linkPasswordToGoogle(
          linkingUserId,
          identity.providerUserId,
        );

        delete req.session.oauthState;
        delete req.session.oauthNonce;

        return res.redirect(`${frontendBaseUrl}/settings?linking=success`);
      } catch (linkingError) {
        console.error("Account linking callback failed:", linkingError.message);
        delete req.session.oauthState;
        delete req.session.oauthNonce;

        const reason =
          linkingError.code === "GOOGLE_ACCOUNT_CONFLICT"
            ? "This Google account is already connected to another KindCrew user account"
            : linkingError.message;

        return res.redirect(
          `${frontendBaseUrl}/settings?linking=error&reason=${encodeURIComponent(
            reason,
          )}`,
        );
      }
    }

    let user;
    try {
      const claims = await verifyCognitoIdToken(
        tokens.idToken,
        req.session.oauthNonce,
      );
      const identity = getVerifiedCognitoIdentity(claims);
      const resolvedName =
        claims.name ||
        (claims.given_name
          ? `${claims.given_name} ${claims.family_name || ""}`.trim()
          : null) ||
        (claims.email ? claims.email.split("@")[0] : null);

      user = await userService.resolveAuthenticatedUser(
        identity,
        {
          name: resolvedName,
          profileImage: claims.picture || null,
          givenName: claims.given_name || null,
          familyName: claims.family_name || null,
          locale: claims.locale || null,
        },
        { recordLogin: true },
      );
      await userService.addAuthProvider(
        user.userId,
        identity.provider,
        identity.providerUserId,
      );
    } catch (dbError) {
      if (dbError?.code === "LOGIN_METHOD_CONFLICT") {
        return res.redirect(
          `${frontendBaseUrl}/?login_error=method_conflict`,
        );
      }
      if (handleIdentityLinkingRequired(res, dbError, req)) return;

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
      givenName: user.givenName,
      familyName: user.familyName,
      profileImage: user.profileImage,
      settings: user.settings,
    };
    req.session.auth = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + COGNITO_ACCESS_TOKEN_TTL_MS,
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

export const getSession = async (req, res) => {
  if (!req.session.user || !req.session.auth?.accessToken) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  // Hydrate user profile info if missing in session
  if ((!req.session.user.givenName || !req.session.user.name) && req.session.user.userId) {
    try {
      const freshUser = await userService.getUserById(req.session.user.userId);
      if (freshUser) {
        req.session.user = {
          userId: freshUser.userId,
          email: freshUser.email,
          name: freshUser.name || (freshUser.givenName ? `${freshUser.givenName} ${freshUser.familyName || ""}`.trim() : null) || freshUser.email?.split("@")[0],
          givenName: freshUser.givenName,
          familyName: freshUser.familyName,
          profileImage: freshUser.profileImage,
          settings: freshUser.settings,
        };
      }
    } catch (_ignore) {}
  }

  const { accessToken, refreshToken, expiresAt } = req.session.auth;

  // Return the existing token when it is demonstrably still valid.
  if (expiresAt && Date.now() < expiresAt - SAFETY_WINDOW_MS) {
    return res.json({
      success: true,
      data: { user: req.session.user, accessToken },
    });
  }

  // Token is expired or expiry is unknown — attempt a refresh.
  if (!refreshToken) {
    return res.status(401).json(errorResponse("Unauthorized"));
  }

  try {
    const tokens = await refreshCognitoTokens(refreshToken);
    req.session.auth = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: Date.now() + COGNITO_ACCESS_TOKEN_TTL_MS,
    };
    return res.json({
      success: true,
      data: { user: req.session.user, accessToken: tokens.accessToken },
    });
  } catch (error) {
    console.error("Session token refresh failed:", error.message);
    return res.status(401).json(errorResponse("Unauthorized"));
  }
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
      expiresAt: Date.now() + COGNITO_ACCESS_TOKEN_TTL_MS,
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

/**
 * Get user auth provider connections (Checkpoint 2D)
 * GET /api/auth/providers
 */
export const getProviders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", "Session user is required"));
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json(errorResponse("UserNotFound", "User not found"));
    }

    let authProviders = user.authProviders || [];
    const googleProvider = authProviders.find((p) => p.type === "google");
    const cognitoProvider = authProviders.find((p) => p.type === "cognito");

    const hasGoogle = !!googleProvider;

    // Password provider is connected ONLY IF a cognito entry exists AND it was NOT
    // auto-inserted during initial Google signup (which shares the exact same linkedAt timestamp or providerId)
    const isLegacyGoogleArtifact =
      !!googleProvider &&
      !!cognitoProvider &&
      ((cognitoProvider.providerId || cognitoProvider.providerUserId) ===
        (googleProvider.providerId || googleProvider.providerUserId) ||
        (typeof cognitoProvider.linkedAt === "string" &&
          typeof googleProvider.linkedAt === "string" &&
          cognitoProvider.linkedAt === googleProvider.linkedAt) ||
        (typeof cognitoProvider.linkedAt === "string" &&
          typeof user.createdAt === "string" &&
          cognitoProvider.linkedAt === user.createdAt));

    if (isLegacyGoogleArtifact) {
      authProviders = authProviders.filter((p) => p.type !== "cognito");
      try {
        await userService.repository.update(userId, { authProviders });
      } catch (cleanErr) {
        console.warn("Failed to sanitize legacy provider artifact:", cleanErr.message);
      }
    }

    const hasPassword = authProviders.some((p) => p.type === "cognito");

    return res.status(200).json(
      successResponse("Success", {
        providers: [
          { type: "google", connected: hasGoogle },
          { type: "password", connected: hasPassword },
        ],
      })
    );
  } catch (error) {
    console.error("getProviders error:", error);
    return res.status(500).json(errorResponse("InternalServerError", error.message));
  }
};

/**
 * Link Email/Password to a Google-only account
 * POST /api/auth/link-password
 */
export const linkPassword = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json(errorResponse("Unauthorized", "Session user is required"));
    }

    if (req.session?.linkingInProgress) {
      return res.status(409).json(errorResponse("Conflict", "An account linking operation is already in progress"));
    }

    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json(errorResponse("ValidationError", "Password is required"));
    }

    if (req.session) {
      req.session.linkingInProgress = true;
    }

    try {
      const result = await cognitoLinkingService.linkGoogleToPassword(userId, password);
      return res.status(200).json(successResponse("Password linked successfully", result));
    } finally {
      if (req.session) {
        delete req.session.linkingInProgress;
      }
    }
  } catch (error) {
    console.error("linkPassword error:", error.message);
    return res.status(400).json(errorResponse(error.message || "Failed to link password credential", "LinkingError"));
  }
};

/**
 * Initiate Google linking for an Email/Password account.
 * GET /api/auth/link-google
 *
 * This is a browser-navigation endpoint — the browser cannot attach an
 * Authorization header to a top-level GET.  Authentication is performed
 * exclusively via the server-side session cookie.  No client-supplied userId
 * is accepted.
 */
export const linkGoogle = async (req, res) => {
  try {
    const frontendBaseUrl = getFrontendBaseUrl(req);

    // Derive user identity entirely from the session — never from query params
    // or request body.
    const userId = req.session?.user?.userId;
    if (!userId) {
      // Session is absent or expired; send the browser back to the landing page.
      return res.redirect(`${frontendBaseUrl}/?error=session_expired`);
    }

    const state = crypto.randomBytes(16).toString("hex");
    const nonce = crypto.randomBytes(16).toString("hex");

    req.session.linkingUserId = userId;
    req.session.oauthState = state;
    req.session.oauthNonce = nonce;

    const authUrl = getAuthorizationUrl(state, nonce);
    // Redirect the browser directly to Cognito — no JSON round-trip.
    return res.redirect(authUrl);
  } catch (error) {
    console.error("linkGoogle error:", error.message);
    const frontendBaseUrl = getFrontendBaseUrl(req);
    return res.redirect(`${frontendBaseUrl}/?error=linking_failed`);
  }
};
