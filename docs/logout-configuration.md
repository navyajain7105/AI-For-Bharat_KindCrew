# AWS Cognito Logout Configuration

## Issue Fixed

After clicking logout and logging in again, users were automatically logged back into the previous account without being prompted for credentials.

## Root Cause

1. Frontend only cleared local state (Zustand store)
2. Backend session was not destroyed
3. **Cognito session cookies remained active** - causing automatic re-authentication

## Solution Implemented

### Backend Changes

- Added `handleLogout()` controller that:
  - Destroys Express session
  - Redirects to Cognito's `/logout` endpoint
  - Cognito clears its session cookies
  - Cognito redirects back to login page

### Frontend Changes

- Updated `logout()` in auth store to:
  - Clear Zustand persisted state
  - Clear localStorage completely
  - Redirect to backend logout endpoint

### New Logout Flow

```
User clicks Logout
    ↓
Frontend clears local storage & Zustand state
    ↓
Redirect to: http://localhost:5000/api/auth/logout
    ↓
Backend destroys Express session
    ↓
Backend redirects to Cognito logout:
https://YOUR-DOMAIN.auth.REGION.amazoncognito.com/logout
    ?client_id=YOUR_CLIENT_ID
    &logout_uri=http://localhost:3000/login
    ↓
Cognito clears session cookies
    ↓
Cognito redirects to: http://localhost:3000/login
    ↓
User is fully logged out!
```

## ⚠️ REQUIRED AWS Cognito Configuration

You **MUST** configure the logout URI in your AWS Cognito App Client settings:

### Steps to Configure in AWS Console:

1. **Go to AWS Cognito Console**
   - Navigate to your User Pool: `ap-south-1_AVgAOJlyL`

2. **Select App Integration**
   - Click on "App clients" in the left sidebar
   - Click on your app client: `6sf5ji9pqp4bqgg8i009jtgti3`

3. **Edit Hosted UI Settings**
   - Scroll to "Hosted UI" section
   - Click "Edit"

4. **Add Sign-out URL**
   - Under "Sign-out URL(s)", add:
     - Development: `http://localhost:3000/login`
     - Production: `https://yourdomain.com/login`

5. **Save Changes**
   - Click "Save changes" at the bottom

### Why This is Required

AWS Cognito only allows redirect URLs that are explicitly whitelisted in the app client configuration. If the logout URI is not configured, Cognito will return an error when trying to logout.

## Testing the Logout Flow

### Before Configuration (Current State)

```bash
# After logout, Cognito will show error:
"Invalid logout_uri provided"
```

### After Configuration

```bash
1. Login → Dashboard appears
2. Click Logout button
3. Should redirect through Cognito logout
4. Land on login page
5. Click Login again
6. Should be prompted for credentials (not auto-login!)
```

## Environment Variables Used

The logout functionality uses these existing environment variables:

```env
COGNITO_DOMAIN=https://ap-south-1avgaojlyl.auth.ap-south-1.amazoncognito.com
COGNITO_CLIENT_ID=6sf5ji9pqp4bqgg8i009jtgti3
FRONTEND_URL=http://localhost:3000
```

No new environment variables are needed.

## Code Changes Summary

### Backend

- **authController.js**: Added `handleLogout()` function
- **authRoutes.js**: Added `POST /api/auth/logout` route

### Frontend

- **authSlice.ts**: Updated `logout()` to clear all state and redirect to backend
- **dashboard/page.tsx**: Simplified logout handler (redirect is now handled by auth store)

## Additional Notes

### Session Management

- **Backend Session**: Destroyed on logout via `req.session.destroy()`
- **Cognito Cookies**: Cleared by Cognito's `/logout` endpoint
- **Frontend State**: Cleared by `clearAuth()` and `localStorage.clear()`

### Production Considerations

1. Update logout URI to use HTTPS domain instead of localhost
2. Consider adding a loading state during logout redirect
3. Add error handling for network failures during logout
4. Log logout events for security auditing

### Security Best Practices

- Logout clears all authentication artifacts
- Session timeout should also trigger logout flow
- Consider implementing refresh token revocation
- Monitor for suspicious re-login patterns

## Troubleshooting

### If logout still auto-logs in:

1. Check AWS Cognito logout URI is configured correctly
2. Clear browser cookies manually
3. Check browser dev tools → Application → Cookies → Delete Cognito cookies
4. Verify backend session is being destroyed (check logs)

### If logout shows Cognito error:

- Error: "Invalid logout_uri provided"
- Solution: Add logout URI to AWS Cognito app client settings (see steps above)

### If logout doesn't clear frontend state:

- Check browser console for JavaScript errors
- Verify localStorage is being cleared
- Check Zustand persist configuration
