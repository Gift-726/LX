# McGeorge LX - Backend API

A comprehensive e-commerce backend API built with Node.js, Express, and MongoDB. Features secure two-factor authentication (2FA), product management, category organization, and user management.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Gmail account with App Password (for email functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - MongoDB connection string
   - JWT secret
   - Gmail credentials (for 2FA)
   - OAuth credentials (optional)

4. **Set up Gmail App Password**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
   - Generate an App Password for "Mail"
   - Add it to `.env` as `EMAIL_PASSWORD`

5. **Seed the database** (creates admin account)
   ```bash
   # If scripts are in scripts/ folder:
   node scripts/seed-admin.js
   
   # If scripts are still in root:
   node seed-admin.js
   ```

6. **Start the server**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📚 Documentation

Complete API documentation is available in the `docs/` folder:

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Authentication Guide](./docs/AUTHENTICATION_GUIDE.md)** - Authentication flow details
- **[2FA Implementation](./docs/2FA_IMPLEMENTATION_GUIDE.md)** - Two-factor authentication guide

## 🏗️ Project Structure

```
backend/
├── config/           # Configuration files
│   ├── db.js        # Database connection
│   ├── email.js     # Email service configuration
│   └── passport.js  # OAuth strategies
├── controllers/      # Request handlers
│   ├── authController.js
│   ├── productController.js
│   ├── categoryController.js
│   └── userController.js
├── middleware/       # Custom middleware
│   └── auth.js      # Authentication & authorization
├── models/          # Database models
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Notification.js
│   └── SearchHistory.js
├── routes/          # API routes
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   └── userRoutes.js
├── scripts/        # Utility scripts
│   ├── seed-admin.js
│   └── test-*.js
├── docs/           # Documentation
├── server.js       # Main server file
└── package.json    # Dependencies
```

## 🔐 Authentication

The API uses **Two-Factor Authentication (2FA)** for enhanced security:

1. **Registration Flow:**
   - User registers → Receives 6-digit code via email
   - User verifies code → Account activated

2. **Login Flow:**
   - User logs in → Receives 6-digit code via email
   - User verifies code → Login successful

3. **OAuth Support:**
   - Google OAuth
   - Facebook OAuth
   - OAuth users are automatically verified

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-registration` - Verify registration code
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-login` - Verify login code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/facebook` - Facebook OAuth

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/recommended` - Get recommended products
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)

### User
- `GET /api/user/profile` - Get user profile
- `GET /api/user/search-history` - Get search history
- `POST /api/user/search-history` - Save search query
- `DELETE /api/user/search-history` - Clear search history
- `GET /api/user/notifications` - Get notifications
- `GET /api/user/notifications/unread-count` - Get unread count
- `PUT /api/user/notifications/:id/read` - Mark as read

## 🔑 Admin Access

**Default Admin Credentials:**
- Email: `gianosamsung@gmail.com`
- Password: `Admin@McGeorge2024`

> ⚠️ **Important:** Only this email automatically receives admin privileges.

## 🧪 Testing

### Test Email Configuration
```bash
# If scripts are in scripts/ folder:
node scripts/test-gmail-config.js

# If scripts are still in root:
node test-gmail-config.js
```

### Test API Endpoints
```bash
# If scripts are in scripts/ folder:
node scripts/test-api.js

# If scripts are still in root:
node test-api.js
```

### Test 2FA Flow
```bash
# If scripts are in scripts/ folder:
node scripts/test-2fa.js

# If scripts are still in root:
node test-2fa.js
```

## 📦 Dependencies

### Core
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **dotenv** - Environment variables

### Email
- **nodemailer** - Email sending

### OAuth
- **passport** - Authentication middleware
- **passport-google-oauth20** - Google OAuth
- **passport-facebook** - Facebook OAuth

### Utilities
- **cors** - Cross-origin resource sharing
- **nodemon** - Development auto-reload (dev dependency)

## 🔒 Security Features

- ✅ Two-Factor Authentication (2FA)
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Email verification
- ✅ Secure password reset
- ✅ Input validation
- ✅ CORS protection
- ✅ Admin role-based access control

## 📝 Environment Variables

See `.env.example` for all required environment variables.

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_USER` - Gmail address for sending emails
- `EMAIL_PASSWORD` - Gmail App Password

**Optional:**
- `PORT` - Server port (default: 3000)
- `GOOGLE_CLIENT_ID` - For Google OAuth
- `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `FACEBOOK_APP_ID` - For Facebook OAuth
- `FACEBOOK_APP_SECRET` - For Facebook OAuth

## 🛠️ Development

### Running in Development Mode
```bash
npm run dev
```

This uses `nodemon` to automatically restart the server on file changes.

### Code Structure

- **Controllers** - Handle business logic and request/response
- **Models** - Define database schemas
- **Routes** - Define API endpoints
- **Middleware** - Authentication and authorization
- **Config** - Configuration files

## 📄 License

Proprietary - All rights reserved

## 👥 Support

For issues or questions:
- Check the [API Documentation](./docs/API_DOCUMENTATION.md)
- Review the [Authentication Guide](./docs/AUTHENTICATION_GUIDE.md)
- Contact: gianosamsung@gmail.com

---

**Version:** 1.0.0  
**Last Updated:** 2024

