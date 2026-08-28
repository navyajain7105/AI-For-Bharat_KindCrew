import { errorResponse } from "../../../utils/response.js";
import { getVerifiedCognitoIdentity } from "./auth.identity.js";
import { verifyCognitoToken } from "./cognitoTokenVerifier.js";

export function createCognitoAuthMiddleware(verifyToken = verifyCognitoToken) {
  return async function cognitoAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    return res
      .status(401)
      .json(errorResponse("Unauthorized", "Cognito bearer token required"));
  }

  try {
    const claims = await verifyToken(token);
    req.auth = getVerifiedCognitoIdentity(claims);
    return next();
  } catch (error) {
    return res
      .status(401)
      .json(errorResponse("Unauthorized", error.message));
  }
  };
}

export const cognitoAuthMiddleware = createCognitoAuthMiddleware();
