/**
 * Organize Documentation Files
 * Moves all documentation files into organized folders in docs/
 */

const fs = require('fs');
const path = require('path');

const backendDir = __dirname + '/..';
const docsDir = path.join(backendDir, 'docs');

// Create organized folders
const folders = {
  authentication: ['2FA_', 'AUTH_', 'FACEBOOK_', 'GET_ADMIN_TOKEN'],
  email: ['EMAIL_', 'GMAIL_', 'ALTERNATIVE_EMAIL_SOLUTIONS'],
  payment: ['PAYSTACK_', 'TEST_PAYMENT_ENDPOINTS'],
  admin: ['ADMIN_'],
  implementation: ['IMPLEMENTATION_', 'FIGMA_', 'PROFILE_PAGES_IMPLEMENTATION', 'FAVORITES_AND_CATEGORIES_UPDATE', 'TYPESCRIPT_MIGRATION'],
  troubleshooting: ['TROUBLESHOOTING', 'MONGODB_CONNECTION_FIX', 'CLEANUP_', 'VERIFY_SERVER'],
  setup: ['QUICK_START', 'PROJECT_STRUCTURE', 'API_DOCUMENTATION']
};

// Create directories
Object.keys(folders).forEach(folder => {
  const folderPath = path.join(docsDir, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✓ Created directory: docs/${folder}`);
  }
});

// Get all .md files in backend directory (except README.md)
const files = fs.readdirSync(backendDir).filter(file => {
  return file.endsWith('.md') && file !== 'README.md';
});

let movedCount = 0;

// Move files to appropriate folders
files.forEach(file => {
  let moved = false;
  
  for (const [folder, prefixes] of Object.entries(folders)) {
    for (const prefix of prefixes) {
      if (file.startsWith(prefix)) {
        const sourcePath = path.join(backendDir, file);
        const destPath = path.join(docsDir, folder, file);
        
        try {
          fs.renameSync(sourcePath, destPath);
          console.log(`✓ Moved ${file} → docs/${folder}/`);
          moved = true;
          movedCount++;
          break;
        } catch (error) {
          console.error(`✗ Error moving ${file}:`, error.message);
        }
      }
    }
    if (moved) break;
  }
  
  if (!moved) {
    console.log(`⚠ Skipped ${file} (no matching category)`);
  }
});

console.log(`\n✅ Organization complete! Moved ${movedCount} files.`);
