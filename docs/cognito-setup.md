# AWS Cognito Setup Guide

## Overview

AWS Cognito handles user authentication. We've set up a simple flow that:

1. Frontend redirects to Cognito login
2. User logs in
3. Cognito redirects back with access token
4. Backend exchanges token and creates our API token
5. Frontend stores token and accesses protected routes

---

## Step 1: Create Cognito User Pool

1. Go to [AWS Cognito Console](https://console.aws.amazon.com/cognito/)
2. Click **"Create user pool"**
3. Choose **"Email"** as sign-in option
4. Click **"Next"**

### Recommended Settings:

- **Password policy**: Default is fine
- **Multi-factor authentication**: Optional
- Click **"Next"** through remaining steps

---

## Step 2: Configure App Client

After user pool is created:

1. Go to **App Integration** → **App clients and analytics**
2. Click **"Create app client"**
3. App name: `kindcrew-web`
4. Uncheck "Generate client secret" (since this is frontend)
5. Allowed OAuth flows: Check **"Authorization code grant"**
6. Allowed OAuth scopes: Check **openid**, **profile**, **email**
7. Click **"Create app client"**

Copy the **Client ID** → Add to `.env.local` as `NEXT_PUBLIC_COGNITO_CLIENT_ID`

---

## Step 3: Set Up Cognito Domain

1. Go to **App Integration** → **Domain name**
2. Enter domain name: `kindcrew-{yourname}` (must be unique)
3. Click **"Create domain"**

Wait for domain to be created (2-5 minutes).

Copy domain → Add to `.env.local` as `NEXT_PUBLIC_COGNITO_DOMAIN`

Format: `https://kindcrew-{yourname}.auth.us-east-1.amazoncognito.com`

---

## Step 4: Configure Redirect URLs

1. Go to **App Integration** → **App client settings**
2. Under **Allowed callback URLs**, add:

   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3000/dashboard
   ```

3. Under **Allowed sign-out URLs**, add:

   ```
   http://localhost:3000/login
   ```

4. Click **"Save changes"**

---

## Step 5: Update Backend `.env`

```env
# AWS Cognito
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your_client_id_from_step_2
COGNITO_DOMAIN=kindcrew-{yourname}.auth.us-east-1.amazoncognito.com

# JWT Secret
JWT_SECRET=your-super-secret-key-change-this
```

Find `COGNITO_USER_POOL_ID` in:

- Cognito Console → **General settings** → **User pool ID**
- Format: `us-east-1_XXXXXXXXX`

---

## Step 6: Update Frontend `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_COGNITO_DOMAIN=kindcrew-{yourname}.auth.us-east-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_CLIENT_ID=your_client_id_from_step_2
NEXT_PUBLIC_COGNITO_REGION=us-east-1
```

---

## Step 7: Test the Flow

### Backend Test:

```bash
cd backend
npm run dev
```

Should see:

```
✅ Server is running on http://localhost:5000
```

### Frontend Test:

```bash
cd frontend
npm run dev
```

1. Open `http://localhost:3000/login`
2. Click **"Sign in with AWS Cognito"**
3. You'll be redirected to Cognito login page
4. Create test account or use existing
5. Upon successful login, should redirect to `/dashboard`

---

## Flow Diagram

```
Frontend                Cognito                Backend              Database
   |                      |                        |                    |
   |--Click Login-------->|                        |                    |
   |                      |                        |                    |
   |<-Redirect Login Page-|                        |                    |
   |                      |                        |                    |
   |--Submit Credentials->|                        |                    |
   |                      |                        |                    |
   |<-Code + Redirect-----|                        |                    |
   |                      |                        |                    |
   |--POST /api/auth/cognito (code)------->|      |                    |
   |                                       |      |                    |
   |                                       |--Verify Code->Cognito    |
   |                                       |      |                    |
   |                                       |<--User Info--Cognito     |
   |                                       |      |                    |
   |                                       |--Find/Create User------->|
   |                                       |      |                    |
   |                                       |<--User Created------------|
   |                                       |      |                    |
   |<--JWT Token + User-----|                       |                    |
   |                      |                        |                    |
   |--Store Token & User--|                        |                    |
   |                      |                        |                    |
   |--Redirect /dashboard-|                        |                    |
```

---

## Troubleshooting

### Error: "Invalid client id"

- Check `COGNITO_CLIENT_ID` is correct
- Check app client was created successfully

### Error: "Redirect URI mismatch"

- Add `http://localhost:3000/api/auth/callback` to Allowed callback URLs
- Make sure domain is configured

### Error: "User not found"

- Create a test user in Cognito Console
- Go to **Users and groups** → Create user

### Tests passing but API returns 401

- Check JWT_SECRET is set in backend `.env`
- Verify token is being sent in Authorization header

---

## Protected Routes

To make a route protected:

### Backend:

```javascript
import { authMiddleware } from "../middleware/authMiddleware.js";

router.get("/api/protected-route", authMiddleware, (req, res) => {
  // req.userId is available here
});
```

### Frontend:

```typescript
// In your component
const user = getUser();
if (!user) router.push("/login");
```

---

## Next Steps

1. ✅ Backend running with auth routes
2. ✅ Frontend login page created
3. ✅ Dashboard page created
4. ⏭️ Add content generation endpoints
5. ⏭️ Build content creation UI

Ready to test? Run both servers and visit `http://localhost:3000/login`
