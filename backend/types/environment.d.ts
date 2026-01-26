/**
 * Environment variable type definitions
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Server Configuration
    PORT?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    
    // Database
    MONGO_URI: string;
    
    // JWT
    JWT_SECRET: string;
    
    // Email Configuration
    EMAIL_USER: string;
    EMAIL_PASSWORD: string;
    
    // OAuth - Google
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_CALLBACK_URL?: string;
    
    // OAuth - Facebook
    FACEBOOK_APP_ID?: string;
    FACEBOOK_APP_SECRET?: string;
    FACEBOOK_CALLBACK_URL?: string;
    
    // Paystack
    PAYSTACK_SECRET_KEY?: string;
    PAYSTACK_PUBLIC_KEY?: string;
  }
}
