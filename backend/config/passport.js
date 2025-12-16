/**
 * Passport Configuration
 * OAuth strategies for Google and Facebook authentication
 */

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const jwt = require("jsonwebtoken");

/* ============================================================
   GOOGLE OAUTH STRATEGY
============================================================ */



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_REDIRECT_URI,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if this email is the admin email
          const isAdmin = profile.emails[0].value.toLowerCase() === "gianosamsung@gmail.com";

          user = await User.create({
            googleId: profile.id,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            isVerified: true, // OAuth users are pre-verified by Google
            role: isAdmin ? "admin" : "user"
          });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d"
        });
        user.token = token;

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ============================================================
   FACEBOOK OAUTH STRATEGY
============================================================ */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "name", "picture"] // Removed "emails" to avoid scope issues
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists by Facebook ID
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          // Extract email (may not always be available)
          const email = profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : `facebook_${profile.id}@placeholder.com`; // Fallback if no email

          user = await User.create({
            facebookId: profile.id,
            firstname: profile.name.givenName || "Facebook",
            lastname: profile.name.familyName || "User",
            email: email,
            isVerified: true, // OAuth users are pre-verified by Facebook
          });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "7d"
        });
        user.token = token;

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;