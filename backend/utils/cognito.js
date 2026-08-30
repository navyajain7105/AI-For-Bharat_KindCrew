import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN;

/**
 * Exchange authorization code for Cognito tokens
 */
export const exchangeCodeForTokens = async (code, redirectUri) => {
  try {
    const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
    const credentials = Buffer.from(
      `${COGNITO_CLIENT_ID}:${COGNITO_CLIENT_SECRET}`,
    ).toString("base64");

    const { data } = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: COGNITO_CLIENT_ID,
        code,
        redirect_uri: redirectUri,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.error(
      "❌ Token exchange failed:",
      error.response?.data || error.message,
    );
    throw error;
  }
};

export const refreshCognitoTokens = async (refreshToken) => {
  try {
    const tokenUrl = `${COGNITO_DOMAIN}/oauth2/token`;
    const credentials = Buffer.from(
      `${COGNITO_CLIENT_ID}:${COGNITO_CLIENT_SECRET}`,
    ).toString("base64");
    const { data } = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: COGNITO_CLIENT_ID,
        refresh_token: refreshToken,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${credentials}`,
        },
      },
    );

    return {
      accessToken: data.access_token,
      idToken: data.id_token,
      refreshToken: data.refresh_token || refreshToken,
    };
  } catch (error) {
    console.error(
      "❌ Cognito token refresh failed:",
      error.response?.status || error.message,
    );
    throw error;
  }
};

/**
 * Generate Cognito authorization URL
 */
export const getAuthorizationUrl = (state, nonce, identityProvider = null) => {
  const redirectUri = process.env.COGNITO_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: COGNITO_CLIENT_ID,
    response_type: "code",
    scope: "openid email profile",
    redirect_uri: redirectUri,
    state,
    nonce,
  });

  if (identityProvider) {
    params.set("identity_provider", identityProvider);
  }

  return `${COGNITO_DOMAIN}/oauth2/authorize?${params.toString()}`;
};
