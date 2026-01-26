/**
 * Passport Configuration
 * OAuth strategies for Google and Facebook authentication
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/* ============================================================
   GOOGLE OAUTH STRATEGY
============================================================ */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_CALLBACK_URL || '',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Check if this email is the admin email
          if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
            return done(new Error('Email not provided by Google'), null);
          }
          
          const isAdmin = profile.emails[0].value.toLowerCase() === 'gianosamsung@gmail.com';

          user = await User.create({
            googleId: profile.id,
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            isVerified: true, // OAuth users are pre-verified by Google
            role: isAdmin ? 'admin' : 'user'
          });
        }

        if (!process.env.JWT_SECRET) {
          return done(new Error('JWT_SECRET is not defined'), null);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d'
        });
        (user as any).token = token;

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
      clientID: process.env.FACEBOOK_APP_ID || '',
      clientSecret: process.env.FACEBOOK_APP_SECRET || '',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || '',
      profileFields: ['id', 'name', 'picture'] // Removed "emails" to avoid scope issues
    },
    async (accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
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
            firstname: profile.name.givenName || 'Facebook',
            lastname: profile.name.familyName || 'User',
            email: email,
            isVerified: true, // OAuth users are pre-verified by Facebook
          });
        }

        if (!process.env.JWT_SECRET) {
          return done(new Error('JWT_SECRET is not defined'), null);
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d'
        });
        (user as any).token = token;

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
