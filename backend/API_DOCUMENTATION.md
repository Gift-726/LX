# LX - Complete API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Last Updated:** January 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication & Security](#authentication--security)
4. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Products](#products-endpoints)
   - [Categories](#categories-endpoints)
   - [User Management](#user-management-endpoints)
   - [Shopping Cart](#shopping-cart-endpoints)
   - [Orders](#orders-endpoints)
   - [Addresses](#addresses-endpoints)
   - [Shipping](#shipping-endpoints)
   - [Discounts](#discounts-endpoints)
   - [Reviews](#reviews-endpoints)
   - [Payments](#payments-endpoints)
   - [Banners](#banners-endpoints)
   - [Disputes](#disputes-endpoints)
   - [Terms & Conditions](#terms--conditions-endpoints)
   - [Content](#content-endpoints)
   - [Admin Endpoints](#admin-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Frontend Integration Guide](#frontend-integration-guide)
8. [Best Practices](#best-practices)
9. [Testing](#testing)
10. [TypeScript Types](#typescript-types)

---

## Introduction

### What is LX API?

LX is a comprehensive e-commerce backend API that provides secure authentication, product management, category organization, and user features. The API is designed with security in mind, featuring two-factor authentication (2FA) for all user accounts.

### Key Features

- **Two-Factor Authentication (2FA)** - Secure login and registration with email verification
- **Gmail Integration** - Professional email delivery for verification codes
- **OAuth Support** - Google and Facebook social login
- **Password Reset** - Secure password recovery via email
- **Product Management** - Full CRUD operations for products with search, filtering, and badges
- **Product Variants** - Size and color variants with individual stock tracking
- **Category Management** - Hierarchical category system with 11 default categories
- **User Profiles** - User information and preferences with last selected category tracking
- **Search Functionality** - Advanced product search with automatic history saving
- **Search History** - Automatic tracking of user search queries
- **Favorites System** - Save and manage favorite products
- **Shopping Cart** - Full cart management with variant support
- **Order Management** - Complete order processing with status tracking
- **Address Management** - Multiple shipping addresses with default selection
- **Shipping Methods** - Multiple shipping options with cost calculation
- **Discount Codes** - Flexible discount system with validation
- **Reviews & Ratings** - Product reviews and rating system
- **Payment Integration** - Payment processing and verification
- **Notifications** - User notification system
- **Featured Products** - Highlight special offers and featured items
- **Product Badges** - Dynamic badges (HOT, NEW, SALE, LIMITED) based on product properties
- **Banners** - Promotional banner management
- **Disputes** - Order dispute management
- **Admin Dashboard** - Comprehensive admin panel with analytics
- **Reports** - Sales and analytics reports with export functionality

### Who Can Use This Documentation?

- **Frontend Developers** - Integrate the API into web or mobile applications with ready-to-use code examples
- **Backend Developers** - Understand the API structure, data models, and data flow
- **Full-Stack Developers** - Complete reference for both frontend and backend integration
- **Project Managers** - Understand system capabilities, features, and requirements
- **QA Testers** - Test API endpoints and functionality with detailed examples
- **Non-Technical Stakeholders** - Understand what the system can do and its features

### Documentation Highlights

- ✅ **Complete API Reference** - All endpoints documented with examples
- ✅ **Frontend Integration Guide** - Ready-to-use code examples in TypeScript/JavaScript
- ✅ **TypeScript Types** - Full type definitions for all models and responses
- ✅ **Data Models** - Complete schema documentation for all entities
- ✅ **Error Handling** - Comprehensive error scenarios and handling
- ✅ **Best Practices** - Industry-standard integration patterns
- ✅ **Product Variants** - Complete variant management documentation

---

## Getting Started

### Quick Start for Frontend Developers

If you're a frontend developer looking to integrate with the API:

1. **Ensure the backend server is running** on `http://localhost:3000`
2. **Check server health**: `GET /health`
3. **Review the [Frontend Integration Guide](#frontend-integration-guide)** for code examples
4. **Check [TypeScript Types](#typescript-types)** for type definitions
5. **Start with Authentication**: Register/Login endpoints require 2FA (two-step process)

### Common Integration Patterns

- **Authentication Flow**: Register → Verify → Login → Verify → Get Token
- **Product Browsing**: Get Categories → Get Products by Category → Get Product Details
- **Shopping Flow**: Add to Cart → Get Cart → Create Order → Process Payment
- **User Features**: Profile Management → Addresses → Orders → Favorites

### Prerequisites

Before using the API, ensure you have:

1. **Node.js** installed (v14 or higher)
2. **MongoDB** database running
3. **Gmail Account** with App Password configured (for email functionality)
4. **Environment Variables** set up in `.env` file

### Quick Setup

#### Step 1: Install Dependencies
```bash
cd backend
npm install
```

#### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/lx
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lx

# JWT Secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Gmail Configuration (Required for 2FA)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password

# OAuth (Optional - for Google/Facebook login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

**Gmail Setup:** To get an App Password, go to [Google App Passwords](https://myaccount.google.com/apppasswords) and generate one for "Mail".

#### Step 3: Seed the Database

Create the admin account:
```bash
node backend/seed-admin.js
```

Seed default categories (11 categories):
```bash
node backend/scripts/seedCategories.js
```

Seed products for categories (5-8 products per category):
```bash
node backend/scripts/seedProducts.js
```

> **Note:** Make sure your `MONGO_URI` is set in the `.env` file before running seed scripts.

#### Step 4: Start the Server
```bash
node backend/server.js
```

The server will start on `http://localhost:3000`

#### Step 5: Test the API
```bash
node backend/test-api.js
```

#### Step 6: Verify Server Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

---

## Authentication & Security

### Overview

LX uses **Two-Factor Authentication (2FA)** for enhanced security. This means:

1. Users must verify their email during registration
2. Users must verify their email during login
3. All verification codes are sent via email
4. Codes expire after 10 minutes

### Authentication Flow

#### Registration Flow (2 Steps)

```
Step 1: User submits registration form
   ↓
System creates account (unverified)
   ↓
System sends 6-digit code to email
   ↓
Step 2: User enters verification code
   ↓
System verifies code and activates account
   ↓
User receives JWT token (logged in)
```

#### Login Flow (2 Steps)

```
Step 1: User enters email and password
   ↓
System validates credentials
   ↓
System sends 6-digit code to email
   ↓
Step 2: User enters verification code
   ↓
System verifies code
   ↓
User receives JWT token (logged in)
```

### JWT Tokens

After successful authentication, users receive a **JSON Web Token (JWT)** that must be included in subsequent requests.

**Token Format:**
```
Authorization: Bearer <your-jwt-token>
```

**Token Expiry:** 7 days

**How to Use:**
Include the token in the `Authorization` header of protected requests:
```http
GET /api/user/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Admin Access

**Admin Email:** `gianosamsung@gmail.com`  
**Admin Password:** `Admin@LX2024`

**Important:** Only this email address automatically receives admin privileges. All other users are regular users.

**Admin Capabilities:**
- Create, update, and delete products
- Create, update, and delete categories
- Full access to all endpoints

---

## API Endpoints

### Base URL

All API endpoints start with: `http://localhost:3000/api`

### Health Check

- `GET /health` - Server health status (no `/api` prefix)

### Quick Reference - All Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user (Step 1)
- `POST /api/auth/verify-registration` - Verify registration code (Step 2)
- `POST /api/auth/login` - Login user (Step 1)
- `POST /api/auth/verify-login` - Verify login code (Step 2)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-code` - Verify reset code (optional)
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/facebook` - Facebook OAuth login

#### Products (`/api/products`)
- `GET /api/products` - Get all products (with search, filters, pagination)
- `GET /api/products/featured` - Get featured products
- `GET /api/products/recommended` - Get recommended products
- `GET /api/products/:id` - Get product by ID (includes variants)
- `GET /api/products/admin/all` - Get all products with admin details (Admin only)
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

#### Categories (`/api/categories`)
- `GET /api/categories` - Get all categories
- `GET /api/categories/top-level` - Get top-level categories only
- `GET /api/categories/active` - Get user's active category (last selected or first)
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

#### User Management (`/api/user`)
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/search-history` - Get search history
- `POST /api/user/search-history` - Save search history (optional, auto-saved on search)
- `DELETE /api/user/search-history` - Clear search history
- `GET /api/user/notifications` - Get notifications
- `GET /api/user/notifications/unread-count` - Get unread notification count
- `PUT /api/user/notifications/:id/read` - Mark notification as read
- `GET /api/user/favorites` - Get favorites
- `POST /api/user/favorites` - Add to favorites
- `DELETE /api/user/favorites/:id` - Remove from favorites

#### Shopping Cart (`/api/cart`)
- `GET /api/cart` - Get cart with all items and totals
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item quantity
- `DELETE /api/cart/:id` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

#### Orders (`/api/orders`)
- `POST /api/orders` - Create order from cart
- `GET /api/orders` - Get user's orders (with filters)
- `GET /api/orders/:id` - Get order by ID
- `GET /api/orders/number/:orderNumber` - Get order by order number
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)

#### Addresses (`/api/addresses`)
- `GET /api/addresses` - Get all user addresses
- `GET /api/addresses/:id` - Get address by ID
- `POST /api/addresses` - Create new address
- `PUT /api/addresses/:id` - Update address
- `PUT /api/addresses/:id/default` - Set as default address
- `DELETE /api/addresses/:id` - Delete address

#### Shipping (`/api/shipping`)
- `GET /api/shipping` - Get all active shipping methods
- `GET /api/shipping/:id` - Get shipping method by ID
- `POST /api/shipping/calculate` - Calculate shipping cost
- `POST /api/shipping` - Create shipping method (Admin only)
- `PUT /api/shipping/:id` - Update shipping method (Admin only)
- `DELETE /api/shipping/:id` - Delete shipping method (Admin only)

#### Discounts (`/api/discounts`)
- `POST /api/discounts/validate` - Validate discount code (public)
- `POST /api/discounts/apply` - Apply discount code (authenticated)
- `GET /api/discounts` - Get all discount codes (Admin only)
- `POST /api/discounts` - Create discount code (Admin only)
- `PUT /api/discounts/:id` - Update discount code (Admin only)
- `DELETE /api/discounts/:id` - Delete discount code (Admin only)

#### Reviews (`/api/reviews`)
- `GET /api/reviews/product/:productId` - Get reviews for a product (public)
- `POST /api/reviews` - Create review (authenticated)
- `GET /api/reviews/my-reviews` - Get user's reviews (authenticated)
- `PUT /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)
- `GET /api/reviews/admin/all` - Get all reviews (Admin only)
- `PUT /api/reviews/:id/status` - Update review status (Admin only)

#### Payments (`/api/payments`)
- `POST /api/payments/initialize` - Initialize payment (authenticated)
- `GET /api/payments/verify/:reference` - Verify payment (authenticated)
- `GET /api/payments/status/:orderId` - Get payment status (authenticated)
- `POST /api/payments/refund/:orderId` - Refund payment (Admin only)

#### Banners (`/api/banners`)
- `GET /api/banners/active` - Get active banners (public)
- `GET /api/banners` - Get all banners (Admin only)
- `GET /api/banners/:id` - Get banner by ID (Admin only)
- `GET /api/banners/:id/preview` - Preview banner (Admin only)
- `POST /api/banners` - Create banner (Admin only)
- `PUT /api/banners/:id` - Update banner (Admin only)
- `DELETE /api/banners/:id` - Delete banner (Admin only)

#### Disputes (`/api/disputes`)
- `POST /api/disputes` - Create dispute (authenticated)
- `GET /api/disputes` - Get user's disputes (authenticated)
- `GET /api/disputes/:id` - Get dispute by ID (authenticated)
- `GET /api/disputes/admin/all` - Get all disputes (Admin only)
- `PUT /api/disputes/:id/status` - Update dispute status (Admin only)

#### Terms & Conditions (`/api/terms`)
- `GET /api/terms/active` - Get active terms (public)
- `GET /api/terms` - Get all terms (Admin only)
- `GET /api/terms/:id` - Get terms by ID (Admin only)
- `POST /api/terms` - Create terms (Admin only)
- `PUT /api/terms/:id` - Update terms (Admin only)
- `DELETE /api/terms/:id` - Delete terms (Admin only)

#### Content (`/api/content`)
- `GET /api/content/help-center` - Get help center content (public)
- `GET /api/content/privacy-policy` - Get privacy policy (public)

#### Admin Dashboard (`/api/admin/dashboard`)
- `GET /api/admin/dashboard` - Get dashboard data (Admin only)
- `GET /api/admin/dashboard/overview` - Get dashboard overview (Admin only)
- `GET /api/admin/dashboard/sales-trend` - Get sales trend (Admin only)
- `GET /api/admin/dashboard/popular-items` - Get popular items (Admin only)

#### Admin User Management (`/api/admin/users`)
- `GET /api/admin/users` - Get all users (Admin only)
- `POST /api/admin/users` - Create user (Admin only)
- `GET /api/admin/users/:id` - Get user by ID (Admin only)
- `PUT /api/admin/users/:id` - Update user (Admin only)
- `PUT /api/admin/users/:id/suspend` - Suspend user (Admin only)
- `PUT /api/admin/users/:id/unsuspend` - Unsuspend user (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)
- `GET /api/admin/users/suspended` - Get suspended users (Admin only)
- `GET /api/admin/users/suspended/count` - Get suspended users count (Admin only)

#### Admin Reports (`/api/admin/reports`)
- `GET /api/admin/reports` - Get reports (Admin only)
- `GET /api/admin/reports/overview` - Get reports overview (Admin only)
- `GET /api/admin/reports/revenue-chart` - Get revenue chart data (Admin only)
- `GET /api/admin/reports/sales-trend-chart` - Get sales trend chart (Admin only)
- `GET /api/admin/reports/user-engagement-chart` - Get user engagement chart (Admin only)
- `GET /api/admin/reports/export/pdf` - Export reports as PDF (Admin only)
- `GET /api/admin/reports/export/excel` - Export reports as Excel (Admin only)

#### Admin Reviews (`/api/admin/reviews`)
- `GET /api/admin/reviews/overview` - Get reviews overview (Admin only)
- `GET /api/admin/reviews` - Get all reviews and feedback (Admin only)
- `PUT /api/admin/reviews/:id/reply` - Reply to review (Admin only)

#### Admin Notifications (`/api/admin/notifications`)
- `GET /api/admin/notifications` - Get all notifications (Admin only)
- `POST /api/admin/notifications` - Create notification (Admin only)
- `PUT /api/admin/notifications/:id` - Update notification (Admin only)
- `POST /api/admin/notifications/:id/send` - Send notification (Admin only)
- `DELETE /api/admin/notifications/:id` - Delete notification (Admin only)

#### System Settings (`/api/admin/settings`)
- `GET /api/admin/settings` - Get system settings (Admin only)
- `PUT /api/admin/settings` - Update system settings (Admin only)

#### Page Restrictions (`/api/admin/page-restrictions`)
- `GET /api/admin/page-restrictions` - Get all page restrictions (Admin only)
- `GET /api/admin/page-restrictions/:pageName` - Get page restriction (Admin only)
- `GET /api/admin/page-restrictions/check/:pageName` - Check page access (authenticated)
- `PUT /api/admin/page-restrictions/:pageName` - Update page restriction (Admin only)

---

## Authentication Endpoints

Base Path: `/api/auth`

### 1. Register User (Step 1: Initiate Registration)

**What it does:** Creates a new user account and sends a 6-digit verification code to their email.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Not required (public endpoint)

**Request Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Field Requirements:**
- `firstname` (required): User's first name
- `lastname` (required): User's last name
- `email` (required): Valid email address (must be unique)
- `phone` (required): Phone number (must be unique)
- `password` (required): Password (minimum 6 characters recommended)
- `confirmPassword` (required): Must match password exactly

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration initiated. Please check your email for the verification code.",
  "userId": "675a1b2c3d4e5f6g7h8i9j0k",
  "email": "john@example.com",
  "expiresIn": "10 minutes",
  "isFallback": false
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "All fields are required"
}
```

**400 - Passwords Don't Match:**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**400 - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already exists",
  "field": "email"
}
```

**400 - Phone Already Exists:**
```json
{
  "success": false,
  "message": "Phone number already exists",
  "field": "phone"
}
```

**500 - Email Sending Failed:**
```json
{
  "success": false,
  "message": "Failed to send verification code. Please try again.",
  "error": "Error details"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePassword123",
    "confirmPassword": "SecurePassword123"
  }'
```

---

### 2. Verify Registration (Step 2: Complete Registration)

**What it does:** Verifies the 6-digit code sent to the user's email and activates their account.

**Endpoint:** `POST /api/auth/verify-registration`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "123456"
}
```

**Field Requirements:**
- `email` (required): The email used during registration
- `code` (required): The 6-digit code received via email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Registration completed successfully!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWE...",
  "user": {
    "id": "675a1b2c3d4e5f6g7h8i9j0k",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user"
  }
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Email and verification code are required"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 - Already Verified:**
```json
{
  "success": false,
  "message": "Account already verified. Please login."
}
```

**400 - No Code Found:**
```json
{
  "success": false,
  "message": "No verification code found. Please request a new one."
}
```

**400 - Code Expired:**
```json
{
  "success": false,
  "message": "Verification code has expired. Please register again.",
  "expired": true
}
```

**400 - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/verify-registration \
  -H "Content-Type: application/json" \
  -d '{
  "email": "john@example.com",
    "code": "123456"
  }'
```

---

### 3. Login User (Step 1: Initiate Login)

**What it does:** Validates user credentials and sends a 6-digit verification code to their email.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Field Requirements:**
- `email` (required): User's registered email
- `password` (required): User's password

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email. Please verify to complete login.",
  "userId": "675a1b2c3d4e5f6g7h8i9j0k",
  "email": "john@example.com",
  "expiresIn": "10 minutes",
  "isFallback": false
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found. Please sign up first.",
  "redirectTo": "signup"
}
```

**400 - Social Login Account:**
```json
{
  "success": false,
  "message": "This account was created using social login. Please use Google or Facebook to sign in.",
  "socialLogin": true
}
```

**401 - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

**403 - Email Not Verified:**
```json
{
  "success": false,
  "message": "Please verify your email first. Check your inbox for the verification code.",
  "requiresVerification": true,
  "email": "john@example.com"
}
```

**500 - Email Sending Failed:**
```json
{
  "success": false,
  "message": "Failed to send verification code. Please try again.",
  "error": "Error details"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

---

### 4. Verify Login (Step 2: Complete Login)

**What it does:** Verifies the 6-digit code and logs the user in, returning a JWT token.

**Endpoint:** `POST /api/auth/verify-login`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "654321"
}
```

**Field Requirements:**
- `email` (required): The email used during login
- `code` (required): The 6-digit code received via email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWE...",
  "user": {
    "id": "675a1b2c3d4e5f6g7h8i9j0k",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user"
  }
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Email and verification code are required"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 - Not Verified:**
```json
{
  "success": false,
  "message": "Please complete registration verification first."
}
```

**400 - No Code Found:**
```json
{
  "success": false,
  "message": "No verification code found. Please login again."
}
```

**400 - Code Expired:**
```json
{
  "success": false,
  "message": "Verification code has expired. Please login again.",
  "expired": true
}
```

**400 - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "654321"
  }'
```

---

### 5. Forgot Password (Step 1: Request Reset Code)

**What it does:** Sends a 4-digit verification code to the user's email for password reset.

**Endpoint:** `POST /api/auth/forgot-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Field Requirements:**
- `email` (required): User's registered email address

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "expiresIn": "10 minutes",
  "isFallback": false
}
```

**Error Responses:**

**400 - Missing Email:**
```json
{
  "success": false,
  "message": "Email is required"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "No account found with this email address",
  "redirectTo": "signup"
}
```

**400 - Social Login Account:**
```json
{
  "success": false,
  "message": "This account was created using social login. Password reset is not available.",
  "socialLogin": true
}
```

**500 - Email Sending Failed:**
```json
{
  "success": false,
  "message": "Failed to send verification code. Please try again.",
  "error": "Error details"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'
```

---

### 6. Verify Reset Code (Step 2: Verify Code - Optional)

**What it does:** Verifies that the reset code is valid before allowing password reset.

**Endpoint:** `POST /api/auth/verify-reset-code`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "7392"
}
```

**Field Requirements:**
- `email` (required): User's registered email
- `code` (required): The 4-digit code received via email

**Success Response (200):**
```json
{
  "success": true,
  "message": "Verification code is valid. You can now reset your password."
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "Email and verification code are required"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 - No Code Found:**
```json
{
  "success": false,
  "message": "No verification code found. Please request a new one."
}
```

**400 - Code Expired:**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one.",
  "expired": true
}
```

**400 - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

> **Note:** This step is optional. You can proceed directly to reset-password with the code.

---

### 7. Reset Password (Step 3: Reset Password)

**What it does:** Resets the user's password using the verified code.

**Endpoint:** `POST /api/auth/reset-password`

**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "code": "7392",
  "newPassword": "NewSecurePassword456",
  "confirmPassword": "NewSecurePassword456"
}
```

**Field Requirements:**
- `email` (required): User's registered email
- `code` (required): The 4-digit verification code
- `newPassword` (required): New password
- `confirmPassword` (required): Must match newPassword exactly

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login with your new password."
}
```

**Error Responses:**

**400 - Missing Fields:**
```json
{
  "success": false,
  "message": "All fields are required"
}
```

**400 - Passwords Don't Match:**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**404 - User Not Found:**
```json
{
  "success": false,
  "message": "User not found"
}
```

**400 - No Code Found:**
```json
{
  "success": false,
  "message": "No verification code found. Please request a new one."
}
```

**400 - Code Expired:**
```json
{
  "success": false,
  "message": "Verification code has expired. Please request a new one.",
  "expired": true
}
```

**400 - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid verification code"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "code": "7392",
    "newPassword": "NewSecurePassword456",
    "confirmPassword": "NewSecurePassword456"
  }'
```

---

### 8. Google OAuth Login

**What it does:** Allows users to sign in using their Google account.

**Endpoint:** `GET /api/auth/google`

**Authentication:** Not required

**How it works:**
1. User clicks "Sign in with Google"
2. User is redirected to Google login page
3. After authentication, Google redirects to callback URL
4. System creates/updates user account
5. User receives JWT token

**Callback Endpoint:** `GET /api/auth/google/callback`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Google login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "googleId": "123456789012345678901",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@gmail.com",
    "role": "user",
    "isVerified": true
  }
}
```

> **Note:** Google OAuth users are automatically verified and don't need 2FA.

---

### 9. Facebook OAuth Login

**What it does:** Allows users to sign in using their Facebook account.

**Endpoint:** `GET /api/auth/facebook`

**Authentication:** Not required

**How it works:**
1. User clicks "Sign in with Facebook"
2. User is redirected to Facebook login page
3. After authentication, Facebook redirects to callback URL
4. System creates/updates user account
5. User receives JWT token

**Callback Endpoint:** `GET /api/auth/facebook/callback`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Facebook login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "facebookId": "9876543210987654321",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@facebook.com",
    "role": "user",
    "isVerified": true
  }
}
```

> **Note:** Facebook OAuth users are automatically verified and don't need 2FA.

---

## Products Endpoints

Base Path: `/api/products`

### 1. Get All Products

**What it does:** Retrieves a list of products with optional filtering, searching, and pagination.

**Endpoint:** `GET /api/products`

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `category` (optional): Filter by category ID
- `search` (optional): Search in title, description, and tags (case-insensitive). **Automatically saves to search history for authenticated users.**
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `tags` (optional): Comma-separated tags (e.g., "Men,Casual")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Search Feature:** When a user searches (authenticated), the search query is automatically saved to their search history. No need to manually call the save search history endpoint. Duplicate searches within 1 hour are not saved to prevent spam.

**Example Requests:**
```http
# Get all products
GET /api/products?page=1&limit=20

# Search for products
GET /api/products?search=dress&page=1&limit=20

# Filter by category
GET /api/products?category=675a1b2c3d4e5f6g7h8i9j0k&page=1&limit=20

# Combined filters
GET /api/products?category=675a1b2c3d4e5f6g7h8i9j0k&search=shirt&minPrice=100&maxPrice=1000&tags=Men,Casual&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "title": "Premium Suit",
      "description": "High-quality business suit",
      "price": 2999.99,
      "currency": "NGN",
      "discountPercentage": 15,
      "category": {
        "_id": "675a1b2c3d4e5f6g7h8i9j0l",
        "name": "Formal Wear",
        "image": "https://example.com/category.jpg"
      },
      "images": [
        "https://example.com/suit1.jpg",
        "https://example.com/suit2.jpg"
      ],
      "tags": ["Men", "Formal", "Business"],
      "rating": 4.5,
      "stock": 50,
      "createdBy": "675a1b2c3d4e5f6g7h8i9j0m",
      "calculatedBadges": ["HOT", "SALE"],
      "isInFavorites": false,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 100
}
```

**Example Request (cURL):**
```bash
curl -X GET "http://localhost:3000/api/products?page=1&limit=20"
```

---

### 2. Get Featured Products

**What it does:** Retrieves featured products (for "Best Offer" banners and special promotions).

**Endpoint:** `GET /api/products/featured`

**Authentication:** Not required

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "title": "Premium Suit",
      "description": "High-quality business suit",
      "price": 2999.99,
      "currency": "NGN",
      "discountPercentage": 15,
      "category": {
        "_id": "675a1b2c3d4e5f6g7h8i9j0l",
        "name": "Formal Wear",
        "image": "https://example.com/category.jpg"
      },
      "images": ["https://example.com/suit1.jpg"],
      "tags": ["Men", "Formal"],
      "rating": 4.5,
      "stock": 50,
      "isFeatured": true,
      "calculatedBadges": ["HOT", "SALE"],
      "isInFavorites": false
    }
  ]
}
```

> **Note:** Only products with `isFeatured: true` and valid `featuredUntil` dates (or null) are returned. Products are sorted by `featuredAt` date (most recent first).

---

### 3. Get Recommended Products

**What it does:** Retrieves recommended products (currently returns most recent products).

**Endpoint:** `GET /api/products/recommended`

**Authentication:** Not required

**Query Parameters:**
- `limit` (optional): Number of products to return (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "products": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "title": "Premium Suit",
      "description": "High-quality business suit",
      "price": 2999.99,
      "category": {
        "_id": "675a1b2c3d4e5f6g7h8i9j0l",
        "name": "Formal Wear"
      },
      "images": ["https://example.com/suit1.jpg"],
      "tags": ["Men", "Formal"],
      "rating": 4.5,
      "stock": 50
    }
  ]
}
```

---

### 4. Get Product by ID

**What it does:** Retrieves detailed information about a specific product.

**Endpoint:** `GET /api/products/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (required): Product ID

**Success Response (200) - Product without Variants:**
```json
{
  "success": true,
  "product": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "title": "Premium Suit",
    "description": "High-quality business suit made from premium materials",
    "price": 2999.99,
    "currency": "NGN",
    "discountPercentage": 15,
    "category": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0l",
      "name": "Formal Wear",
      "image": "https://example.com/category.jpg"
    },
    "images": [
      "https://example.com/suit1.jpg",
      "https://example.com/suit2.jpg"
    ],
    "tags": ["Men", "Formal", "Business"],
    "rating": 4.5,
    "stock": 50,
    "hasVariants": false,
    "createdBy": "675a1b2c3d4e5f6g7h8i9j0m",
    "calculatedBadges": ["HOT", "SALE"],
    "isInFavorites": false,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Success Response (200) - Product with Variants:**
```json
{
  "success": true,
  "product": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "title": "Premium Suit",
    "description": "High-quality business suit made from premium materials",
    "price": 2999.99,
    "currency": "NGN",
    "category": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0l",
      "name": "Formal Wear"
    },
    "images": ["https://example.com/suit1.jpg"],
    "tags": ["Men", "Formal"],
    "rating": 4.5,
    "stock": 50,
    "hasVariants": true,
    "calculatedBadges": ["HOT", "SALE"],
    "isInFavorites": false,
    "variants": [
      {
        "_id": "675a1b2c3d4e5f6g7h8i9j0n",
        "size": "M",
        "color": "Navy Blue",
        "colorCode": "#000080",
        "price": 2999.99,
        "stock": 10,
        "sku": "675A1B2C-M-NAV",
        "images": []
      },
      {
        "_id": "675a1b2c3d4e5f6g7h8i9j0o",
        "size": "L",
        "color": "Navy Blue",
        "colorCode": "#000080",
        "price": 2999.99,
        "stock": 15,
        "sku": "675A1B2C-L-NAV",
        "images": []
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**400 - Invalid ID Format:**
```json
{
  "success": false,
  "message": "Invalid product ID format",
  "error": "Cast to ObjectId failed..."
}
```

---

### 5. Create Product

**What it does:** Creates a new product (Admin only).

**Endpoint:** `POST /api/products`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body (Simple Product):**
```json
{
  "title": "Premium Suit",
  "description": "High-quality business suit made from premium materials",
  "price": 2999.99,
  "currency": "NGN",
  "displayCurrency": "USD",
  "displayPrice": 56.99,
  "discountPercentage": 15,
  "category": "675a1b2c3d4e5f6g7h8i9j0l",
  "brand": "Gagnon",
  "releaseDate": "2024-01-15T00:00:00.000Z",
  "images": [
    "https://example.com/suit1.jpg",
    "https://example.com/suit2.jpg"
  ],
  "tags": ["Men", "Formal", "Business"],
  "stock": 50,
  "hasVariants": false,
  "badges": ["NEW", "HOT"]
}
```

**Request Body (Product with Variants):**
```json
{
  "title": "Premium Suit",
  "description": "High-quality business suit made from premium materials",
  "price": 2999.99,
  "currency": "NGN",
  "category": "675a1b2c3d4e5f6g7h8i9j0l",
  "brand": "Gagnon",
  "images": ["https://example.com/suit1.jpg"],
  "tags": ["Men", "Formal"],
  "sizes": ["S", "M", "L", "XL"],
  "colors": ["Navy Blue", "Black", "Charcoal Gray"]
}
```

**Field Requirements:**
- `title` (required): Product name
- `description` (required): Product description
- `price` (required): Base product price (number)
- `category` (required): Valid category ID (MongoDB ObjectId)
- `currency` (optional): Currency code (default: "NGN")
- `displayCurrency` (optional): Display currency (e.g., "USD", default: "USD")
- `displayPrice` (optional): Display price in displayCurrency
- `brand` (optional): Brand name (e.g., "Gagnon")
- `releaseDate` (optional): Product release date (ISO date string, e.g., "2024-01-15T00:00:00.000Z")
- `discountPercentage` (optional): Discount percentage (default: 0)
- `images` (optional): Array of image URLs
- `tags` (optional): Array of tag strings
- `stock` (optional): Total stock quantity (default: 0). If `hasVariants` is true, this represents the sum of all variant stock.
- `sizes` (optional): Array of size strings for variants. Valid sizes: `["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"]`. If provided with `colors`, variants will be automatically created.
- `colors` (optional): Array of color strings for variants. If provided with `sizes`, variants will be automatically created.
- `hasVariants` (optional): Whether product has size/color variants (default: false). Automatically set to `true` if both `sizes` and `colors` are provided.
- `badges` (optional): Array of manual badges: ["HOT", "NEW", "SALE", "BESTSELLER", "LIMITED"]
- `isFeatured` (optional): Whether product is featured (default: false)
- `featuredAt` (optional): When product was featured (Date)
- `featuredUntil` (optional): Feature expiry date (Date)
- `isAvailable` (optional): Whether product is available for purchase (default: true)

**Note:** When `sizes` and `colors` are both provided, the system automatically:
1. Sets `hasVariants` to `true`
2. Creates all possible variant combinations (size × color)
3. Generates unique SKUs for each variant
4. Sets initial stock to 0 for each variant (update via ProductVariant model)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "title": "Premium Suit",
    "description": "High-quality business suit",
    "price": 2999.99,
    "currency": "NGN",
    "discountPercentage": 15,
    "category": "675a1b2c3d4e5f6g7h8i9j0l",
    "images": ["https://example.com/suit1.jpg"],
    "tags": ["Men", "Formal"],
    "stock": 50,
    "rating": 0,
    "createdBy": "675a1b2c3d4e5f6g7h8i9j0m",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**403 - Not Admin:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

**400 - Missing Required Fields:**
```json
{
  "success": false,
  "message": "Title, description, price, and category are required"
}
```

**400 - Invalid Category ID:**
```json
{
  "success": false,
  "message": "Invalid category ID format. Please provide a valid category ID.",
  "error": "\"<categoryId>\" is not a valid MongoDB ObjectId"
}
```

**404 - Category Not Found:**
```json
{
  "success": false,
  "message": "Category not found",
  "error": "Category with ID \"675a1b2c3d4e5f6g7h8i9j0l\" does not exist"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Premium Suit",
    "description": "High-quality business suit",
    "price": 2999.99,
    "category": "675a1b2c3d4e5f6g7h8i9j0l",
    "stock": 50
  }'
```

---

### 6. Update Product

**What it does:** Updates an existing product (Admin only).

**Endpoint:** `PUT /api/products/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (required): Product ID

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "price": 2499.99,
  "stock": 45,
  "discountPercentage": 20
}
```

> **Note:** You can update any field. Only include fields you want to change.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "title": "Premium Suit",
    "price": 2499.99,
    "stock": 45,
    "discountPercentage": 20,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Error Responses:**

**404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**400 - Invalid Category ID (if updating category):**
```json
{
  "success": false,
  "message": "Invalid category ID format. Please provide a valid category ID.",
  "error": "\"1234567890\" is not a valid MongoDB ObjectId"
}
```

---

### 7. Delete Product

**What it does:** Deletes a product (Admin only).

**Endpoint:** `DELETE /api/products/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id` (required): Product ID

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Error Responses:**

**404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

---
##  Categories Endpoints

> ** Important:** The system has 11 default categories (Travel Essentials, Dresses, Basics, Body Suits, Co-ords, Tops, Bottoms, Male, Female, Kids, Accessories). When a user clicks a category icon, the system automatically tracks their last selected category. For new users or when no category has been selected, the system defaults to the first category. Use the `/api/categories/active` endpoint to get the user's active category (last selected or first category).

Base Path: `/api/categories`

### 1. Get All Categories

**What it does:** Retrieves all categories with their parent categories (if any).

**Endpoint:** `GET /api/categories`

**Authentication:** Not required (public endpoint)

**Success Response (200):**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0l",
      "name": "Travel Essentials",
      "image": "https://example.com/travel-essentials.jpg",
      "icon": "https://example.com/travel-icon.png",
      "parentCategory": null,
      "displayOrder": 1,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0m",
      "name": "Dresses",
      "image": "https://example.com/dresses.jpg",
      "icon": "https://example.com/dresses-icon.png",
      "parentCategory": null,
      "displayOrder": 2,
      "createdAt": "2024-01-15T10:05:00.000Z",
      "updatedAt": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

> **Note:** Categories are sorted by `displayOrder` (ascending) by default. The 11 default categories are pre-seeded with display orders 1-11.

---

### 2. Get Active Category (Last Selected or First Category)

**What it does:** Returns the user's last selected category (if authenticated) or the first category (for new/unauthenticated users). This is the recommended endpoint for displaying the default category when the app loads.

**Endpoint:** `GET /api/categories/active`

**Authentication:** Optional (if authenticated, returns last selected category; otherwise returns first category)

**Request Headers (Optional):**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "category": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "name": "Travel Essentials",
    "image": "https://example.com/travel-essentials.jpg",
    "icon": "https://example.com/travel-icon.png",
    "parentCategory": null,
    "displayOrder": 1,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Note:** For authenticated users, accessing this endpoint also updates their `lastSelectedCategory` to the returned category.

**Error Responses:**

**404 - No Categories Available:**
```json
{
  "success": false,
  "message": "No categories available"
}
```

---

### 3. Get Category by ID

**What it does:** Retrieves detailed information about a specific category. For authenticated users, this also updates their last selected category.

**Endpoint:** `GET /api/categories/:id`

**Authentication:** Not required (but if provided, tracks as last selected category)

**URL Parameters:**
- `id` (required): Category ID

**Request Headers (Optional):**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "category": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "name": "Dresses",
    "image": "https://example.com/dresses.jpg",
    "icon": "https://example.com/dresses-icon.png",
    "parentCategory": null,
    "displayOrder": 2,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Note:** If the user is authenticated, accessing this endpoint automatically updates their `lastSelectedCategory` to this category.

**Error Responses:**

**404 - Category Not Found:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**400 - Invalid ID Format:**
```json
{
  "success": false,
  "message": "Invalid category ID format",
  "error": "Cast to ObjectId failed..."
}
```

---

### 4. Get Top-Level Categories Only

**What it does:** Retrieves only top-level categories (categories without a parent). Useful for displaying the main category menu.

**Endpoint:** `GET /api/categories/top-level`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0l",
      "name": "Travel Essentials",
      "image": "https://example.com/travel-essentials.jpg",
      "icon": "https://example.com/travel-icon.png",
      "displayOrder": 1
    },
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0m",
      "name": "Dresses",
      "image": "https://example.com/dresses.jpg",
      "icon": "https://example.com/dresses-icon.png",
      "displayOrder": 2
    }
  ]
}
```

---

### 5. Create Category

**What it does:** Creates a new category (Admin only).

**Endpoint:** `POST /api/categories`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body (Top-level Category):**
```json
{
  "name": "Electronics",
  "image": "https://example.com/electronics.jpg",
  "icon": "https://example.com/electronics-icon.png",
  "displayOrder": 12
}
```

**Request Body (Subcategory):**
```json
{
  "name": "Smartphones",
  "image": "https://example.com/smartphones.jpg",
  "icon": "https://example.com/smartphones-icon.png",
  "parentCategory": "675a1b2c3d4e5f6g7h8i9j0l",
  "displayOrder": 1
}
```

**Field Requirements:**
- `name` (required): Category name (must be unique)
- `image` (optional): Category image URL
- `icon` (optional): Icon URL for circular category icons (used in mobile UI)
- `parentCategory` (optional): Parent category ID (for nested categories). Leave empty, null, or omit for top-level categories.
- `displayOrder` (optional): Number for sorting categories (default: 0). Lower numbers appear first.

**Success Response (201):**
```json
{
  "success": true,
  "message": "Category created successfully",
  "category": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "name": "Electronics",
    "image": "https://example.com/electronics.jpg",
    "parentCategory": null,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Missing Name:**
```json
{
  "success": false,
  "message": "Category name is required"
}
```

**400 - Category Already Exists:**
```json
{
  "success": false,
  "message": "Category already exists"
}
```

**400 - Invalid Parent Category ID:**
```json
{
  "success": false,
  "message": "Invalid parent category ID format. Please provide a valid category ID or leave it empty for a top-level category.",
  "error": "\"1234567890\" is not a valid MongoDB ObjectId"
}
```

**404 - Parent Category Not Found:**
```json
{
  "success": false,
  "message": "Parent category not found",
  "error": "Category with ID \"675a1b2c3d4e5f6g7h8i9j0l\" does not exist"
}
```

**Example Request (cURL):**
```bash
# Create top-level category
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "image": "https://example.com/electronics.jpg"
  }'

# Create subcategory
curl -X POST http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smartphones",
    "parentCategory": "675a1b2c3d4e5f6g7h8i9j0l"
  }'
```

---

### 6. Update Category

**What it does:** Updates an existing category (Admin only). Can update name, image, icon, parent category, and display order. Cannot set a category as its own parent.

**Endpoint:** `PUT /api/categories/:id`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Category ID to update

**Request Body:**
```json
{
  "name": "Updated Category Name",
  "image": "https://example.com/updated-image.jpg",
  "icon": "https://example.com/updated-icon.png",
  "parentCategory": "675a1b2c3d4e5f6g7h8i9j0l",
  "displayOrder": 5
}
```

**Field Requirements:**
- All fields are optional - only include fields you want to update
- `name`: Must be unique if provided
- `parentCategory`: Must be a valid category ID or null/empty string

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category updated successfully",
  "category": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "name": "Updated Category Name",
    "image": "https://example.com/updated-image.jpg",
    "icon": "https://example.com/updated-icon.png",
    "parentCategory": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0m",
      "name": "Parent Category"
    },
    "displayOrder": 5,
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses:**

**404 - Category Not Found:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**400 - Category Cannot Be Its Own Parent:**
```json
{
  "success": false,
  "message": "Category cannot be its own parent"
}
```

**Example Request (cURL):**
```bash
curl -X PUT http://localhost:3000/api/categories/675a1b2c3d4e5f6g7h8i9j0l \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category",
    "displayOrder": 10
  }'
```

---

### 7. Delete Category

**What it does:** Deletes a category (Admin only). Cannot delete categories that have products or subcategories.

**Endpoint:** `DELETE /api/categories/:id`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**URL Parameters:**
- `id` (required): Category ID to delete

**Success Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

**Error Responses:**

**404 - Category Not Found:**
```json
{
  "success": false,
  "message": "Category not found"
}
```

**400 - Category Has Products:**
```json
{
  "success": false,
  "message": "Cannot delete category. It has 15 product(s) associated with it. Please remove or reassign products first."
}
```

**400 - Category Has Subcategories:**
```json
{
  "success": false,
  "message": "Cannot delete category. It has 3 subcategory(ies). Please delete or reassign subcategories first."
}
```

**Note:** When a category is deleted, all users who had it as their `lastSelectedCategory` will have that field cleared.

**Example Request (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/categories/675a1b2c3d4e5f6g7h8i9j0l \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

##  User Management Endpoints

Base Path: `/api/user`

**All endpoints in this section require authentication.** Include the JWT token in the Authorization header.

### 1. Get User Profile

**What it does:** Retrieves the authenticated user's profile information.

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "title": "Mr",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "gender": "Male",
    "role": "user",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": true,
    "marketingPreferences": {
      "email": true,
      "sms": false,
      "push": true
    },
    "defaultAddress": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0a",
      "title": "Home",
      "fullName": "John Doe",
      "address": "123 Main Street",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "postalCode": "100001"
    },
    "lastSelectedCategory": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0l",
      "name": "Travel Essentials",
      "image": "https://example.com/travel-essentials.jpg"
    },
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

**Note:** The `lastSelectedCategory` field is automatically updated when the user accesses a category via `GET /api/categories/:id` or `GET /api/categories/active`. The `defaultAddress` field references the user's default shipping address (if set).

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 2. Update User Profile

**What it does:** Updates the authenticated user's profile information. Only provided fields will be updated.

**Endpoint:** `PUT /api/user/profile`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Mr",
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+1234567890",
  "gender": "Male",
  "avatar": "https://example.com/avatar.jpg",
  "marketingPreferences": {
    "email": true,
    "sms": false,
    "push": true
  }
}
```

**Field Requirements:**
- All fields are optional - only include fields you want to update
- `title`: Must be one of: "Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", or "" (empty string)
- `gender`: Must be one of: "Male", "Female", "Other", or "" (empty string)
- `marketingPreferences`: Object with `email`, `sms`, and `push` boolean fields
- `firstname`, `lastname`, `phone`: String values
- `avatar`: URL string

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "title": "Mr",
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "gender": "Male",
    "role": "user",
    "avatar": "https://example.com/avatar.jpg",
    "marketingPreferences": {
      "email": true,
      "sms": false,
      "push": true
    },
    "isVerified": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T14:00:00.000Z"
  }
}
```

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**400 - Invalid Field Value:**
```json
{
  "success": false,
  "message": "Invalid gender value. Must be one of: Male, Female, Other"
}
```

**Example Request (cURL):**
```bash
curl -X PUT http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mr",
    "gender": "Male",
    "marketingPreferences": {
      "email": true,
      "sms": false,
      "push": true
    }
  }'
```

**Tip:** To set a default address, use the `PUT /api/addresses/:id/default` endpoint. The `defaultAddress` field in the user profile will be automatically updated.

---

### 3. Get Search History

**What it does:** Retrieves the user's search history.

**Endpoint:** `GET /api/user/search-history`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of recent searches to return (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "history": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0n",
      "query": "summer dresses",
      "user": "675a1b2c3d4e5f6g7h8i9j0k",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0o",
      "query": "formal suits",
      "user": "675a1b2c3d4e5f6g7h8i9j0k",
      "createdAt": "2024-01-15T11:30:00.000Z",
      "updatedAt": "2024-01-15T11:30:00.000Z"
    }
  ]
}
```

**Note:** Search history is automatically saved when authenticated users search using the `GET /api/products?search=<query>` endpoint. You can still manually save searches using `POST /api/user/search-history`, but it's not necessary for most use cases.

---

### 4. Save Search History (Manual)

**What it does:** Manually saves a search query to the user's search history. **Note:** This is optional as search history is automatically saved when using the search endpoint.

**Endpoint:** `POST /api/user/search-history`

**Authentication:** Required

**Request Body:**
```json
{
  "query": "summer dresses"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Search history saved"
}
```

**Tip:** Search history is automatically saved when authenticated users search using `GET /api/products?search=<query>`. This manual endpoint is useful for saving searches from other sources or for custom search implementations.

---

### 5. Clear Search History

**What it does:** Deletes all search history for the authenticated user.

**Endpoint:** `DELETE /api/user/search-history`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Search history cleared successfully"
}
```

---

### 6. Get Notifications

**What it does:** Retrieves notifications for the authenticated user.

**Endpoint:** `GET /api/user/notifications`

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0p",
      "title": "Order Confirmed",
      "message": "Your order #12345 has been confirmed",
      "type": "order",
      "isRead": false,
      "relatedId": "675a1b2c3d4e5f6g7h8i9j0q",
      "createdAt": "2024-01-15T13:00:00.000Z"
    }
  ],
  "totalPages": 2,
  "currentPage": 1,
  "total": 25
}
```

---

### 7. Get Unread Notification Count

**What it does:** Returns the count of unread notifications.

**Endpoint:** `GET /api/user/notifications/unread-count`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "unreadCount": 5
}
```

---

### 8. Mark Notification as Read

**What it does:** Marks a specific notification as read.

**Endpoint:** `PUT /api/user/notifications/:id/read`

**Authentication:** Required

**URL Parameters:**
- `id` (required): Notification ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "notification": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0p",
    "isRead": true,
    "updatedAt": "2024-01-15T13:30:00.000Z"
  }
}
```

---

### 9. Get Favorites (Favorite Stores)

**What it does:** Retrieves all products in the user's favorites list (favorite stores).

**Endpoint:** `GET /api/user/favorites`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "favorites": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "title": "Elegant Evening Gown",
      "description": "Stunning floor-length gown...",
      "price": 45000,
      "currency": "NGN",
      "images": ["https://example.com/gown.jpg"],
      "category": {
        "_id": "675a1b2c3d4e5f6g7h8i9j0l",
        "name": "Dresses"
      }
    }
  ]
}
```

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

### 10. Add to Favorites

**What it does:** Adds a product to the user's favorites list.

**Endpoint:** `POST /api/user/favorites`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "675a1b2c3d4e5f6g7h8i9j0k"
}
```

**Field Requirements:**
- `productId` (required): Valid product ID (MongoDB ObjectId)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product added to favorites"
}
```

**Error Responses:**

**400 - Product Already in Favorites:**
```json
{
  "success": false,
  "message": "Product already in favorites"
}
```

**404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/user/favorites \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "675a1b2c3d4e5f6g7h8i9j0k"
  }'
```

---

### 11. Remove from Favorites

**What it does:** Removes a product from the user's favorites list.

**Endpoint:** `DELETE /api/user/favorites/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Product ID to remove from favorites

**Success Response (200):**
```json
{
  "success": true,
  "message": "Product removed from favorites"
}
```

**Error Responses:**

**404 - Product Not in Favorites:**
```json
{
  "success": false,
  "message": "Product not found in favorites"
}
```

**Example Request (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/user/favorites/675a1b2c3d4e5f6g7h8i9j0k \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Shopping Cart Endpoints

Base Path: `/api/cart`

**All endpoints in this section require authentication.** Include the JWT token in the Authorization header.

### 1. Get Cart

**What it does:** Retrieves the authenticated user's shopping cart with all items, quantities, and calculated totals.

**Endpoint:** `GET /api/cart`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "cart": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "items": [
      {
        "_id": "675a1b2c3d4e5f6g7h8i9j0l",
        "product": {
          "_id": "675a1b2c3d4e5f6g7h8i9j0m",
          "title": "Premium Suit",
          "price": 2999.99,
          "currency": "NGN",
          "images": ["https://example.com/suit.jpg"],
          "brand": "Gagnon"
        },
        "variant": {
          "_id": "675a1b2c3d4e5f6g7h8i9j0n",
          "size": "L",
          "color": { "name": "Navy Blue", "hex": "#000080" },
          "price": 2999.99,
          "stock": 10
        },
        "size": "L",
        "color": { "name": "Navy Blue", "hex": "#000080" },
        "quantity": 2,
        "price": 2999.99,
        "subtotal": 5999.98
      }
    ],
    "subtotal": 5999.98,
    "itemCount": 1,
    "totalItems": 2
  }
}
```

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example Request (cURL):**
```bash
curl http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Add Item to Cart

**What it does:** Adds a product (with or without variant) to the user's shopping cart. If the item already exists, it updates the quantity.

**Endpoint:** `POST /api/cart`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "675a1b2c3d4e5f6g7h8i9j0m",
  "variantId": "675a1b2c3d4e5f6g7h8i9j0n",
  "quantity": 2
}
```

**Field Requirements:**
- `productId` (required): Product ID (MongoDB ObjectId)
- `variantId` (optional): Product variant ID if product has variants
- `size` (optional): Size string (legacy support, use variantId instead)
- `color` (optional): Color object (legacy support, use variantId instead)
- `quantity` (optional): Quantity to add (default: 1)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Item added to cart",
  "cartItem": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "cart": "675a1b2c3d4e5f6g7h8i9j0k",
    "product": "675a1b2c3d4e5f6g7h8i9j0m",
    "variant": "675a1b2c3d4e5f6g7h8i9j0n",
    "quantity": 2,
    "price": 2999.99,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**If item already exists (200):**
```json
{
  "success": true,
  "message": "Cart updated",
  "cartItem": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "quantity": 3
  }
}
```

**Error Responses:**

**400 - Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock. Only 5 available."
}
```

**404 - Product Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "675a1b2c3d4e5f6g7h8i9j0m",
    "variantId": "675a1b2c3d4e5f6g7h8i9j0n",
    "quantity": 2
  }'
```

---

### 3. Update Cart Item Quantity

**What it does:** Updates the quantity of a specific item in the cart.

**Endpoint:** `PUT /api/cart/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Cart item ID

**Request Body:**
```json
{
  "quantity": 3
}
```

**Field Requirements:**
- `quantity` (required): New quantity (must be at least 1)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated",
  "cartItem": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0l",
    "quantity": 3,
    "price": 2999.99
  }
}
```

**Error Responses:**

**400 - Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock. Only 2 available."
}
```

**404 - Cart Item Not Found:**
```json
{
  "success": false,
  "message": "Cart item not found"
}
```

**Example Request (cURL):**
```bash
curl -X PUT http://localhost:3000/api/cart/675a1b2c3d4e5f6g7h8i9j0l \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'
```

---

### 4. Remove Item from Cart

**What it does:** Removes a specific item from the cart.

**Endpoint:** `DELETE /api/cart/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Cart item ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart"
}
```

**Error Responses:**

**404 - Cart Item Not Found:**
```json
{
  "success": false,
  "message": "Cart item not found"
}
```

**Example Request (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/cart/675a1b2c3d4e5f6g7h8i9j0l \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Clear Cart

**What it does:** Removes all items from the cart.

**Endpoint:** `DELETE /api/cart`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared"
}
```

**Example Request (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Orders Endpoints

Base Path: `/api/orders`

**All endpoints in this section require authentication.** Include the JWT token in the Authorization header.

### 1. Create Order from Cart

**What it does:** Creates an order from the user's cart. This endpoint validates stock, calculates totals (subtotal, shipping, discount, tax), creates the order, reduces product stock, and clears the cart.

**Endpoint:** `POST /api/orders`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "shippingAddressId": "675a1b2c3d4e5f6g7h8i9j0k",
  "shippingMethodId": "675a1b2c3d4e5f6g7h8i9j0l",
  "discountCode": "SAVE20",
  "paymentMethod": "card",
  "notes": "Please leave at front door"
}
```

**Field Requirements:**
- `shippingAddressId` (required): Address ID from user's addresses
- `shippingMethodId` (required): Shipping method ID
- `discountCode` (optional): Discount code to apply
- `paymentMethod` (optional): Payment method (default: "card")
- `notes` (optional): Order notes

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0m",
    "orderNumber": "ORD-XXXXX-XXXX",
    "user": "675a1b2c3d4e5f6g7h8i9j0n",
    "shippingAddress": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "firstname": "John",
      "lastname": "Doe",
      "address": "123 Main Street",
      "city": "Lagos",
      "country": "Nigeria"
    },
    "shippingMethod": {
      "_id": "675a1b2c3d4e5f6g7h8i9j0l",
      "name": "DHL EXPRESS INTERNATIONAL",
      "deliveryTime": "10 business days"
    },
    "subtotal": 50000,
    "shippingCost": 2000,
    "discountCode": "SAVE20",
    "discountAmount": 5000,
    "tax": 0,
    "total": 47000,
    "currency": "NGN",
    "status": "pending",
    "paymentStatus": "pending",
    "paymentMethod": "card",
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "orderItems": [...]
}
```

**Error Responses:**

**400 - Cart Empty:**
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

**400 - Insufficient Stock:**
```json
{
  "success": false,
  "message": "Insufficient stock for Premium Suit. Only 5 available."
}
```

**404 - Address Not Found:**
```json
{
  "success": false,
  "message": "Shipping address not found"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddressId": "675a1b2c3d4e5f6g7h8i9j0k",
    "shippingMethodId": "675a1b2c3d4e5f6g7h8i9j0l",
    "discountCode": "SAVE20",
    "paymentMethod": "card"
  }'
```

---

### 2. Get User Orders

**What it does:** Retrieves all orders for the authenticated user with optional filtering by status and pagination.

**Endpoint:** `GET /api/orders`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0m",
      "orderNumber": "ORD-XXXXX-XXXX",
      "subtotal": 50000,
      "total": 47000,
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 1
}
```

**Example Request (cURL):**
```bash
curl "http://localhost:3000/api/orders?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Order by ID

**What it does:** Retrieves a specific order with all details including order items.

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Order ID

**Success Response (200):**
```json
{
  "success": true,
  "order": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0m",
    "orderNumber": "ORD-XXXXX-XXXX",
    "shippingAddress": {...},
    "shippingMethod": {...},
    "subtotal": 50000,
    "total": 47000,
    "status": "pending",
    "paymentStatus": "pending"
  },
  "orderItems": [
    {
      "_id": "...",
      "product": {
        "_id": "...",
        "title": "Premium Suit",
        "images": [...]
      },
      "variant": {
        "size": "L",
        "color": {...}
      },
      "quantity": 2,
      "price": 25000,
      "subtotal": 50000
    }
  ]
}
```

**Error Responses:**

**404 - Order Not Found:**
```json
{
  "success": false,
  "message": "Order not found"
}
```

**Example Request (cURL):**
```bash
curl http://localhost:3000/api/orders/675a1b2c3d4e5f6g7h8i9j0m \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Get Order by Order Number

**What it does:** Retrieves an order using its order number instead of ID.

**Endpoint:** `GET /api/orders/number/:orderNumber`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `orderNumber` (required): Order number (e.g., "ORD-XXXXX-XXXX")

**Success Response (200):**
```json
{
  "success": true,
  "order": {...},
  "orderItems": [...]
}
```

**Example Request (cURL):**
```bash
curl http://localhost:3000/api/orders/number/ORD-XXXXX-XXXX \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. Cancel Order

**What it does:** Cancels a pending or confirmed order and restores product stock.

**Endpoint:** `PUT /api/orders/:id/cancel`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Order ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled",
  "order": {
    "_id": "...",
    "status": "cancelled"
  }
}
```

**Error Responses:**

**400 - Cannot Cancel:**
```json
{
  "success": false,
  "message": "Order cannot be cancelled at this stage"
}
```

**Example Request (cURL):**
```bash
curl -X PUT http://localhost:3000/api/orders/675a1b2c3d4e5f6g7h8i9j0m/cancel \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Get All Orders (Admin Only)

**What it does:** Retrieves all orders in the system with optional filtering (Admin only).

**Endpoint:** `GET /api/orders/admin/all`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "orders": [...],
  "totalPages": 1,
  "currentPage": 1,
  "total": 10
}
```

---

### 7. Update Order Status (Admin Only)

**What it does:** Updates the order status, payment status, or estimated delivery date (Admin only).

**Endpoint:** `PUT /api/orders/:id/status`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Order ID

**Request Body:**
```json
{
  "status": "shipped",
  "paymentStatus": "paid",
  "estimatedDelivery": "2024-01-25T00:00:00.000Z"
}
```

**Field Requirements:**
- `status` (optional): Order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)
- `paymentStatus` (optional): Payment status (pending, paid, failed, refunded)
- `estimatedDelivery` (optional): Estimated delivery date (ISO date string)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {
    "_id": "...",
    "status": "shipped",
    "paymentStatus": "paid",
    "estimatedDelivery": "2024-01-25T00:00:00.000Z"
  }
}
```

---

## Addresses Endpoints

Base Path: `/api/addresses`

**All endpoints in this section require authentication.** Include the JWT token in the Authorization header.

### 1. Get All Addresses

**What it does:** Retrieves all shipping addresses for the authenticated user. Default address is returned first.

**Endpoint:** `GET /api/addresses`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "addresses": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "title": "Mr",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "country": "Nigeria",
      "region": "Lagos",
      "city": "Lagos",
      "address": "123 Main Street",
      "postalCode": "100001",
      "isDefault": true,
      "addressType": "home",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Example Request (cURL):**
```bash
curl http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 2. Get Address by ID

**What it does:** Retrieves a specific address by ID.

**Endpoint:** `GET /api/addresses/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Address ID

**Success Response (200):**
```json
{
  "success": true,
  "address": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "firstname": "John",
    "lastname": "Doe",
    ...
  }
}
```

---

### 3. Create Address

**What it does:** Creates a new shipping address. If `isDefault` is true, it sets this as the default address and updates the user's profile.

**Endpoint:** `POST /api/addresses`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Mr",
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "country": "Nigeria",
  "region": "Lagos",
  "city": "Lagos",
  "address": "123 Main Street",
  "postalCode": "100001",
  "isDefault": true,
  "addressType": "home"
}
```

**Field Requirements:**
- `firstname` (required): First name
- `lastname` (required): Last name
- `email` (required): Email address
- `phone` (required): Phone number
- `city` (required): City name
- `address` (required): Street address
- `title` (optional): Title (Mr, Mrs, Ms, Miss, Dr, Prof, or "")
- `country` (optional): Country (default: "Nigeria")
- `region` (optional): State/Province
- `postalCode` (optional): Postal/ZIP code
- `isDefault` (optional): Set as default address (default: false)
- `addressType` (optional): Address type - "home", "work", or "other" (default: "home")

**Success Response (201):**
```json
{
  "success": true,
  "message": "Address created",
  "address": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "firstname": "John",
    "lastname": "Doe",
    "isDefault": true,
    ...
  }
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "city": "Lagos",
    "address": "123 Main Street",
    "isDefault": true
  }'
```

---

### 4. Update Address

**What it does:** Updates an existing address. If `isDefault` is set to true, it updates the default address.

**Endpoint:** `PUT /api/addresses/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Address ID

**Request Body:**
```json
{
  "city": "Abuja",
  "address": "456 New Street",
  "isDefault": true
}
```

**Note:** You can update any field. Only include fields you want to change.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Address updated",
  "address": {
    "_id": "...",
    "city": "Abuja",
    "address": "456 New Street",
    "isDefault": true
  }
}
```

---

### 5. Set Default Address

**What it does:** Sets a specific address as the default shipping address and updates the user's profile.

**Endpoint:** `PUT /api/addresses/:id/default`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Address ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Default address updated",
  "address": {
    "_id": "...",
    "isDefault": true
  }
}
```

**Example Request (cURL):**
```bash
curl -X PUT http://localhost:3000/api/addresses/675a1b2c3d4e5f6g7h8i9j0k/default \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Delete Address

**What it does:** Deletes an address. If it was the default address, it clears the user's default address reference.

**Endpoint:** `DELETE /api/addresses/:id`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `id` (required): Address ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Address deleted"
}
```

**Example Request (cURL):**
```bash
curl -X DELETE http://localhost:3000/api/addresses/675a1b2c3d4e5f6g7h8i9j0k \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Shipping Endpoints

Base Path: `/api/shipping`

### 1. Get All Shipping Methods

**What it does:** Retrieves all active shipping methods. Optionally filter by country.

**Endpoint:** `GET /api/shipping`

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `country` (optional): Filter by country (e.g., "Nigeria")

**Success Response (200):**
```json
{
  "success": true,
  "methods": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "name": "DHL EXPRESS INTERNATIONAL",
      "description": "Fast international shipping",
      "deliveryTime": "10 business days",
      "deliveryTimeDays": 10,
      "baseCost": 2000,
      "costPerKg": 500,
      "availableCountries": ["Nigeria", "Ghana"],
      "minOrderValue": 50000,
      "maxWeight": 30,
      "isActive": true
    }
  ]
}
```

**Example Request (cURL):**
```bash
curl "http://localhost:3000/api/shipping?country=Nigeria"
```

---

### 2. Get Shipping Method by ID

**What it does:** Retrieves a specific shipping method by ID.

**Endpoint:** `GET /api/shipping/:id`

**Authentication:** Not required (public endpoint)

**URL Parameters:**
- `id` (required): Shipping method ID

**Success Response (200):**
```json
{
  "success": true,
  "method": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0k",
    "name": "DHL EXPRESS INTERNATIONAL",
    ...
  }
}
```

---

### 3. Calculate Shipping Cost

**What it does:** Calculates the shipping cost for a given shipping method, weight, and order value. Applies free shipping if order value meets minimum.

**Endpoint:** `POST /api/shipping/calculate`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "methodId": "694d80986452dfff25319c8",
  "weight": 2.5,
  "orderValue": 50000,
  "country": "Nigeria"
}
```

**Field Requirements:**
- `methodId` (required): Shipping method ID
- `weight` (optional): Package weight in kg
- `orderValue` (optional): Order subtotal (for free shipping check)
- `country` (optional): Shipping country

**Success Response (200):**
```json
{
  "success": true,
  "cost": 0,
  "method": "DHL EXPRESS INTERNATIONAL",
  "deliveryTime": "10 business days",
  "deliveryTimeDays": 10,
  "message": "Free shipping applied"
}
```

**Or if not free:**
```json
{
  "success": true,
  "cost": 3250,
  "method": "DHL EXPRESS INTERNATIONAL",
  "deliveryTime": "10 business days",
  "deliveryTimeDays": 10
}
```

**Error Responses:**

**400 - Method Not Available:**
```json
{
  "success": false,
  "message": "Shipping method not available for this country"
}
```

**400 - Weight Exceeds Limit:**
```json
{
  "success": false,
  "message": "Weight exceeds maximum allowed (30kg)"
}
```

**Error Responses:**

**401 - Unauthorized:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/shipping/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "methodId": "675a1b2c3d4e5f6g7h8i9j0k",
    "weight": 2.5,
    "orderValue": 50000
  }'
```

---

### 4. Create Shipping Method (Admin Only)

**What it does:** Creates a new shipping method (Admin only).

**Endpoint:** `POST /api/shipping`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Standard Shipping",
  "description": "Standard delivery service",
  "deliveryTime": "5-7 business days",
  "deliveryTimeDays": 6,
  "baseCost": 1000,
  "costPerKg": 200,
  "availableCountries": ["Nigeria"],
  "minOrderValue": 30000,
  "maxWeight": 20,
  "icon": "https://example.com/icon.png"
}
```

**Field Requirements:**
- `name` (required): Shipping method name (must be unique)
- `description` (optional): Description
- `deliveryTime` (optional): Delivery time string (e.g., "5-7 business days")
- `deliveryTimeDays` (optional): Number of days for calculation
- `baseCost` (optional): Base shipping cost (default: 0)
- `costPerKg` (optional): Cost per kilogram (default: 0)
- `availableCountries` (optional): Array of country names (empty = all countries)
- `minOrderValue` (optional): Minimum order value for free shipping (default: 0)
- `maxWeight` (optional): Maximum weight in kg
- `icon` (optional): Icon URL

**Success Response (201):**
```json
{
  "success": true,
  "message": "Shipping method created",
  "method": {
    "_id": "...",
    "name": "Standard Shipping",
    "isActive": true,
    ...
  }
}
```

---

### 5. Update Shipping Method (Admin Only)

**What it does:** Updates an existing shipping method (Admin only).

**Endpoint:** `PUT /api/shipping/:id`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Shipping method ID

**Request Body:**
```json
{
  "baseCost": 1500,
  "isActive": false
}
```

**Note:** You can update any field. Only include fields you want to change.

---

### 6. Delete Shipping Method (Admin Only)

**What it does:** Deletes a shipping method (Admin only).

**Endpoint:** `DELETE /api/shipping/:id`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**URL Parameters:**
- `id` (required): Shipping method ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Shipping method deleted"
}
```

---

## Discounts Endpoints

Base Path: `/api/discounts`

### 1. Validate Discount Code

**What it does:** Validates a discount code and returns discount information without applying it. This is a public endpoint.

**Endpoint:** `POST /api/discounts/validate`

**Authentication:** Not required (public endpoint)

**Request Headers:**
```http
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderValue": 50000,
  "productIds": ["675a1b2c3d4e5f6g7h8i9j0k"],
  "categoryIds": ["675a1b2c3d4e5f6g7h8i9j0l"]
}
```

**Field Requirements:**
- `code` (required): Discount code
- `orderValue` (optional): Order subtotal (for discount calculation)
- `productIds` (optional): Array of product IDs (for product-specific codes)
- `categoryIds` (optional): Array of category IDs (for category-specific codes)

**Success Response (200):**
```json
{
  "success": true,
  "valid": true,
  "discountCode": {
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 10000,
    "description": "Save 20% on your order"
  }
}
```

**Error Responses:**

**404 - Invalid Code:**
```json
{
  "success": false,
  "message": "Invalid or expired discount code"
}
```

**400 - Minimum Order Value:**
```json
{
  "success": false,
  "message": "Minimum order value of 30000 required for this code"
}
```

**400 - Not Applicable:**
```json
{
  "success": false,
  "message": "Discount code does not apply to selected products"
}
```

**Example Request (cURL):**
```bash
curl -X POST http://localhost:3000/api/discounts/validate \
  -H "Content-Type: application/json" \
  -d '{
    "code": "SAVE20",
    "orderValue": 50000
  }'
```

---

### 2. Apply Discount Code

**What it does:** Applies a discount code and increments its usage count. This should be called when the discount is actually used in an order.

**Endpoint:** `POST /api/discounts/apply`

**Authentication:** Required

**Request Headers:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "orderValue": 50000,
  "productIds": ["675a1b2c3d4e5f6g7h8i9j0k"],
  "categoryIds": ["675a1b2c3d4e5f6g7h8i9j0l"],
  "userId": "675a1b2c3d4e5f6g7h8i9j0m"
}
```

**Field Requirements:**
- `code` (required): Discount code
- `orderValue` (optional): Order subtotal
- `productIds` (optional): Array of product IDs
- `categoryIds` (optional): Array of category IDs
- `userId` (optional): User ID (for per-user limit tracking)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discount code applied",
  "discount": {
    "code": "SAVE20",
    "discountType": "percentage",
    "discountValue": 20,
    "discountAmount": 10000,
    "description": "Save 20% on your order"
  }
}
```

**Note:** The discount code usage count is incremented when this endpoint is called. However, in the order creation flow, the discount is automatically applied when creating an order, so this endpoint is optional.

---

### 3. Get All Discount Codes (Admin Only)

**What it does:** Retrieves all discount codes with optional filtering (Admin only).

**Endpoint:** `GET /api/discounts`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**Query Parameters:**
- `active` (optional): Filter by active status (true/false)

**Success Response (200):**
```json
{
  "success": true,
  "codes": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0k",
      "code": "SAVE20",
      "discountType": "percentage",
      "discountValue": 20,
      "minOrderValue": 30000,
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validUntil": "2024-12-31T23:59:59.999Z",
      "usageLimit": 1000,
      "usageCount": 45,
      "isActive": true
    }
  ]
}
```

---

### 4. Create Discount Code (Admin Only)

**What it does:** Creates a new discount code (Admin only).

**Endpoint:** `POST /api/discounts`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "description": "Save 20% on your order",
  "discountType": "percentage",
  "discountValue": 20,
  "minOrderValue": 30000,
  "maxDiscount": 5000,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validUntil": "2024-12-31T23:59:59.999Z",
  "usageLimit": 1000,
  "userLimit": 1,
  "applicableCategories": ["675a1b2c3d4e5f6g7h8i9j0k"],
  "applicableProducts": ["675a1b2c3d4e5f6g7h8i9j0l"]
}
```

**Field Requirements:**
- `code` (required): Discount code (will be converted to uppercase, must be unique)
- `discountType` (required): "percentage" or "fixed"
- `discountValue` (required): Percentage (0-100) or fixed amount
- `validFrom` (required): Start date (ISO date string)
- `validUntil` (required): End date (ISO date string)
- `description` (optional): Code description
- `minOrderValue` (optional): Minimum order value (default: 0)
- `maxDiscount` (optional): Maximum discount amount (for percentage codes)
- `usageLimit` (optional): Total usage limit (null = unlimited)
- `userLimit` (optional): Usage limit per user (default: 1)
- `applicableCategories` (optional): Array of category IDs (empty = all categories)
- `applicableProducts` (optional): Array of product IDs (empty = all products)

**Success Response (201):**
```json
{
  "success": true,
  "message": "Discount code created",
  "code": {
    "_id": "...",
    "code": "SAVE20",
    "isActive": true,
    ...
  }
}
```

---

### 5. Update Discount Code (Admin Only)

**What it does:** Updates an existing discount code (Admin only).

**Endpoint:** `PUT /api/discounts/:id`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**URL Parameters:**
- `id` (required): Discount code ID

**Request Body:**
```json
{
  "isActive": false,
  "usageLimit": 2000
}
```

**Note:** You can update any field. Only include fields you want to change.

---

### 6. Delete Discount Code (Admin Only)

**What it does:** Deletes a discount code (Admin only).

**Endpoint:** `DELETE /api/discounts/:id`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
```

**URL Parameters:**
- `id` (required): Discount code ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Discount code deleted"
}
```

---

## Data Models

### User Model

```javascript
{
  _id: ObjectId,                    // Unique user ID
  title: String,                    // Optional: "Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", or ""
  firstname: String,                // Required
  lastname: String,                 // Required
  email: String,                    // Required, Unique
  phone: String,                    // Optional, Unique
  password: String,                 // Hashed password (for email/password users)
  gender: String,                   // Optional: "Male", "Female", "Other", or ""
  role: String,                     // "user" | "admin" (default: "user")
  avatar: String,                   // Profile picture URL
  googleId: String,                 // Google OAuth ID (optional)
  facebookId: String,               // Facebook OAuth ID (optional)
  isVerified: Boolean,              // Email verification status (default: false)
  verificationCode: String,          // 6-digit code for 2FA
  verificationCodeExpiry: Date,     // Code expiry time
  resetCode: String,                // 4-digit code for password reset
  resetCodeExpiry: Date,            // Reset code expiry time
  lastSelectedCategory: ObjectId,   // Last category user viewed (reference to Category). Updated automatically when user accesses a category.
  marketingPreferences: {          // Marketing communication preferences
    email: Boolean,                 // Email marketing (default: false)
    sms: Boolean,                   // SMS marketing (default: false)
    push: Boolean                   // Push notifications (default: false)
  },
  defaultAddress: ObjectId,         // Reference to default shipping Address (optional)
  createdAt: Date,                  // Account creation date
  updatedAt: Date                   // Last update date
}
```

### Product Model

```javascript
{
  _id: ObjectId,                    // Unique product ID
  title: String,                    // Required
  description: String,              // Required
  price: Number,                    // Required (base price in currency)
  currency: String,                 // Default: "NGN" (base currency)
  displayCurrency: String,          // Default: "USD" (display currency, e.g., "$56.99")
  displayPrice: Number,             // Display price in displayCurrency (optional)
  discountPercentage: Number,      // Default: 0
  category: ObjectId,               // Required, Reference to Category
  brand: String,                    // Brand name (e.g., "Gagnon")
  releaseDate: Date,                // Product release date
  images: [String],                 // Array of image URLs
  tags: [String],                   // Array of tags
  rating: Number,                   // Default: 0, Range: 0-5
  stock: Number,                    // Default: 0 (total stock, sum of all variants if hasVariants is true)
  salesCount: Number,               // Default: 0 (number of units sold)
  hasVariants: Boolean,             // Default: false (whether product has size/color variants)
  createdBy: ObjectId,              // Reference to User (admin)
  // Featured product fields
  isFeatured: Boolean,             // Default: false
  featuredAt: Date,                // When product was featured
  featuredUntil: Date,              // Optional expiry date for feature
  // Product badges
  badges: [String],                // Manual badges: ["HOT", "NEW", "SALE", "BESTSELLER", "LIMITED"]
  // Computed fields (not stored in DB, returned in API)
  calculatedBadges: [String],      // Auto-calculated based on product properties (HOT, NEW, SALE, LIMITED)
  isInFavorites: Boolean,          // Whether product is in user's favorites (if authenticated)
  variants: [ProductVariant],      // Array of variants (if hasVariants is true, populated from ProductVariant model)
  createdAt: Date,
  updatedAt: Date
}
```

**Note:** 
> - If `hasVariants` is `true`, the product will have variants stored in the `ProductVariant` model. The `stock` field represents the total stock across all variants.
> - `calculatedBadges` are automatically computed based on product properties (e.g., discount percentage, release date, sales count).
> - `isInFavorites` is only included in responses for authenticated users.

### Category Model

```javascript
{
  _id: ObjectId,                    // Unique category ID
  name: String,                     // Required, Unique
  image: String,                    // Category image URL
  icon: String,                     // Icon URL for circular category icons (used in mobile UI)
  parentCategory: ObjectId,         // Optional, Reference to Category (for nested categories)
  displayOrder: Number,             // For sorting categories (default: 0). Lower numbers appear first.
  createdAt: Date,
  updatedAt: Date
}
```

### Favorites Model

```javascript
{
  _id: ObjectId,                    // Unique favorite entry ID
  user: ObjectId,                   // Required, Reference to User
  product: ObjectId,                // Required, Reference to Product
  createdAt: Date,                  // When added to favorites
  updatedAt: Date                   // Last update date
}
```

### SearchHistory Model

```javascript
{
  _id: ObjectId,                    // Unique search ID
  user: ObjectId,                   // Required, Reference to User
  query: String,                    // Required, Search term
  createdAt: Date                  // Search timestamp
}
```

### Notification Model

```javascript
{
  _id: ObjectId,                    // Unique notification ID
  user: ObjectId,                   // Required, Reference to User
  title: String,                    // Required
  message: String,                  // Required
  type: String,                     // "order" | "promotion" | "system"
  isRead: Boolean,                  // Default: false
  relatedId: ObjectId,              // Reference to related entity (optional)
  createdAt: Date,
  updatedAt: Date
}
```

### ProductVariant Model

```javascript
{
  _id: ObjectId,                    // Unique variant ID
  product: ObjectId,                // Required, Reference to Product
  size: String,                     // Required: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | "One Size"
  color: String,                    // Required, Color name (e.g., "Navy Blue", "Rose pink")
  colorCode: String,                // Optional, Hex color code (e.g., "#FF69B4")
  price: Number,                    // Optional, Variant-specific price (defaults to product price)
  stock: Number,                    // Default: 0, Stock for this specific variant
  images: [String],                 // Optional, Variant-specific images
  sku: String,                      // Unique Stock Keeping Unit (auto-generated)
  createdAt: Date,
  updatedAt: Date
}
```

**Note:**
- Variants are automatically created when a product is created with both `sizes` and `colors` arrays
- Each variant gets a unique SKU in format: `{productId}-{size}-{colorCode}`
- The combination of `product`, `size`, and `color` must be unique
- Variant stock is tracked separately from product stock
- When adding variants to cart, use the `variantId` field

### Cart Model

```javascript
{
  _id: ObjectId,                    // Unique cart ID
  user: ObjectId,                   // Required, Reference to User
  items: [CartItem],                // Array of cart items
  subtotal: Number,                 // Calculated subtotal
  itemCount: Number,                // Number of unique items
  totalItems: Number,                // Total quantity of all items
  createdAt: Date,
  updatedAt: Date
}
```

### CartItem Model

```javascript
{
  _id: ObjectId,                    // Unique cart item ID
  cart: ObjectId,                   // Required, Reference to Cart
  product: ObjectId,                 // Required, Reference to Product
  variant: ObjectId,                 // Optional, Reference to ProductVariant (if product has variants)
  size: String,                     // Optional, Size (legacy support)
  color: Object,                    // Optional, Color object (legacy support)
  quantity: Number,                  // Required, Quantity (min: 1)
  price: Number,                    // Price at time of adding to cart
  subtotal: Number,                 // Calculated: quantity × price
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model

```javascript
{
  _id: ObjectId,                    // Unique order ID
  orderNumber: String,               // Unique order number (format: "ORD-XXXXX-XXXX")
  user: ObjectId,                   // Required, Reference to User
  shippingAddress: ObjectId,         // Required, Reference to Address
  shippingMethod: ObjectId,         // Required, Reference to ShippingMethod
  items: [OrderItem],                // Array of order items
  subtotal: Number,                 // Subtotal before discounts
  shippingCost: Number,             // Shipping cost
  discountCode: String,             // Optional, Discount code used
  discountAmount: Number,           // Discount amount applied
  tax: Number,                      // Tax amount
  total: Number,                    // Final total
  currency: String,                 // Currency code (default: "NGN")
  status: String,                   // "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  paymentStatus: String,            // "pending" | "paid" | "failed" | "refunded"
  paymentMethod: String,            // "card" | "bank_transfer" | "cash_on_delivery"
  estimatedDelivery: Date,          // Optional, Estimated delivery date
  notes: String,                    // Optional, Order notes
  createdAt: Date,
  updatedAt: Date
}
```

### OrderItem Model

```javascript
{
  _id: ObjectId,                    // Unique order item ID
  order: ObjectId,                  // Required, Reference to Order
  product: ObjectId,                // Required, Reference to Product
  variant: ObjectId,                // Optional, Reference to ProductVariant
  size: String,                     // Optional, Size
  color: Object,                    // Optional, Color object
  quantity: Number,                 // Required, Quantity ordered
  price: Number,                    // Price at time of order
  subtotal: Number,                 // Calculated: quantity × price
  createdAt: Date
}
```

### Address Model

```javascript
{
  _id: ObjectId,                    // Unique address ID
  user: ObjectId,                   // Required, Reference to User
  title: String,                    // Optional: "Mr", "Mrs", "Ms", "Miss", "Dr", "Prof", or ""
  firstname: String,                // Required
  lastname: String,                 // Required
  email: String,                    // Required
  phone: String,                    // Required
  country: String,                  // Default: "Nigeria"
  region: String,                   // State/Province
  city: String,                     // Required
  address: String,                  // Required, Street address
  postalCode: String,               // Optional, Postal/ZIP code
  isDefault: Boolean,              // Default: false
  addressType: String,             // "home" | "work" | "other" (default: "home")
  createdAt: Date,
  updatedAt: Date
}
```

### ShippingMethod Model

```javascript
{
  _id: ObjectId,                    // Unique shipping method ID
  name: String,                     // Required, Unique (e.g., "DHL EXPRESS INTERNATIONAL")
  description: String,             // Optional
  deliveryTime: String,             // Optional (e.g., "10 business days")
  deliveryTimeDays: Number,         // Optional, Number of days
  baseCost: Number,                 // Default: 0, Base shipping cost
  costPerKg: Number,                // Default: 0, Cost per kilogram
  availableCountries: [String],     // Optional, Array of country names (empty = all countries)
  minOrderValue: Number,            // Default: 0, Minimum order value for free shipping
  maxWeight: Number,                 // Optional, Maximum weight in kg
  icon: String,                     // Optional, Icon URL
  isActive: Boolean,                // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### DiscountCode Model

```javascript
{
  _id: ObjectId,                    // Unique discount code ID
  code: String,                     // Required, Unique, Uppercase (e.g., "SAVE20")
  description: String,              // Optional
  discountType: String,            // Required: "percentage" | "fixed"
  discountValue: Number,           // Required, Percentage (0-100) or fixed amount
  minOrderValue: Number,           // Default: 0, Minimum order value
  maxDiscount: Number,             // Optional, Maximum discount amount (for percentage codes)
  validFrom: Date,                 // Required, Start date
  validUntil: Date,                // Required, End date
  usageLimit: Number,               // Optional, Total usage limit (null = unlimited)
  usageCount: Number,               // Default: 0, Current usage count
  userLimit: Number,                // Default: 1, Usage limit per user
  applicableCategories: [ObjectId], // Optional, Array of category IDs (empty = all categories)
  applicableProducts: [ObjectId],   // Optional, Array of product IDs (empty = all products)
  isActive: Boolean,               // Default: true
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model

```javascript
{
  _id: ObjectId,                    // Unique review ID
  user: ObjectId,                   // Required, Reference to User
  product: ObjectId,                // Required, Reference to Product
  rating: Number,                   // Required, Range: 1-5
  title: String,                   // Optional, Review title
  comment: String,                 // Optional, Review text
  images: [String],                // Optional, Array of image URLs
  status: String,                  // "pending" | "approved" | "rejected" (default: "pending")
  adminReply: String,              // Optional, Admin reply to review
  adminReplyAt: Date,              // Optional, When admin replied
  createdAt: Date,
  updatedAt: Date
}
```

---

## Frontend Integration Guide

This section provides practical examples for frontend developers integrating with the LX API.

### Setting Up API Client

#### JavaScript/TypeScript (Fetch API)

```typescript
// api/client.ts
const API_BASE_URL = 'http://localhost:3000/api';

class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }

    return data;
  }

  // Authentication methods
  async register(userData: RegisterData) {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyRegistration(email: string, code: string) {
    const response = await this.request<VerifyResponse>('/auth/verify-registration', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(email: string, password: string) {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async verifyLogin(email: string, code: string) {
    const response = await this.request<VerifyResponse>('/auth/verify-login', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // Product methods
  async getProducts(params?: ProductQueryParams) {
    const queryString = new URLSearchParams(
      params as Record<string, string>
    ).toString();
    return this.request<ProductsResponse>(`/products?${queryString}`);
  }

  async getProduct(id: string) {
    return this.request<ProductResponse>(`/products/${id}`);
  }

  // Cart methods
  async getCart() {
    return this.request<CartResponse>('/cart');
  }

  async addToCart(productId: string, variantId?: string, quantity: number = 1) {
    return this.request<CartItemResponse>('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, variantId, quantity }),
    });
  }

  // Order methods
  async createOrder(orderData: CreateOrderData) {
    return this.request<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }
}

export const apiClient = new APIClient(API_BASE_URL);
```

### 2FA Flow Implementation

```typescript
// Example: Registration flow with 2FA
async function handleRegistration(userData: RegisterData) {
  try {
    // Step 1: Initiate registration
    const registerResponse = await apiClient.register(userData);
    
    // Show verification code input
    const code = await promptForVerificationCode(registerResponse.email);
    
    // Step 2: Verify registration
    const verifyResponse = await apiClient.verifyRegistration(
      registerResponse.email,
      code
    );
    
    // User is now logged in (token stored automatically)
    console.log('Registration successful!', verifyResponse.user);
    return verifyResponse;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// Example: Login flow with 2FA
async function handleLogin(email: string, password: string) {
  try {
    // Step 1: Initiate login
    const loginResponse = await apiClient.login(email, password);
    
    // Show verification code input
    const code = await promptForVerificationCode(email);
    
    // Step 2: Verify login
    const verifyResponse = await apiClient.verifyLogin(email, code);
    
    // User is now logged in
    console.log('Login successful!', verifyResponse.user);
    return verifyResponse;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### Product Variants Handling

```typescript
// Example: Displaying product with variants
async function displayProduct(productId: string) {
  const product = await apiClient.getProduct(productId);
  
  if (product.product.hasVariants && product.product.variants) {
    // Group variants by size and color
    const variantsBySize = groupVariantsBySize(product.product.variants);
    const availableColors = getAvailableColors(product.product.variants);
    
    // Display size and color selectors
    renderVariantSelector(variantsBySize, availableColors);
  } else {
    // Simple product without variants
    renderSimpleProduct(product.product);
  }
}

// Example: Adding variant product to cart
async function addVariantToCart(
  productId: string,
  variantId: string,
  quantity: number
) {
  try {
    const response = await apiClient.addToCart(productId, variantId, quantity);
    console.log('Item added to cart:', response);
    return response;
  } catch (error) {
    if (error.message.includes('Insufficient stock')) {
      // Handle stock error
      showStockError(error.message);
    }
    throw error;
  }
}
```

### Search with Auto-History

```typescript
// Example: Search products (automatically saves to history if authenticated)
async function searchProducts(query: string) {
  try {
    const response = await apiClient.getProducts({ search: query });
    // Search is automatically saved to user's history if authenticated
    return response.products;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
}

// Get user's search history
async function getSearchHistory() {
  try {
    const response = await apiClient.request<SearchHistoryResponse>(
      '/user/search-history'
    );
    return response.history;
  } catch (error) {
    console.error('Failed to get search history:', error);
    throw error;
  }
}
```

### Error Handling Best Practices

```typescript
// Example: Comprehensive error handling
async function handleAPIRequest<T>(
  request: () => Promise<T>
): Promise<T> {
  try {
    return await request();
  } catch (error: any) {
    // Handle specific error types
    if (error.message.includes('Not authorized')) {
      // Token expired or invalid
      apiClient.clearToken();
      redirectToLogin();
      throw new Error('Session expired. Please login again.');
    }
    
    if (error.message.includes('Not found')) {
      // Resource not found
      showNotFoundError();
      throw error;
    }
    
    if (error.message.includes('expired')) {
      // Verification code expired
      showExpiredCodeError();
      throw error;
    }
    
    // Generic error
    showGenericError(error.message);
    throw error;
  }
}
```

### React Hook Example

```typescript
// Example: Custom React hook for products
import { useState, useEffect } from 'react';
import { apiClient } from './api/client';

export function useProducts(filters?: ProductQueryParams) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const response = await apiClient.getProducts(filters);
        setProducts(response.products);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters]);

  return { products, loading, error };
}

// Usage in component
function ProductList() {
  const { products, loading, error } = useProducts({ 
    category: '675a1b2c3d4e5f6g7h8i9j0l',
    page: 1,
    limit: 20
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
}
```

---

## Error Handling

### HTTP Status Codes

The API uses standard HTTP status codes:

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or invalid token
- **403 Forbidden** - Insufficient permissions (not admin)
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Technical error details (optional)"
}
```

### Common Error Scenarios

#### 1. Authentication Errors

**Missing Token:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**Expired Token:**
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

#### 2. Validation Errors

**Invalid ObjectId:**
```json
{
  "success": false,
  "message": "Invalid category ID format. Please provide a valid category ID.",
  "error": "\"1234567890\" is not a valid MongoDB ObjectId"
}
```

**Missing Required Fields:**
```json
{
  "success": false,
  "message": "Title, description, price, and category are required"
}
```

**Duplicate Entry:**
```json
{
  "success": false,
  "message": "Email already exists",
  "field": "email"
}
```

#### 3. Not Found Errors

**Resource Not Found:**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**User Not Found:**
```json
{
  "success": false,
  "message": "User not found. Please sign up first.",
  "redirectTo": "signup"
}
```

#### 4. Permission Errors

**Not Admin:**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

## Best Practices

### For Frontend Developers

1. **Store JWT Token Securely**
   - Store token in localStorage or httpOnly cookies
   - Never expose token in URLs or logs
   - Include token in Authorization header for protected routes

2. **Handle 2FA Flow**
   - Show verification code input after registration/login
   - Display countdown timer (10 minutes expiry)
   - Allow resending code if needed
   - Handle expired codes gracefully

3. **Error Handling**
   - Always check `success` field in responses
   - Display user-friendly error messages
   - Handle network errors and timeouts
   - Implement retry logic for failed requests

4. **Loading States**
   - Show loading indicators during API calls
   - Disable buttons during requests
   - Provide feedback for user actions

5. **Form Validation**
   - Validate on frontend before sending requests
   - Match passwords before submission
   - Validate email format
   - Check required fields

### For API Consumers

1. **Rate Limiting**
   - Be mindful of request frequency
   - Implement exponential backoff for retries
   - Cache responses when appropriate

2. **Pagination**
   - Always use pagination for list endpoints
   - Don't request more than 100 items per page
   - Use page and limit parameters

3. **Filtering & Search**
   - Use query parameters for filtering
   - Combine multiple filters when needed
   - Use `search` parameter for text search (searches title, description, and tags)
   - Search automatically saves to history for authenticated users
   - Search is case-insensitive and supports partial matches

4. **Error Handling**
   - Always check response status codes
   - Handle all error scenarios
   - Log errors for debugging
   - Provide user feedback

---

## Testing

### Test Scripts

#### Run All Tests
```bash
node backend/test-api.js
```

#### Test Email Configuration
```bash
node backend/test-gmail-config.js
```

#### Test 2FA Flow
```bash
node backend/test-2fa.js
```

### Manual Testing

#### Test Registration Flow
1. Register a new user
2. Check email for verification code
3. Verify registration with code
4. Confirm JWT token is received

#### Test Login Flow
1. Login with email and password
2. Check email for verification code
3. Verify login with code
4. Confirm JWT token is received

#### Test Product Creation
1. Login as admin
2. Get categories list
3. Create a product with valid category ID
4. Verify product appears in list

---

## Important Notes

### Email Configuration

- **Gmail is required** for 2FA to work properly
- Emails are marked as **high priority** to avoid spam
- Verification codes expire after **10 minutes**
- Codes are **one-time use** only

### Admin Account

- **Email:** `gianosamsung@gmail.com`
- **Password:** `Admin@LX2024`
- Only this email has admin privileges
- Admin users bypass some restrictions

### OAuth Users

- Google/Facebook users are **automatically verified**
- OAuth users **don't need 2FA** for login
- OAuth users **cannot reset password** (no password set)

### Security Features

- All passwords are **hashed** using bcrypt
- JWT tokens expire after **7 days**
- Verification codes expire after **10 minutes**
- Email verification required for all accounts

### Data Validation

- All IDs must be valid MongoDB ObjectIds
- Category IDs are validated before product creation
- Parent category IDs are validated before subcategory creation
- Email and phone must be unique

### Search Functionality

- **Automatic History Saving:** When authenticated users search using `GET /api/products?search=<query>`, the search is automatically saved to their search history
- **Duplicate Prevention:** Duplicate searches within 1 hour are not saved to prevent spam
- **Search Scope:** Searches across product title, description, and tags (case-insensitive)
- **No Authentication Required:** Search works for all users, but history is only saved for authenticated users

---

## TypeScript Types

For TypeScript projects, here are the type definitions for common API responses:

```typescript
// Base response types
interface APIResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// User types
interface User {
  _id: string;
  title?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  gender?: string;
  role: 'user' | 'admin';
  avatar?: string;
  isVerified: boolean;
  marketingPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  defaultAddress?: Address;
  lastSelectedCategory?: Category;
  createdAt: string;
  updatedAt: string;
}

// Product types
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  displayCurrency?: string;
  displayPrice?: number;
  discountPercentage: number;
  category: Category | string;
  brand?: string;
  releaseDate?: string;
  images: string[];
  tags: string[];
  rating: number;
  stock: number;
  salesCount: number;
  hasVariants: boolean;
  variants?: ProductVariant[];
  isFeatured: boolean;
  badges?: string[];
  calculatedBadges?: string[];
  isInFavorites?: boolean;
  isAvailable: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  _id: string;
  product: string;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL' | 'One Size';
  color: string;
  colorCode?: string;
  price?: number;
  stock: number;
  images?: string[];
  sku: string;
  createdAt: string;
  updatedAt: string;
}

// Category types
interface Category {
  _id: string;
  name: string;
  image?: string;
  icon?: string;
  parentCategory?: Category | string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Cart types
interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

interface CartItem {
  _id: string;
  cart: string;
  product: Product;
  variant?: ProductVariant;
  size?: string;
  color?: { name: string; hex: string };
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

// Order types
interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discountCode?: string;
  discountAmount: number;
  tax: number;
  total: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  _id: string;
  order: string;
  product: Product;
  variant?: ProductVariant;
  size?: string;
  color?: { name: string; hex: string };
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
}

// Address types
interface Address {
  _id: string;
  user: string;
  title?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  country: string;
  region?: string;
  city: string;
  address: string;
  postalCode?: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  createdAt: string;
  updatedAt: string;
}

// Shipping types
interface ShippingMethod {
  _id: string;
  name: string;
  description?: string;
  deliveryTime?: string;
  deliveryTimeDays?: number;
  baseCost: number;
  costPerKg: number;
  availableCountries: string[];
  minOrderValue: number;
  maxWeight?: number;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Discount types
interface DiscountCode {
  _id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usageCount: number;
  userLimit: number;
  applicableCategories: string[];
  applicableProducts: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Review types
interface Review {
  _id: string;
  user: User | string;
  product: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  adminReply?: string;
  adminReplyAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
interface RegisterData {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  expiresIn: string;
  isFallback: boolean;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

interface LoginResponse {
  success: boolean;
  message: string;
  userId: string;
  email: string;
  expiresIn: string;
  isFallback: boolean;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  totalPages: number;
  currentPage: number;
  total: number;
}

interface ProductResponse {
  success: boolean;
  product: Product;
}

interface ProductQueryParams {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string;
  page?: number;
  limit?: number;
}

interface CartResponse {
  success: boolean;
  cart: Cart;
}

interface CreateOrderData {
  shippingAddressId: string;
  shippingMethodId: string;
  discountCode?: string;
  paymentMethod?: string;
  notes?: string;
}

interface OrderResponse {
  success: boolean;
  message: string;
  order: Order;
  orderItems: OrderItem[];
}
```

---

## Health Check Endpoint

### Get Server Health Status

**What it does:** Returns the current health status of the API server.

**Endpoint:** `GET /health`

**Authentication:** Not required (public endpoint)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

**Example Request (cURL):**
```bash
curl http://localhost:3000/health
```

**Use Cases:**
- Server health monitoring
- Load balancer health checks
- CI/CD pipeline verification
- Frontend connection testing

---

##  API Versioning

Currently, the API is at **version 1.0.0**. Future versions will be indicated in the URL:

- Current: `/api/...`
- Future: `/api/v2/...`

---

##  Support & Contact

For issues, questions, or feature requests:

- **Email:** gianosamsung@gmail.com
- **Documentation:** This file
- **Test Scripts:** Available in `backend/` directory

---

## License

This API is proprietary software. All rights reserved.

---

**Last Updated:** January 2025  
**API Version:** 1.0.0  
**Documentation Version:** 2.0.0

---

## Changelog

### Version 2.0.0 (January 2025)
- **Major Documentation Update**
- Added comprehensive Frontend Integration Guide with code examples
- Added TypeScript type definitions for all models and responses
- Added Product Variant model documentation
- Added Cart, Order, Address, Shipping, Discount, and Review model documentation
- Enhanced product creation documentation with variant examples
- Added product response examples with variants
- Added Health Check endpoint documentation
- Improved Table of Contents with all endpoint categories
- Added React hook examples
- Added comprehensive error handling examples
- Enhanced Getting Started section with health check verification
- Improved product variant handling documentation

### Version 1.1.0 (January 2025)
- Added automatic search history saving for authenticated users
- Enhanced search functionality with case-insensitive regex matching
- Added Featured Products endpoint
- Added Active Category endpoint
- Added Update and Delete Category endpoints
- Updated Product model documentation with badges and featured fields
- Updated Category model with icon and displayOrder fields
- Improved search history response format documentation
- Added seed scripts documentation for categories and products
