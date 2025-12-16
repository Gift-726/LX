# McGeorge LX - Complete API Documentation

**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api`  
**Last Updated:** 2025

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Authentication & Security](#authentication--security)
4. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [Products](#products-endpoints)
   - [Categories](#categories-endpoints)
   - [User Management](#user-management-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)
8. [Testing](#testing)

---

## 🎯 Introduction

### What is McGeorge LX API?

McGeorge LX is a comprehensive e-commerce backend API that provides secure authentication, product management, category organization, and user features. The API is designed with security in mind, featuring two-factor authentication (2FA) for all user accounts.

### Key Features

- ✅ **Two-Factor Authentication (2FA)** - Secure login and registration with email verification
- ✅ **Gmail Integration** - Professional email delivery for verification codes
- ✅ **OAuth Support** - Google and Facebook social login
- ✅ **Password Reset** - Secure password recovery via email
- ✅ **Product Management** - Full CRUD operations for products
- ✅ **Category Management** - Hierarchical category system
- ✅ **User Profiles** - User information and preferences
- ✅ **Search History** - Track user search queries
- ✅ **Notifications** - User notification system

### Who Can Use This Documentation?

- **Frontend Developers** - Integrate the API into web or mobile applications
- **Backend Developers** - Understand the API structure and data flow
- **Project Managers** - Understand system capabilities and requirements
- **QA Testers** - Test API endpoints and functionality
- **Non-Technical Stakeholders** - Understand what the system can do

---

## 🚀 Getting Started

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
MONGODB_URI=mongodb://localhost:27017/mcgeorge-lx

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

> **📧 Gmail Setup:** To get an App Password, go to [Google App Passwords](https://myaccount.google.com/apppasswords) and generate one for "Mail".

#### Step 3: Seed the Database

Create the admin account:
```bash
node backend/seed-admin.js
```

#### Step 4: Start the Server
```bash
node backend/server.js
```

The server will start on `http://localhost:3000`

#### Step 5: Test the API
```bash
node backend/test-api.js
```

---

## 🔐 Authentication & Security

### Overview

McGeorge LX uses **Two-Factor Authentication (2FA)** for enhanced security. This means:

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
**Admin Password:** `Admin@McGeorge2024`

> ⚠️ **Important:** Only this email address automatically receives admin privileges. All other users are regular users.

**Admin Capabilities:**
- Create, update, and delete products
- Create categories
- Full access to all endpoints

---

## 📚 API Endpoints

### Base URL

All API endpoints start with: `http://localhost:3000/api`

---

## 🔑 Authentication Endpoints

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

## 📦 Products Endpoints

Base Path: `/api/products`

### 1. Get All Products

**What it does:** Retrieves a list of products with optional filtering, searching, and pagination.

**Endpoint:** `GET /api/products`

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `category` (optional): Filter by category ID
- `search` (optional): Search in title, description, and tags
- `minPrice` (optional): Minimum price filter
- `maxPrice` (optional): Maximum price filter
- `tags` (optional): Comma-separated tags (e.g., "Men,Casual")
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Example Request:**
```http
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

### 2. Get Recommended Products

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

### 3. Get Product by ID

**What it does:** Retrieves detailed information about a specific product.

**Endpoint:** `GET /api/products/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (required): Product ID

**Success Response (200):**
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
    "createdBy": "675a1b2c3d4e5f6g7h8i9j0m",
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

### 4. Create Product

**What it does:** Creates a new product (Admin only).

**Endpoint:** `POST /api/products`

**Authentication:** Required (Admin only)

**Request Headers:**
```http
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Premium Suit",
  "description": "High-quality business suit made from premium materials",
  "price": 2999.99,
  "currency": "NGN",
  "discountPercentage": 15,
  "category": "675a1b2c3d4e5f6g7h8i9j0l",
  "images": [
    "https://example.com/suit1.jpg",
    "https://example.com/suit2.jpg"
  ],
  "tags": ["Men", "Formal", "Business"],
  "stock": 50
}
```

**Field Requirements:**
- `title` (required): Product name
- `description` (required): Product description
- `price` (required): Product price (number)
- `category` (required): Valid category ID (MongoDB ObjectId)
- `currency` (optional): Currency code (default: "NGN")
- `discountPercentage` (optional): Discount percentage (default: 0)
- `images` (optional): Array of image URLs
- `tags` (optional): Array of tag strings
- `stock` (optional): Stock quantity (default: 0)

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

### 5. Update Product

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

### 6. Delete Product

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

## 📁 Categories Endpoints

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
      "name": "Electronics",
      "image": "https://example.com/electronics.jpg",
      "parentCategory": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0m",
      "name": "Smartphones",
      "image": "https://example.com/smartphones.jpg",
      "parentCategory": {
        "_id": "675a1b2c3d4e5f6g7h8i9j0l",
        "name": "Electronics"
      },
      "createdAt": "2024-01-15T10:05:00.000Z",
      "updatedAt": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

---

### 2. Get Category by ID

**What it does:** Retrieves detailed information about a specific category.

**Endpoint:** `GET /api/categories/:id`

**Authentication:** Not required

**URL Parameters:**
- `id` (required): Category ID

**Success Response (200):**
```json
{
  "success": true,
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

### 3. Create Category

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
  "image": "https://example.com/electronics.jpg"
}
```

**Request Body (Subcategory):**
```json
{
  "name": "Smartphones",
  "image": "https://example.com/smartphones.jpg",
  "parentCategory": "675a1b2c3d4e5f6g7h8i9j0l"
}
```

**Field Requirements:**
- `name` (required): Category name (must be unique)
- `image` (optional): Category image URL
- `parentCategory` (optional): Parent category ID (for nested categories). Leave empty or null for top-level categories.

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

## 👤 User Management Endpoints

Base Path: `/api/user`

> **⚠️ All endpoints in this section require authentication.** Include the JWT token in the Authorization header.

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
    "firstname": "John",
    "lastname": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "avatar": "https://example.com/avatar.jpg",
    "isVerified": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
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

---

### 2. Get Search History

**What it does:** Retrieves the user's search history.

**Endpoint:** `GET /api/user/search-history`

**Authentication:** Required

**Query Parameters:**
- `limit` (optional): Number of recent searches to return (default: 10)

**Success Response (200):**
```json
{
  "success": true,
  "searches": [
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0n",
      "query": "summer dresses",
      "createdAt": "2024-01-15T12:00:00.000Z"
    },
    {
      "_id": "675a1b2c3d4e5f6g7h8i9j0o",
      "query": "formal suits",
      "createdAt": "2024-01-15T11:30:00.000Z"
    }
  ]
}
```

---

### 3. Save Search History

**What it does:** Saves a search query to the user's search history.

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
  "message": "Search saved successfully",
  "search": {
    "_id": "675a1b2c3d4e5f6g7h8i9j0n",
    "query": "summer dresses",
    "user": "675a1b2c3d4e5f6g7h8i9j0k",
    "createdAt": "2024-01-15T12:00:00.000Z"
  }
}
```

---

### 4. Clear Search History

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

### 5. Get Notifications

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

### 6. Get Unread Notification Count

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

### 7. Mark Notification as Read

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

## 🗄️ Data Models

### User Model

```javascript
{
  _id: ObjectId,                    // Unique user ID
  firstname: String,                // Required
  lastname: String,                 // Required
  email: String,                    // Required, Unique
  phone: String,                    // Optional, Unique
  password: String,                 // Hashed password (for email/password users)
  role: String,                     // "user" | "admin" (default: "user")
  avatar: String,                   // Profile picture URL
  googleId: String,                 // Google OAuth ID (optional)
  facebookId: String,               // Facebook OAuth ID (optional)
  isVerified: Boolean,              // Email verification status (default: false)
  verificationCode: String,          // 6-digit code for 2FA
  verificationCodeExpiry: Date,     // Code expiry time
  resetCode: String,                // 4-digit code for password reset
  resetCodeExpiry: Date,            // Reset code expiry time
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
  price: Number,                    // Required
  currency: String,                 // Default: "NGN"
  discountPercentage: Number,      // Default: 0
  category: ObjectId,               // Required, Reference to Category
  images: [String],                 // Array of image URLs
  tags: [String],                   // Array of tags
  rating: Number,                   // Default: 0, Range: 0-5
  stock: Number,                    // Default: 0
  createdBy: ObjectId,              // Reference to User (admin)
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model

```javascript
{
  _id: ObjectId,                    // Unique category ID
  name: String,                     // Required, Unique
  image: String,                    // Category image URL
  parentCategory: ObjectId,         // Optional, Reference to Category (for nested categories)
  createdAt: Date,
  updatedAt: Date
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

---

## ⚠️ Error Handling

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

## 💡 Best Practices

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

3. **Filtering**
   - Use query parameters for filtering
   - Combine multiple filters when needed
   - Use search parameter for text search

4. **Error Handling**
   - Always check response status codes
   - Handle all error scenarios
   - Log errors for debugging
   - Provide user feedback

---

## 🧪 Testing

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

## 📝 Important Notes

### Email Configuration

- **Gmail is required** for 2FA to work properly
- Emails are marked as **high priority** to avoid spam
- Verification codes expire after **10 minutes**
- Codes are **one-time use** only

### Admin Account

- **Email:** `gianosamsung@gmail.com`
- **Password:** `Admin@McGeorge2024`
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

---

## 🔄 API Versioning

Currently, the API is at **version 1.0.0**. Future versions will be indicated in the URL:

- Current: `/api/...`
- Future: `/api/v2/...`

---

## 📞 Support & Contact

For issues, questions, or feature requests:

- **Email:** gianosamsung@gmail.com
- **Documentation:** This file
- **Test Scripts:** Available in `backend/` directory

---

## 📄 License

This API is proprietary software. All rights reserved.

---

**Last Updated:** 2024  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0
