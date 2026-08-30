import { cognitoAuthMiddleware } from "../src/modules/auth/cognitoAuth.middleware.js";
import usersService, {
  IdentityLinkingRequiredError,
  LoginMethodConflictError,
} from "../src/modules/users/users.service.js";
import { errorResponse } from "../utils/response.js";

/**
 * Middleware to verify Cognito access tokens and resolve application users.
 */
export const authMiddleware = async (req, res, next) => {
  return cognitoAuthMiddleware(req, res, async () => {
    try {
      let user = null;

      // Fast path: if the session cookie already resolved the application user
      if (req.session?.user?.userId) {
        const sessionUser = await usersService.getUserById(req.session.user.userId);
        if (sessionUser) {
          user = sessionUser;
        }
      }

      // Fallback: resolve from verified Cognito token identity claims
      if (!user) {
        user = await usersService.resolveAuthenticatedUser(req.auth, {
          name: req.auth.email,
        });
      }

      req.user = user;
      req.userId = user.userId;
      req.userEmail = user.email;
      return next();
    } catch (error) {
      if (error instanceof IdentityLinkingRequiredError || error instanceof LoginMethodConflictError) {
        return res.status(409).json({
          success: false,
          code: error.code,
          message: error instanceof LoginMethodConflictError
            ? "This email is already connected to a different login method."
            : "This email is already associated with another login method.",
        });
      }

      console.error("❌ authMiddleware failed to resolve user:", error.message);
      return res.status(401).json(errorResponse("Unauthorized", error.message));
    }
  });
};
