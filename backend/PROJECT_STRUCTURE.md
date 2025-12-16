# McGeorge LX - Project Structure

## 📁 Directory Structure

```
backend/
├── config/                 # Configuration files
│   ├── db.js              # MongoDB connection
│   ├── email.js           # Email service (Gmail)
│   └── passport.js        # OAuth strategies
│
├── controllers/            # Request handlers (business logic)
│   ├── authController.js  # Authentication & 2FA
│   ├── productController.js
│   ├── categoryController.js
│   └── userController.js
│
├── middleware/            # Custom middleware
│   └── auth.js           # JWT verification & admin check
│
├── models/               # Mongoose schemas
│   ├── User.js
│   ├── Product.js
│   ├── Category.js
│   ├── Notification.js
│   └── SearchHistory.js
│
├── routes/               # API route definitions
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   └── userRoutes.js
│
├── docs/                 # Documentation (move here)
│   └── API_DOCUMENTATION.md
│
├── scripts/              # Utility scripts (move here)
│   ├── seed-admin.js
│   └── test-*.js
│
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── package.json          # Dependencies
├── README.md             # Main documentation
└── server.js             # Entry point
```

## 🔄 File Organization

### Documentation Files → `docs/`
- All `.md` files except `README.md`
- API documentation
- Implementation guides
- Setup instructions

### Utility Scripts → `scripts/`
- `seed-admin.js` - Create admin account
- `test-*.js` - Test scripts
- `*-admin.js` - Admin utilities
- `fix-*.js` - Database fix scripts

### Core Application Files
- `server.js` - Main server file
- `config/` - Configuration
- `controllers/` - Business logic
- `models/` - Database schemas
- `routes/` - API endpoints
- `middleware/` - Custom middleware

## 📝 Code Standards

### File Headers
All files should start with a JSDoc comment:
```javascript
/**
 * File Description
 * Brief explanation of what this file does
 */
```

### Naming Conventions
- **Files:** camelCase (e.g., `authController.js`)
- **Functions:** camelCase (e.g., `registerUser`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Models:** PascalCase (e.g., `User`, `Product`)

### Code Organization
1. Imports at the top
2. Constants and configuration
3. Main functions/classes
4. Exports at the bottom

## 🧹 Cleanup Checklist

- [x] Remove commented code
- [x] Add file headers
- [x] Organize documentation
- [x] Organize utility scripts
- [x] Create .gitignore
- [x] Create .env.example
- [x] Update package.json
- [x] Create README.md
- [ ] Move files to docs/ folder
- [ ] Move files to scripts/ folder
- [ ] Update script paths in documentation

## 🚀 Next Steps

1. Run the file organization (see CLEANUP_INSTRUCTIONS.md)
2. Review all code files for consistency
3. Test all endpoints
4. Update any hardcoded paths in scripts
5. Remove temporary files

