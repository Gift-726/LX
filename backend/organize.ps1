# File Organization Script for Windows
# Run this script from the backend directory: .\organize.ps1

Write-Host "📁 Organizing McGeorge LX Backend..." -ForegroundColor Cyan
Write-Host ""

# Create directories
if (-not (Test-Path "docs")) {
    New-Item -ItemType Directory -Path "docs" | Out-Null
    Write-Host "✅ Created docs/ directory" -ForegroundColor Green
}

if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" | Out-Null
    Write-Host "✅ Created scripts/ directory" -ForegroundColor Green
}

# Move documentation files
Write-Host ""
Write-Host "📚 Moving documentation files..." -ForegroundColor Yellow

$docsFiles = @(
    "API_DOCUMENTATION.md",
    "2FA_FLOW_DIAGRAM.md",
    "2FA_GMAIL_FIX_SUMMARY.md",
    "2FA_IMPLEMENTATION_GUIDE.md",
    "2FA_LOGIN_FIX.md",
    "2FA_QUICK_REFERENCE.md",
    "2FA_SUMMARY.md",
    "ALTERNATIVE_EMAIL_SOLUTIONS.md",
    "AUTH_QUICK_START.md",
    "AUTHENTICATION_GUIDE.md",
    "EMAIL_FIX_GUIDE.md",
    "EMAIL_IMPORTANCE_GUIDE.md",
    "EMAIL_SYSTEM_FIXED.md",
    "FACEBOOK_OAUTH_SETUP.md",
    "FACEBOOK_QUICK_START.md",
    "GET_ADMIN_TOKEN.md",
    "GMAIL_FIX_GUIDE.md",
    "IMPLEMENTATION_SUMMARY.md",
    "CLEANUP_INSTRUCTIONS.md",
    "PROJECT_STRUCTURE.md"
)

foreach ($file in $docsFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\" -Force
        Write-Host "   ✅ Moved $file" -ForegroundColor Green
    }
}

# Move utility scripts
Write-Host ""
Write-Host "🔧 Moving utility scripts..." -ForegroundColor Yellow

$scriptsFiles = @(
    "test-2fa.js",
    "test-api.js",
    "test-email.js",
    "test-fallback.js",
    "test-gmail-config.js",
    "seed-admin.js",
    "fix-existing-users.js",
    "get-admin-token.js",
    "login-admin.js",
    "update-admin.js"
)

foreach ($file in $scriptsFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\" -Force
        Write-Host "   ✅ Moved $file" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "✅ File organization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 New structure:" -ForegroundColor Cyan
Write-Host "   backend/"
Write-Host "   ├── docs/          (Documentation files)"
Write-Host "   ├── scripts/       (Utility scripts)"
Write-Host "   ├── config/        (Configuration)"
Write-Host "   ├── controllers/   (Request handlers)"
Write-Host "   ├── models/        (Database models)"
Write-Host "   ├── routes/        (API routes)"
Write-Host "   └── middleware/    (Custom middleware)"
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Update script paths in package.json if needed"
Write-Host "   2. Update documentation references"
Write-Host "   3. Review the organized structure"
Write-Host ""

