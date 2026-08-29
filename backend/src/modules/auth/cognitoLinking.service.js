import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminDeleteUserCommand,
  AdminLinkProviderForUserCommand,
  AdminGetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import usersService from "../users/users.service.js";
import usersRepository from "../users/users.repository.js";

let defaultCognitoClient = null;

function getCognitoClient() {
  if (!defaultCognitoClient) {
    const region =
      process.env.COGNITO_REGION || process.env.AWS_REGION || "ap-south-1";
    defaultCognitoClient = new CognitoIdentityProviderClient({ region });
  }
  return defaultCognitoClient;
}

export class CognitoLinkingService {
  constructor(repository = usersRepository, service = usersService) {
    this.repository = repository;
    this.service = service;
  }

  /**
   * Google → Email/Password Linking Flow
   * Target user is Google-only. We create a native Cognito user, set password,
   * delete standalone federated user, link Google to native user, and update DB.
   */
  async linkGoogleToPassword(userId, password, options = {}) {
    const cognitoClient = options.cognitoClient || getCognitoClient();
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    if (!password || typeof password !== "string" || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const user = await this.service.getUserById(userId);
    if (!user) throw new Error("User not found");

    const googleProvider = (user.authProviders || []).find(
      (p) => p.type === "google",
    );
    if (!googleProvider) {
      throw new Error("User does not have a connected Google account");
    }

    const hasCognito = (user.authProviders || []).some(
      (p) => p.type === "cognito",
    );
    if (hasCognito) {
      return { success: true, alreadyLinked: true };
    }

    const rawGoogleId = googleProvider.providerId || googleProvider.providerUserId;
    if (!rawGoogleId) {
      throw new Error("Invalid Google provider identity");
    }
    const googleUserId = rawGoogleId.replace(/^Google_/, "");

    const normalizedEmail = (user.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error("User email is required for password linking");
    }

    let state = "NOT_STARTED";
    let nativeSub = null;

    try {
      // Step 1: AdminCreateUser (Create native Cognito profile with email and name attributes)
      const userAttributes = [
        { Name: "email", Value: normalizedEmail },
        { Name: "email_verified", Value: "true" },
      ];
      if (user.givenName) {
        userAttributes.push({ Name: "given_name", Value: user.givenName });
      }
      if (user.familyName) {
        userAttributes.push({ Name: "family_name", Value: user.familyName });
      }
      if (user.name && !user.name.includes("@")) {
        userAttributes.push({ Name: "name", Value: user.name });
      }

      let createUserRes;
      try {
        createUserRes = await cognitoClient.send(
          new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: normalizedEmail,
            UserAttributes: userAttributes,
            MessageAction: "SUPPRESS",
          }),
        );
      } catch (err) {
        if (err.name === "UsernameExistsException") {
          // If native user already exists from a prior attempt, fetch sub
          const existingUser = await cognitoClient.send(
            new AdminGetUserCommand({
              UserPoolId: userPoolId,
              Username: normalizedEmail,
            }),
          );
          nativeSub =
            existingUser.UserAttributes?.find((a) => a.Name === "sub")?.Value ||
            normalizedEmail;
        } else if (
          err.name === "AccessDeniedException" ||
          err.name === "AccessDenied" ||
          err.message?.includes("not authorized to perform")
        ) {
          throw new Error(
            "AWS IAM user is missing cognito-idp:AdminCreateUser permission required for account linking. Please attach the required Cognito admin policy to your IAM role.",
          );
        } else {
          throw err;
        }
      }

      if (!nativeSub && createUserRes?.User) {
        nativeSub =
          createUserRes.User.Attributes?.find((a) => a.Name === "sub")?.Value ||
          normalizedEmail;
      }
      state = "NATIVE_CREATED";

      // Step 2: AdminSetUserPassword
      try {
        await cognitoClient.send(
          new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: normalizedEmail,
            Password: password,
            Permanent: true,
          }),
        );
        state = "PASSWORD_SET";
      } catch (passwordErr) {
        // Rollback native user creation
        try {
          await cognitoClient.send(
            new AdminDeleteUserCommand({
              UserPoolId: userPoolId,
              Username: normalizedEmail,
            }),
          );
        } catch (_ignore) {}
        if (passwordErr.name === "InvalidPasswordException") {
          throw new Error("Password does not meet complexity requirements. Please include uppercase, lowercase, numbers, and symbols.");
        }
        throw passwordErr;
      }

      // Step 3: AdminDeleteUser (delete standalone Google_... federated user)
      try {
        await cognitoClient.send(
          new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: `Google_${googleUserId}`,
          }),
        );
      } catch (deleteErr) {
        if (deleteErr.name !== "UserNotFoundException") {
          // Rollback native user creation
          try {
            await cognitoClient.send(
              new AdminDeleteUserCommand({
                UserPoolId: userPoolId,
                Username: normalizedEmail,
              }),
            );
          } catch (_ignore) {}
          throw deleteErr;
        }
      }
      state = "FEDERATED_REMOVED";

      // Step 4: AdminLinkProviderForUser
      try {
        await cognitoClient.send(
          new AdminLinkProviderForUserCommand({
            UserPoolId: userPoolId,
            DestinationUser: {
              ProviderAttributeValue: normalizedEmail,
              ProviderName: "Cognito",
            },
            SourceUser: {
              ProviderAttributeName: "Cognito_Subject",
              ProviderAttributeValue: googleUserId,
              ProviderName: "Google",
            },
          }),
        );
        state = "GOOGLE_LINKED";
      } catch (linkErr) {
        // Point of no return for Google login! Native profile exists with password.
        // Return recovery result instructing user to login via password & retry Google link.
        return {
          success: true,
          requireReloginWithPassword: true,
          warning:
            "Email & Password credential created successfully, but Google linking encountered an error. Please log in with your email and password.",
          state: "FEDERATED_REMOVED",
        };
      }

      // Step 5: Update DynamoDB User.authProviders
      const updatedAuthProviders = [
        {
          type: "cognito",
          providerId: nativeSub,
          linkedAt: new Date().toISOString(),
        },
        {
          type: "google",
          providerId: googleUserId,
          linkedAt: googleProvider.linkedAt || new Date().toISOString(),
        },
      ];

      await this.repository.update(userId, {
        authProviders: updatedAuthProviders,
      });
      state = "DATABASE_UPDATED";

      return {
        success: true,
        requireRelogin: true,
        state: "COMPLETED",
        message: "Email & Password login added successfully. Please sign in again.",
      };
    } catch (error) {
      console.error(`linkGoogleToPassword failed at state ${state}:`, error.message);
      throw error;
    }
  }

  /**
   * Email/Password → Google Linking Flow
   * Target user is Native Email/Password. OAuth callback passes verified Google userId.
   * We verify no cross-user collision, delete auto-created standalone Google profile,
   * link Google to existing native Cognito profile, and update DB.
   */
  async linkPasswordToGoogle(userId, googleUserId, options = {}) {
    const cognitoClient = options.cognitoClient || getCognitoClient();
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    if (!googleUserId) {
      throw new Error("Google user identifier is required");
    }

    const user = await this.service.getUserById(userId);
    if (!user) throw new Error("User not found");

    const cognitoProvider = (user.authProviders || []).find(
      (p) => p.type === "cognito",
    );
    if (!cognitoProvider) {
      throw new Error("User does not have a native email/password account");
    }

    const existingGoogle = (user.authProviders || []).find(
      (p) => p.type === "google",
    );
    if (existingGoogle && existingGoogle.providerId === googleUserId) {
      return { success: true, alreadyLinked: true };
    }

    // Check cross-user conflict: verify no OTHER KindCrew user owns this Google account
    const conflictingUser = await this.repository.findByProviderIdentity(
      "google",
      googleUserId,
    );
    if (conflictingUser && conflictingUser.userId !== userId) {
      const conflictError = new Error(
        "This Google account is already connected to another KindCrew user account",
      );
      conflictError.code = "GOOGLE_ACCOUNT_CONFLICT";
      throw conflictError;
    }

    const nativeSub = cognitoProvider.providerId || cognitoProvider.providerUserId;
    let state = "NOT_STARTED";

    try {
      // Step 1: AdminDeleteUser (delete standalone Google_... profile auto-created by Cognito during OAuth)
      try {
        await cognitoClient.send(
          new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: `Google_${googleUserId}`,
          }),
        );
      } catch (deleteErr) {
        if (deleteErr.name !== "UserNotFoundException") {
          throw deleteErr;
        }
      }
      state = "FEDERATED_REMOVED";

      // Step 2: AdminLinkProviderForUser
      await cognitoClient.send(
        new AdminLinkProviderForUserCommand({
          UserPoolId: userPoolId,
          DestinationUser: {
            ProviderAttributeValue: nativeSub,
            ProviderName: "Cognito",
          },
          SourceUser: {
            ProviderAttributeName: "Cognito_Subject",
            ProviderAttributeValue: googleUserId,
            ProviderName: "Google",
          },
        }),
      );
      state = "GOOGLE_LINKED";

      // Step 3: Update DynamoDB authProviders
      const existingProviders = (user.authProviders || []).filter(
        (p) => p.type !== "google",
      );
      const updatedAuthProviders = [
        ...existingProviders,
        {
          type: "google",
          providerId: googleUserId,
          linkedAt: new Date().toISOString(),
        },
      ];

      await this.repository.update(userId, {
        authProviders: updatedAuthProviders,
      });
      state = "DATABASE_UPDATED";

      return {
        success: true,
        state: "COMPLETED",
        message: "Google account connected successfully",
      };
    } catch (error) {
      console.error(`linkPasswordToGoogle failed at state ${state}:`, error.message);
      throw error;
    }
  }
}

export default new CognitoLinkingService();
