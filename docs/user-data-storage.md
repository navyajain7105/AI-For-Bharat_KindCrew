# User Data Storage on Login

## Overview

When a user logs in via AWS Cognito OAuth, their complete profile is automatically stored in the DynamoDB `KindCrew-Users` table.

## User Data Stored

### Basic Profile Information

- **userId** - Unique identifier (UUID generated at account creation)
- **email** - User's email address from Cognito
- **name** - Full name from Cognito profile
- **givenName** - First name from Cognito
- **familyName** - Last name from Cognito
- **profileImage** - Avatar/profile picture URL
- **emailVerified** - Whether email is verified in Cognito
- **locale** - User's language/region preference

### Account Information

- **role** - User's role (default: "user")
- **status** - Account status (default: "active")
- **authProviders** - Authentication methods linked to account
  - type: "cognito"
  - providerId: Cognito user ID (from token's `sub` claim)
  - linkedAt: Timestamp when provider was linked

### Timestamps

- **createdAt** - When the account was first created
- **lastLogin** - Most recent login timestamp
- **updatedAt** - When user data was last updated

### Login History

- **loginHistory** - Array of login records, each containing:
  - timestamp: ISO 8601 timestamp of login
  - loginMethod: "cognito" (for future support of multiple auth methods)

## Storage Flow

### Step 1: Token Exchange

```
1. User clicks "Login"
2. Browser redirects to Cognito authorization endpoint
3. User authenticates with Cognito credentials
4. Cognito redirects back with authorization code
```

### Step 2: Backend Processing

```
1. Backend exchanges code for tokens:
   - Access Token (for API calls)
   - ID Token (contains user info)
   - Refresh Token (for token renewal)

2. Backend decodes ID Token and extracts:
   - sub (cognitoId) → providerId
   - email → email
   - name → name
   - given_name → givenName
   - family_name → familyName
   - picture → profileImage
   - email_verified → emailVerified
   - locale → locale

3. Checks if user exists in database:
   - If NEW user → Creates new record with all fields
   - If EXISTING user → Updates fields + records login
```

### Step 3: Database Storage

```
INSERT or UPDATE in KindCrew-Users table:
{
  userId: "550e8400-e29b-41d4-a716-446655440000",
  email: "user@example.com",
  name: "Jane Doe",
  givenName: "Jane",
  familyName: "Doe",
  profileImage: "https://..../profile.jpg",
  emailVerified: true,
  locale: "en-US",
  role: "user",
  status: "active",
  authProviders: [
    {
      type: "cognito",
      providerId: "ap-south-1:12345678-1234-1234-1234-123456789012",
      linkedAt: "2026-03-02T12:34:56.789Z"
    }
  ],
  loginHistory: [
    {
      timestamp: "2026-03-02T12:34:56.789Z",
      loginMethod: "cognito"
    },
    {
      timestamp: "2026-03-02T13:45:00.123Z",
      loginMethod: "cognito"
    }
  ],
  createdAt: "2026-03-02T12:34:56.789Z",
  lastLogin: "2026-03-02T13:45:00.123Z",
  updatedAt: "2026-03-02T13:45:00.123Z"
}
```

## Files Modified

1. **backend/utils/cognito.js**
   - Enhanced `getCognitoUser()` to extract additional attributes from JWT
   - Now captures: givenName, familyName, emailVerified, locale, updatedAt

2. **backend/controllers/authController.js**
   - Updated to pass all extracted fields to user service
   - Enhanced fallback user object with new fields

3. **backend/services/user.service.js**
   - Updated `createUser()` to handle additional fields
   - Updated `findOrCreateUser()` to record login on existing users
   - New method: `updateUserOnLogin()` for tracking logins

4. **backend/services/dynamodb.service.js**
   - Enhanced to store all new user fields
   - Added `updateUserOnLogin()` method for login history
   - Tracks lastLogin and appends to loginHistory array

## Error Handling

If database operations fail during login:

1. Backend creates a temporary mock user object with extracted Cognito data
2. User is still able to login and receive JWT token
3. Frontend doesn't know about the DB failure (transparent fallback)
4. Next login attempt will retry the database operation

## Security Notes

- **ID Token**: Trusted because it comes from AWS Cognito OAuth flow
- **Email Verification**: Status is stored from Cognito's verification
- **No Sensitive Data**: Passwords and secrets are NOT stored (handled by Cognito)
- **Auth Providers**: Linked provider IDs allow detecting multiple auth methods

## Next Steps (Optional Enhancements)

1. **Multiple Auth Methods**: Link Google/GitHub to same Cognito account
2. **Login Analytics**: Query loginHistory for user engagement metrics
3. **Account Recovery**: Use lastLogin to identify inactive accounts
4. **Profile Completion**: Prompt users to fill missing fields on first login
5. **Social Features**: Use givenName, familyName for improved UX
