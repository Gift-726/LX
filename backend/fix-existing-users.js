// backend/fix-existing-users.js - Update existing users to work with 2FA
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

console.log('🔧 Fixing existing users for 2FA compatibility...\n');

const fixUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // Find all users
        const users = await User.find({});
        console.log(`Found ${users.length} users in database\n`);

        let updated = 0;
        let skipped = 0;

        for (const user of users) {
            const updates = {};
            let needsUpdate = false;

            // If isVerified is undefined or null, set it based on user type
            if (user.isVerified === undefined || user.isVerified === null) {
                // OAuth users (have googleId or facebookId) should be verified
                if (user.googleId || user.facebookId) {
                    updates.isVerified = true;
                    console.log(`  ✅ ${user.email} - OAuth user, marking as verified`);
                    needsUpdate = true;
                }
                // Email/password users without verification code should be verified (legacy users)
                else if (user.password && !user.verificationCode) {
                    updates.isVerified = true;
                    console.log(`  ✅ ${user.email} - Legacy user, marking as verified`);
                    needsUpdate = true;
                }
                // Users with pending verification codes
                else if (user.verificationCode) {
                    updates.isVerified = false;
                    console.log(`  ⏳ ${user.email} - Has pending verification code`);
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await User.findByIdAndUpdate(user._id, updates);
                updated++;
            } else {
                skipped++;
            }
        }

        console.log('\n━'.repeat(60));
        console.log('📊 Summary:');
        console.log(`   Total users: ${users.length}`);
        console.log(`   Updated: ${updated}`);
        console.log(`   Skipped (already correct): ${skipped}`);
        console.log('━'.repeat(60));

        console.log('\n✅ Migration complete!');
        console.log('\n💡 All existing users can now login with 2FA');
        console.log('   - OAuth users: Direct login (already verified by provider)');
        console.log('   - Email/password users: Will receive 2FA code on login');

        await mongoose.connection.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

fixUsers();
