# Admin Management Backend Implementation

This document outlines the backend implementation for admin management features including Products, Orders, and Users management.

## Overview

The admin management system provides:
1. **Products Management** - List, filter, and manage products
2. **Orders Management** - View, filter, and update order statuses
3. **Users Management** - List, search, suspend, and delete users
4. **Order Details** - Detailed order view with customer and product information

---

## New Features

### 1. User Suspension System
- Added `isSuspended`, `suspendedAt`, `suspendedBy`, and `suspensionReason` fields to User model
- Admins can suspend/unsuspend users
- View list of suspended users
- Get count of suspended users

### 2. Admin Product Listing
- Advanced filtering (category, price range, stock range, availability status)
- Search functionality
- Status display (active/inactive)

### 3. Admin Order Management
- Filter orders by status (All, Pending, Shipped, Completed)
- Search orders by order number, customer email, or phone
- Detailed order view with formatted customer and product info

---

## New Endpoints

### Products Management

#### 1. Get All Products (Admin)
**Endpoint:** `GET /api/products/admin/all`  
**Auth:** Required (Admin)  
**Query Params:**
- `search` - Search by title, description, or tags
- `category` - Filter by category ID
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `minStock` - Minimum stock filter
- `maxStock` - Maximum stock filter
- `isAvailable` - Filter by availability (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "title": "Rose Pink Gown",
      "category": {
        "name": "Shirts"
      },
      "price": 50000.99,
      "stock": 20,
      "status": "active",
      "isAvailable": true
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 10
}
```

---

### Orders Management

#### 1. Get All Orders (Admin - Updated)
**Endpoint:** `GET /api/orders/admin/all`  
**Auth:** Required (Admin)  
**Query Params:**
- `status` - Filter by status: "all", "pending", "shipped", "completed"
- `paymentStatus` - Filter by payment status
- `search` - Search by order number, email, or phone
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "orderNumber": "ORD-12345FG",
      "customerName": "Creative Omotayo",
      "total": 50000.98,
      "status": "pending",
      "displayStatus": "Pending",
      "createdAt": "2025-05-25T00:00:00.000Z",
      "user": {
        "firstname": "Creative",
        "lastname": "Omotayo",
        "email": "creative@example.com"
      }
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 5
}
```

#### 2. Get Order Details (Admin)
**Endpoint:** `GET /api/orders/admin/:id`  
**Auth:** Required (Admin)  
**Description:** Get detailed order information formatted for admin view

**Response:**
```json
{
  "success": true,
  "order": {
    "orderNumber": "ORD-12345FG",
    "total": 50000.98,
    "status": "pending",
    "customerInfo": {
      "name": "Creative Omotayo",
      "email": "creative@example.com",
      "phone": "0906 312 3433",
      "address": {
        "fullAddress": "Gwagwalada Abuja, Abuja, FCT, Nigeria",
        "address": "Gwagwalada Abuja",
        "city": "Abuja",
        "region": "FCT",
        "country": "Nigeria"
      }
    },
    "productInfo": [
      {
        "productName": "Rose Pink Gown",
        "quantity": "1pcs",
        "size": "XL",
        "color": "Rose Pink",
        "price": 50000.98,
        "subtotal": 50000.98
      }
    ],
    "paymentInfo": {
      "method": "Weighbill",
      "status": "pending",
      "reference": "N/A"
    },
    "deliveryInfo": {
      "method": "Standard Shipping",
      "status": "pending",
      "estimatedDelivery": null
    }
  },
  "orderItems": [...]
}
```

#### 3. Update Order Status (Admin)
**Endpoint:** `PUT /api/orders/:id/status`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "status": "shipped",
  "paymentStatus": "paid",
  "estimatedDelivery": "2025-06-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order status updated",
  "order": {...}
}
```

---

### Users Management

#### 1. Get All Users (Admin)
**Endpoint:** `GET /api/admin/users`  
**Auth:** Required (Admin)  
**Query Params:**
- `search` - Search by name or email
- `role` - Filter by role (user/admin)
- `isSuspended` - Filter by suspension status (true/false)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "firstname": "Creative",
      "lastname": "Omotayo",
      "email": "creative@example.com",
      "role": "user",
      "isSuspended": false,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 10
}
```

#### 2. Get User by ID (Admin)
**Endpoint:** `GET /api/admin/users/:id`  
**Auth:** Required (Admin)  
**Description:** Get detailed user information including addresses and order count

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "firstname": "James",
    "lastname": "Sussy Milburn",
    "email": "sussyjames@outlook.com",
    "phone": "+234 930 3287 895",
    "role": "user",
    "addresses": [
      {
        "address": "Shop B4, 1234 Shopping Complex, Along Lorem Way",
        "city": "Gwagwalada",
        "state": "Abuja",
        "zip": "900104"
      }
    ],
    "orderCount": 5
  }
}
```

#### 3. Update User (Admin)
**Endpoint:** `PUT /api/admin/users/:id`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "firstname": "James",
  "lastname": "Sussy Milburn",
  "email": "sussyjames@outlook.com",
  "phone": "+234 906 3287 855",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {...}
}
```

#### 4. Suspend User (Admin)
**Endpoint:** `PUT /api/admin/users/:id/suspend`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "reason": "Violation of terms of service"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User suspended successfully",
  "user": {
    "isSuspended": true,
    "suspendedAt": "2025-01-15T00:00:00.000Z",
    "suspendedBy": {...},
    "suspensionReason": "Violation of terms of service"
  }
}
```

#### 5. Unsuspend User (Admin)
**Endpoint:** `PUT /api/admin/users/:id/unsuspend`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "message": "User unsuspended successfully",
  "user": {
    "isSuspended": false,
    "suspendedAt": null,
    "suspendedBy": null,
    "suspensionReason": null
  }
}
```

#### 6. Get Suspended Users
**Endpoint:** `GET /api/admin/users/suspended`  
**Auth:** Required (Admin)  
**Query Params:**
- `search` - Search by name or email
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "_id": "...",
      "firstname": "Creative",
      "lastname": "Omotayo",
      "email": "creative@example.com",
      "isSuspended": true,
      "suspendedAt": "2025-01-15T00:00:00.000Z",
      "suspendedBy": {
        "firstname": "Admin",
        "lastname": "User"
      },
      "suspensionReason": "Violation of terms"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 5
}
```

#### 7. Get Suspended Users Count
**Endpoint:** `GET /api/admin/users/suspended/count`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "count": 5
}
```

#### 8. Delete User (Admin)
**Endpoint:** `DELETE /api/admin/users/:id`  
**Auth:** Required (Admin)  
**Description:** Permanently delete a user account

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** 
- Cannot delete your own account
- Cannot delete the main admin account (gianosamsung@gmail.com)

---

## Updated Models

### User Model
Added fields:
- `isSuspended` (Boolean, default: false) - Suspension status
- `suspendedAt` (Date) - When user was suspended
- `suspendedBy` (ObjectId, ref: User) - Admin who suspended
- `suspensionReason` (String) - Reason for suspension

---

## Usage Examples

### 1. Get Products with Filters
```bash
curl -X GET "http://localhost:3000/api/products/admin/all?category=CATEGORY_ID&minPrice=10000&maxPrice=100000&isAvailable=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Get Orders by Status
```bash
curl -X GET "http://localhost:3000/api/orders/admin/all?status=pending" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Update Order Status
```bash
curl -X PUT "http://localhost:3000/api/orders/ORDER_ID/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "paymentStatus": "paid"
  }'
```

### 4. Search Users
```bash
curl -X GET "http://localhost:3000/api/admin/users?search=creative&role=user" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 5. Suspend User
```bash
curl -X PUT "http://localhost:3000/api/admin/users/USER_ID/suspend" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Violation of terms of service"
  }'
```

### 6. Get Suspended Users
```bash
curl -X GET "http://localhost:3000/api/admin/users/suspended" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 7. Delete User
```bash
curl -X DELETE "http://localhost:3000/api/admin/users/USER_ID" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Status Mappings

### Order Status (UI to Database)
- **All** - No filter
- **Pending** - `status: "pending"`
- **Shipped** - `status: "shipped"`
- **Completed** - `status: "delivered"`

### Product Status
- **Active** - `isAvailable: true`
- **Inactive** - `isAvailable: false`

---

## Files Created/Modified

### New Files:
- `backend/controllers/adminUserController.js` - Admin user management logic
- `backend/routes/adminUserRoutes.js` - Admin user routes

### Modified Files:
- `backend/models/User.js` - Added suspension fields
- `backend/controllers/productController.js` - Added `getAdminProducts` function
- `backend/controllers/orderController.js` - Updated `getAllOrders` and added `getAdminOrderById`
- `backend/routes/productRoutes.js` - Added admin product listing route
- `backend/routes/orderRoutes.js` - Added admin order details route
- `backend/server.js` - Registered admin user routes

---

## Security Notes

1. **Admin Protection:**
   - All admin endpoints require authentication and admin role
   - Main admin account (gianosamsung@gmail.com) cannot be deleted
   - Admins cannot suspend/delete themselves

2. **User Suspension:**
   - Suspended users should be prevented from logging in (frontend implementation)
   - Suspension reason is stored for audit purposes
   - Suspension can be reversed by unsuspending

3. **Order Status Updates:**
   - Only admins can update order statuses
   - Status changes should trigger notifications (can be added)

4. **User Deletion:**
   - User deletion is permanent
   - Related orders/addresses can be kept for records (currently not deleted)
   - Consider soft delete if you need to preserve data

---

## Next Steps

1. Add email notifications for:
   - Order status changes
   - User suspension/unsuspension
   - User account deletion

2. Add audit logging for admin actions

3. Add bulk operations:
   - Bulk suspend users
   - Bulk update product status
   - Bulk update order status

4. Add export functionality:
   - Export products list
   - Export orders list
   - Export users list

5. Add advanced filtering:
   - Date range filters for orders
   - More product filters
   - User activity filters


