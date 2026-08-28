import { cognitoAuthMiddleware } from "../src/modules/auth/cognitoAuth.middleware.js";
import usersService, {
  IdentityLinkingRequiredError,
} from "../src/modules/users/users.service.js";
import { errorResponse } from "../utils/response.js";

/**
 * Middleware to verify Cognito access tokens and resolve application users.
 */
export const authMiddleware = async (req, res, next) => {
  return cognitoAuthMiddleware(req, res, async () => {
    try {
      const user = await usersService.resolveAuthenticatedUser(req.auth, {
        name: req.auth.email,
      });

      req.user = user;
      req.userId = user.userId;
      req.userEmail = user.email;
      return next();
    } catch (error) {
      if (error instanceof IdentityLinkingRequiredError) {
        return res.status(409).json({
          success: false,
          code: "IDENTITY_LINKING_REQUIRED",
          message: "This email is already associated with another login method.",
        });
      }

      return res.status(401).json(errorResponse("Unauthorized"));
    }
  });
};
