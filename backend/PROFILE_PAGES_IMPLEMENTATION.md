# Profile Pages Backend Implementation

This document outlines all the backend endpoints implemented for the profile pages shown in the mobile app design.

## Overview

The following features have been implemented to support the profile section pages:

1. **My Orders** - Order management with status filtering
2. **My Favorite Stores** - Favorite products display
3. **Coupons** - Available discount codes
4. **Shipping Address** - Address management (already existed, documented here)
5. **Disputes** - Order dispute and refund system
6. **Track Order** - Order tracking with step-by-step progress
7. **Feedback and Review** - Product reviews and ratings
8. **Help Center** - FAQ and support information
9. **Privacy Policy** - Privacy policy content

---

## New Models

### 1. Dispute Model (`backend/models/Dispute.js`)
- Handles order disputes and refund requests
- Fields: order, user, goodsUniqueId, reasons, detailedExplanation, status, adminResponse, refundAmount

### 2. Review Model (`backend/models/Review.js`)
- Handles product reviews and feedback
- Fields: product, user, order, rating, title, comment, images, isVerifiedPurchase, helpfulCount

### 3. Updated Order Model
- Added `trackingSteps` object with packaging, checking, shipping, delivery, readyForPickup
- Added `dispute` reference field

---

## New Endpoints

### Orders

#### 1. Get Orders by Status (UI Status Mapping)
**Endpoint:** `GET /api/orders/status/:status`  
**Auth:** Required  
**Status Values:**
- `unpaid` - Orders with payment status "pending"
- `to_be_shipped` - Orders with status "confirmed" or "processing" and payment "paid"
- `shipped` - Orders with status "shipped"
- `to_be_reviewed` - Orders with status "delivered"
- `disputes` - Orders with an active dispute

**Response:**
```json
{
  "success": true,
  "status": "unpaid",
  "orders": [...],
  "totalPages": 1,
  "currentPage": 1,
  "total": 5
}
```

#### 2. Track Order
**Endpoint:** `GET /api/orders/:id/track`  
**Auth:** Required  
**Description:** Get detailed order tracking with step-by-step progress

**Response:**
```json
{
  "success": true,
  "order": {
    "orderNumber": "ORD-XXX",
    "status": "shipped",
    "trackingSteps": {
      "packaging": { "completed": true, "completedAt": "..." },
      "checking": { "completed": true, "completedAt": "..." },
      "shipping": { "completed": true, "completedAt": "..." },
      "delivery": { "completed": false, "completedAt": null },
      "readyForPickup": { "completed": false, "completedAt": null }
    }
  },
  "orderItems": [...]
}
```

#### 3. Accept Order
**Endpoint:** `PUT /api/orders/:id/accept`  
**Auth:** Required  
**Description:** Mark order as received (completes readyForPickup step)

---

### Disputes

#### 1. Create Dispute
**Endpoint:** `POST /api/disputes`  
**Auth:** Required  
**Body:**
```json
{
  "orderId": "order_id (optional)",
  "goodsUniqueId": "ORD-XXX or product_id",
  "reasons": ["didnt_receive", "took_longer_than_expected", "not_what_ordered", "damage_bad_goods", "apply_for_refund", "others"],
  "detailedExplanation": "Detailed explanation of the issue"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dispute created successfully",
  "dispute": {...}
}
```

#### 2. Get User Disputes
**Endpoint:** `GET /api/disputes`  
**Auth:** Required  
**Query Params:** `status`, `page`, `limit`

#### 3. Get Dispute by ID
**Endpoint:** `GET /api/disputes/:id`  
**Auth:** Required

#### 4. Get All Disputes (Admin)
**Endpoint:** `GET /api/disputes/admin/all`  
**Auth:** Required (Admin)

#### 5. Update Dispute Status (Admin)
**Endpoint:** `PUT /api/disputes/:id/status`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "status": "pending|under_review|resolved|rejected|refunded",
  "adminResponse": "Admin's response",
  "refundAmount": 5000
}
```

---

### Reviews

#### 1. Create Review
**Endpoint:** `POST /api/reviews`  
**Auth:** Required  
**Body:**
```json
{
  "productId": "product_id",
  "orderId": "order_id (optional, for verified purchase)",
  "rating": 5,
  "title": "Review title (optional)",
  "comment": "Review comment",
  "images": ["url1", "url2"]
}
```

#### 2. Get Product Reviews
**Endpoint:** `GET /api/reviews/product/:productId`  
**Auth:** Public  
**Query Params:** `page`, `limit`, `rating`

**Response:**
```json
{
  "success": true,
  "reviews": [...],
  "ratingDistribution": {
    "5": 10,
    "4": 5,
    "3": 2,
    "2": 1,
    "1": 0
  },
  "totalPages": 1,
  "currentPage": 1,
  "total": 18
}
```

#### 3. Get User Reviews
**Endpoint:** `GET /api/reviews/my-reviews`  
**Auth:** Required

#### 4. Update Review
**Endpoint:** `PUT /api/reviews/:id`  
**Auth:** Required

#### 5. Delete Review
**Endpoint:** `DELETE /api/reviews/:id`  
**Auth:** Required

#### 6. Get All Reviews (Admin)
**Endpoint:** `GET /api/reviews/admin/all`  
**Auth:** Required (Admin)

#### 7. Update Review Status (Admin)
**Endpoint:** `PUT /api/reviews/:id/status`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "isPublished": true,
  "adminResponse": "Admin response"
}
```

---

### Coupons (Discount Codes)

#### 1. Get Available Coupons
**Endpoint:** `GET /api/discounts/available`  
**Auth:** Public  
**Description:** Get all active and valid discount codes for users

**Response:**
```json
{
  "success": true,
  "coupons": [
    {
      "_id": "...",
      "code": "GAGNON-ROSEPINK",
      "name": "Gagnon-rosepink",
      "description": "A great fashion wear suitable for business and outings",
      "discountText": "40% OFF",
      "discountType": "percentage",
      "discountValue": 40,
      "minOrderValue": 0,
      "validUntil": "2025-12-31"
    }
  ],
  "total": 5
}
```

---

### Favorites (Favorite Stores)

#### 1. Get Favorites (Updated)
**Endpoint:** `GET /api/user/favorites`  
**Auth:** Required  
**Query Params:** `page`, `limit`

**Response:**
```json
{
  "success": true,
  "favorites": [
    {
      "_id": "...",
      "title": "Product Name",
      "brand": "Brand Name",
      "images": ["..."],
      "price": 98999.99,
      "originalPrice": 123999.99,
      "discountPercentage": "20% OFF",
      "badges": ["HOT", "SALE"],
      "stock": 10,
      "rating": 4.7,
      "reviewCount": 2334,
      "isInFavorites": true
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 10
}
```

---

### Content (Help Center & Privacy Policy)

#### 1. Get Help Center
**Endpoint:** `GET /api/content/help-center`  
**Auth:** Public

**Response:**
```json
{
  "success": true,
  "helpCenter": {
    "title": "Help Center",
    "sections": [
      {
        "id": "shipping",
        "title": "Shipping & Delivery",
        "questions": [...]
      },
      ...
    ],
    "contact": {
      "email": "support@mcgeorge.com",
      "phone": "+234 800 123 4567",
      "hours": "Monday - Friday: 9:00 AM - 6:00 PM"
    }
  }
}
```

#### 2. Get Privacy Policy
**Endpoint:** `GET /api/content/privacy-policy`  
**Auth:** Public

**Response:**
```json
{
  "success": true,
  "privacyPolicy": {
    "title": "Privacy Policy",
    "lastUpdated": "January 2025",
    "sections": [...]
  }
}
```

---

### Shipping Address (Already Existed)

#### 1. Get Addresses
**Endpoint:** `GET /api/addresses`  
**Auth:** Required

#### 2. Get Address by ID
**Endpoint:** `GET /api/addresses/:id`  
**Auth:** Required

#### 3. Create Address
**Endpoint:** `POST /api/addresses`  
**Auth:** Required  
**Body:**
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john@example.com",
  "phone": "+2341234567890",
  "country": "Nigeria",
  "region": "Lagos",
  "city": "Lagos",
  "address": "123 Main Street",
  "postalCode": "100001",
  "isDefault": true
}
```

#### 4. Update Address
**Endpoint:** `PUT /api/addresses/:id`  
**Auth:** Required

#### 5. Set Default Address
**Endpoint:** `PUT /api/addresses/:id/default`  
**Auth:** Required

#### 6. Delete Address
**Endpoint:** `DELETE /api/addresses/:id`  
**Auth:** Required

---

## Status Mapping

The UI uses different status labels than the database. Here's the mapping:

| UI Status | Database Status | Payment Status |
|-----------|----------------|----------------|
| Unpaid | Any | pending |
| To be shipped | confirmed, processing | paid |
| Shipped | shipped | paid |
| To be reviewed | delivered | paid |
| Disputes | Any | Any (has dispute) |

---

## Order Tracking Steps

The tracking system includes 5 steps:

1. **Packaging and branding from store** - Completed when order is confirmed/processing
2. **Checking goods** - Completed when order is processing/shipped
3. **Shipping** - Completed when order is shipped/delivered
4. **Delivery** - Completed when order is delivered
5. **Ready for pick up** - Completed when user accepts order

---

## Testing

To test the new endpoints:

1. **Start the server:**
   ```bash
   node backend/server.js
   ```

2. **Get your auth token** (login or register)

3. **Test endpoints** using Postman, Thunder Client, or curl:

   ```bash
   # Get orders by status
   curl -X GET http://localhost:3000/api/orders/status/unpaid \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Track an order
   curl -X GET http://localhost:3000/api/orders/ORDER_ID/track \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Create a dispute
   curl -X POST http://localhost:3000/api/disputes \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "goodsUniqueId": "ORD-XXX",
       "reasons": ["didnt_receive"],
       "detailedExplanation": "I did not receive my order"
     }'

   # Get available coupons
   curl -X GET http://localhost:3000/api/discounts/available

   # Get help center
   curl -X GET http://localhost:3000/api/content/help-center
   ```

---

## Files Created/Modified

### New Files:
- `backend/models/Dispute.js`
- `backend/models/Review.js`
- `backend/controllers/disputeController.js`
- `backend/controllers/reviewController.js`
- `backend/controllers/contentController.js`
- `backend/routes/disputeRoutes.js`
- `backend/routes/reviewRoutes.js`
- `backend/routes/contentRoutes.js`

### Modified Files:
- `backend/models/Order.js` - Added trackingSteps and dispute reference
- `backend/controllers/orderController.js` - Added status mapping and tracking endpoints
- `backend/controllers/discountController.js` - Added getAvailableCoupons endpoint
- `backend/controllers/userController.js` - Enhanced getFavorites to return full product details
- `backend/routes/orderRoutes.js` - Added new order endpoints
- `backend/routes/discountRoutes.js` - Added available coupons route
- `backend/server.js` - Registered new routes

---

## Next Steps

1. Test all endpoints with your frontend
2. Customize Help Center and Privacy Policy content as needed
3. Add image upload functionality for reviews if needed
4. Implement email notifications for dispute status changes
5. Add analytics tracking for reviews and disputes

---

## Notes

- All user-facing endpoints require authentication (JWT token)
- Admin endpoints require both authentication and admin role
- Order tracking steps are automatically calculated based on order status
- Reviews automatically update product ratings
- Disputes are linked to orders and can trigger refunds
- Coupons are filtered to show only active and valid codes

