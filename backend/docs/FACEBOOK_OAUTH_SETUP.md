# 🔵 Facebook OAuth Setup Guide

## ✅ What's Already Done

I've implemented Facebook authentication in your backend with the following changes:

### 1. **Environment Variables** (`.env`)
- Added `FACEBOOK_APP_ID`
- Added `FACEBOOK_APP_SECRET`
- Added `FACEBOOK_CALLBACK_URL`

### 2. **User Model** (`models/User.js`)
- Added `facebookId` field to store Facebook user IDs

### 3. **Passport Configuration** (`config/passport.js`)
- Implemented Facebook OAuth strategy
- Handles user creation and login
- Generates JWT tokens for authenticated users

### 4. **Routes** (`routes/authRoutes.js`)
- Routes are already set up:
  - `GET /api/auth/facebook` - Initiates Facebook login
  - `GET /api/auth/facebook/callback` - Handles Facebook callback

---

## 🚀 Steps to Complete Setup

### Step 1: Create a Facebook App

1. **Go to Facebook Developers**
   - Visit: https://developers.facebook.com/
   - Click "My Apps" → "Create App"

2. **Select App Type**
   - Choose "Consumer" or "Business" (Consumer is recommended for authentication)
   - Click "Next"

3. **Fill in App Details**
   - **App Name**: Your app name (e.g., "McGeorge LX")
   - **App Contact Email**: Your email
   - Click "Create App"

### Step 2: Configure Facebook Login

1. **Add Facebook Login Product**
   - In your app dashboard, find "Add Products"
   - Click "Set Up" on "Facebook Login"

2. **Configure OAuth Settings**
   - Go to: **Facebook Login** → **Settings**
   - Under "Valid OAuth Redirect URIs", add:
     ```
     http://localhost:3000/api/auth/facebook/callback
     ```
   - Click "Save Changes"

### Step 3: Get Your Credentials

1. **Navigate to Settings → Basic**
   - Copy your **App ID**
   - Click "Show" next to **App Secret** and copy it

2. **Update Your `.env` File**
   Replace the placeholder values:
   ```env
   FACEBOOK_APP_ID='YOUR_APP_ID_HERE'
   FACEBOOK_APP_SECRET='YOUR_APP_SECRET_HERE'
   ```

### Step 4: Configure App Domain (Important!)

1. **In Settings → Basic**
   - Add **App Domains**: `localhost`
   - Add **Privacy Policy URL**: (required for production)
   - Add **Terms of Service URL**: (required for production)

2. **Set App Mode**
   - For development: Keep in "Development" mode
   - For production: Switch to "Live" mode (requires app review)

### Step 5: Request Email Permission

1. **Go to App Review → Permissions and Features**
   - Find "email" permission
   - For development, it's automatically available
   - For production, you may need to submit for review

---

## 🧪 Testing Your Implementation

### 1. Start Your Server
```bash
cd "c:\Users\GIFT AYANO\Desktop\giano\McGeorge\LX\backend"
npm run dev
```

### 2. Test Facebook Login Flow

**Option A: Direct Browser Test**
1. Open your browser
2. Navigate to: `http://localhost:3000/api/auth/facebook`
3. You'll be redirected to Facebook login
4. After authentication, you'll be redirected back with a token

**Option B: Using Postman/Thunder Client**
1. Create a GET request to: `http://localhost:3000/api/auth/facebook`
2. Follow the redirect chain
3. Check the final response for the JWT token

### 3. Expected Response
```json
{
  "success": true,
  "message": "Facebook login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "facebookId": "...",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john.doe@example.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "App Not Setup: This app is still in development mode"
**Solution**: Add your Facebook account as a test user:
1. Go to **Roles** → **Test Users**
2. Add your Facebook account

### Issue: "URL Blocked: This redirect failed because the redirect URI is not whitelisted"
**Solution**: 
1. Check that your callback URL in `.env` matches exactly what's in Facebook settings
2. Make sure there are no trailing slashes
3. Verify the protocol (http vs https)

### Issue: "Can't Load URL: The domain of this URL isn't included in the app's domains"
**Solution**:
1. Add `localhost` to App Domains in Settings → Basic
2. Add the callback URL to Valid OAuth Redirect URIs

### Issue: Email is null or undefined
**Solution**:
- Some users may not grant email permission
- The code handles this with a fallback: `facebook_${profile.id}@placeholder.com`
- Consider making email optional or requesting it explicitly

---

## 🔒 Security Best Practices

### For Development
✅ Use `http://localhost:3000` for testing
✅ Keep app in Development mode
✅ Add test users for testing

### For Production
✅ Use HTTPS only (`https://yourdomain.com`)
✅ Submit app for Facebook review
✅ Enable "Require App Secret" in advanced settings
✅ Set up proper privacy policy and terms of service
✅ Rotate your App Secret regularly
✅ Use environment-specific credentials

---

## 📝 API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/facebook` | GET | Initiates Facebook OAuth flow |
| `/api/auth/facebook/callback` | GET | Handles Facebook callback |
| `/api/auth/google` | GET | Initiates Google OAuth flow |
| `/api/auth/google/callback` | GET | Handles Google callback |
| `/api/auth/register` | POST | Traditional email/password registration |
| `/api/auth/login` | POST | Traditional email/password login |

---

## 🎯 Next Steps

1. ✅ Get Facebook App ID and Secret
2. ✅ Update `.env` file with real credentials
3. ✅ Test the authentication flow
4. ⬜ Implement frontend integration
5. ⬜ Add error handling on frontend
6. ⬜ Set up production environment
7. ⬜ Submit for Facebook app review (for production)

---

## 💡 Additional Features to Consider

- **Profile Pictures**: Store user profile pictures from Facebook
- **Account Linking**: Allow users to link Facebook to existing accounts
- **Refresh Tokens**: Implement token refresh mechanism
- **Logout**: Add logout endpoint to invalidate tokens
- **User Profile**: Create endpoint to fetch user profile data

---

## 📞 Support

If you encounter any issues:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is connected
4. Check Facebook app settings match your configuration

**Common Error Messages:**
- `FACEBOOK_APP_ID is not defined` → Update `.env` file
- `User validation failed` → Check User model schema
- `Invalid OAuth redirect URI` → Verify callback URL in Facebook settings
