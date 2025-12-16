# 🎯 Quick Start - Facebook OAuth

## 📋 Checklist

- [ ] Create Facebook App at https://developers.facebook.com/
- [ ] Get App ID and App Secret
- [ ] Update `.env` file with credentials
- [ ] Add callback URL to Facebook settings: `http://localhost:3000/api/auth/facebook/callback`
- [ ] Add `localhost` to App Domains
- [ ] Test the authentication flow

## 🔑 Get Your Credentials

1. **Facebook Developers Console**: https://developers.facebook.com/apps/
2. **Settings → Basic**
   - Copy **App ID**
   - Copy **App Secret** (click "Show")

## ✏️ Update `.env` File

Replace these lines in your `.env` file:

```env
FACEBOOK_APP_ID='YOUR_ACTUAL_APP_ID'
FACEBOOK_APP_SECRET='YOUR_ACTUAL_APP_SECRET'
```

## 🧪 Test It

### Start Server
```bash
npm run dev
```

### Test in Browser
Navigate to: `http://localhost:3000/api/auth/facebook`

### Expected Flow
1. Redirects to Facebook login
2. User logs in with Facebook
3. Facebook redirects back to your app
4. Your app returns JWT token and user data

## 📱 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/auth/facebook` | Start Facebook login |
| `GET /api/auth/facebook/callback` | Facebook callback handler |

## ✅ Success Response

```json
{
  "success": true,
  "message": "Facebook login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "facebookId": "123456789",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com"
  }
}
```

## 🔧 Facebook App Settings

### Valid OAuth Redirect URIs
```
http://localhost:3000/api/auth/facebook/callback
```

### App Domains
```
localhost
```

### Required Permissions
- `email` (automatically requested)
- `public_profile` (default)

## 🚨 Common Issues

| Error | Solution |
|-------|----------|
| "App Not Setup" | Add yourself as test user in Facebook app |
| "URL Blocked" | Check callback URL matches exactly |
| "Can't Load URL" | Add `localhost` to App Domains |
| Missing email | Normal - some users don't share email |

## 📚 Full Documentation

See `FACEBOOK_OAUTH_SETUP.md` for complete setup guide.
