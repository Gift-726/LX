# Codebase Cleanup Instructions

This file contains instructions for organizing the codebase. Run these commands from the `backend` directory.

## Step 1: Create Directories

```bash
mkdir docs
mkdir scripts
```

## Step 2: Move Documentation Files

Move all `.md` files (except README.md) to the `docs/` folder:

```bash
# Windows (PowerShell)
Get-ChildItem -Filter "*.md" -Exclude "README.md" | Move-Item -Destination "docs\"

# Or manually move:
# - API_DOCUMENTATION.md → docs/
# - 2FA_*.md → docs/
# - AUTH_*.md → docs/
# - EMAIL_*.md → docs/
# - FACEBOOK_*.md → docs/
# - GMAIL_*.md → docs/
# - GET_*.md → docs/
# - IMPLEMENTATION_*.md → docs/
```

## Step 3: Move Utility Scripts

Move test and utility scripts to the `scripts/` folder:

```bash
# Windows (PowerShell)
Move-Item -Path "test-*.js" -Destination "scripts\"
Move-Item -Path "*-admin.js" -Destination "scripts\"
Move-Item -Path "fix-*.js" -Destination "scripts\"
Move-Item -Path "get-*.js" -Destination "scripts\"
Move-Item -Path "update-*.js" -Destination "scripts\"
Move-Item -Path "seed-*.js" -Destination "scripts\"
```

## Step 4: Update Script Paths

After moving scripts, update any references in:
- `package.json` scripts
- Documentation files
- README.md

## Step 5: Remove Unnecessary Files

Delete these files if they exist:
- `organize-files.js` (temporary script)
- `config/email-gmail-only.js` (unused alternative config)

## Final Structure

```
backend/
├── config/
│   ├── db.js
│   ├── email.js
│   └── passport.js
├── controllers/
│   ├── authController.js
│   ├── categoryController.js
│   ├── productController.js
│   └── userController.js
├── docs/                    # All documentation
│   ├── API_DOCUMENTATION.md
│   └── ...
├── middleware/
│   └── auth.js
├── models/
│   ├── Category.js
│   ├── Notification.js
│   ├── Product.js
│   ├── SearchHistory.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── categoryRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
├── scripts/                 # Utility scripts
│   ├── seed-admin.js
│   ├── test-*.js
│   └── ...
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

