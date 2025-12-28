# Admin System Features Implementation

This document outlines the backend implementation for admin system features including Reviews and Feedback, Notifications, System Settings, Page Restrictions, Terms & Conditions, and Banner Management.

## Overview

The implementation includes:
1. **Reviews and Feedback** - Admin review management with statistics
2. **Notification Management** - Create, edit, delete, and schedule notifications
3. **System Settings** - Admin profile management
4. **Page Restrictions** - Access control for admin pages
5. **Terms & Conditions** - Content management
6. **Banner Management** - Promotional banner CRUD and preview

---

## New Models

### 1. Banner Model
- Fields: title, heading, bodyText, buttonText, buttonUrl, image, backgroundColor, textColor, status, displayOrder, startDate, endDate

### 2. TermsAndCondition Model
- Fields: title, content, version, isActive, effectiveDate, createdBy, updatedBy

### 3. PageRestriction Model
- Fields: pageName, allowedRoles, isRestricted, restrictionType, updatedBy

### 4. Updated Notification Model
- Added: recipientType, header, body, scheduledDate, scheduledTime, deliveryMethod, isScheduled, isSent, sentAt, createdBy

---

## New Endpoints

### Reviews and Feedback

#### 1. Get Reviews Overview
**Endpoint:** `GET /api/admin/reviews/overview`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "overview": {
    "averageRating": 4.7,
    "totalReviews": 578,
    "ratingDistribution": {
      "5": 493,
      "4": 74,
      "3": 14,
      "2": 0,
      "1": 0
    }
  }
}
```

#### 2. Get Reviews and Feedback
**Endpoint:** `GET /api/admin/reviews`  
**Auth:** Required (Admin)  
**Query Params:** `productId`, `rating`, `isPublished`, `page`, `limit`

**Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "_id": "...",
      "rating": 5,
      "comment": "I love the shoe it looks great, and yeah the delivery was fast",
      "user": {
        "firstname": "Alex",
        "lastname": "K.",
        "avatar": "..."
      },
      "createdAt": "2024-01-20T00:00:00.000Z",
      "adminResponse": null
    }
  ],
  "statistics": {
    "averageRating": 4.7,
    "totalReviews": 578,
    "ratingDistribution": {...}
  },
  "totalPages": 1,
  "currentPage": 1,
  "total": 578
}
```

#### 3. Reply to Review
**Endpoint:** `PUT /api/admin/reviews/:id/reply`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "adminResponse": "Thank you for your feedback!"
}
```

---

### Notification Management

#### 1. Get All Notifications
**Endpoint:** `GET /api/admin/notifications`  
**Auth:** Required (Admin)  
**Query Params:** `recipientType`, `isSent`, `page`, `limit`

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "...",
      "title": "New order alert",
      "message": "You've a new pending order check it out>>",
      "recipientType": "all",
      "scheduledDate": "2025-05-29T10:00:00.000Z",
      "scheduledTime": "10:00 am",
      "deliveryMethod": ["push", "email", "sms"],
      "isScheduled": true,
      "isSent": false,
      "createdBy": {...}
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 10
}
```

#### 2. Create Notification
**Endpoint:** `POST /api/admin/notifications`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "recipientType": "all",
  "title": "New order alert",
  "message": "You've a new pending order check it out>>",
  "header": "New Order",
  "body": "You've a new pending order check it out>>",
  "type": "alert",
  "scheduledDate": "2025-05-29",
  "scheduledTime": "10:00 am",
  "deliveryMethod": ["push", "email", "sms"],
  "isScheduled": true
}
```

**Recipient Types:**
- `"all"` - All users
- `"users"` - Regular users only
- `"admins"` - Admins only
- `"user"` - Specific user (requires `userId` in body)

#### 3. Update Notification
**Endpoint:** `PUT /api/admin/notifications/:id`  
**Auth:** Required (Admin)

#### 4. Send Notification
**Endpoint:** `POST /api/admin/notifications/:id/send`  
**Auth:** Required (Admin)  
**Description:** Sends scheduled or immediate notification to recipients

#### 5. Delete Notification
**Endpoint:** `DELETE /api/admin/notifications/:id`  
**Auth:** Required (Admin)

---

### System Settings

#### 1. Get System Settings
**Endpoint:** `GET /api/admin/settings`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "settings": {
    "profile": {
      "name": "CEO LOOXAKA FASHION",
      "email": "admin@example.com",
      "role": "admin",
      "avatar": "...",
      "title": "Super admin"
    },
    "permissions": {
      "isAdmin": true,
      "isSuperAdmin": true
    }
  }
}
```

#### 2. Update System Settings
**Endpoint:** `PUT /api/admin/settings`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "title": "Super admin",
  "firstname": "CEO",
  "lastname": "LOOXAKA FASHION",
  "email": "admin@example.com",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

### Page Restrictions

#### 1. Get All Page Restrictions
**Endpoint:** `GET /api/admin/page-restrictions`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "restrictions": [
    {
      "pageName": "System Settings",
      "isRestricted": false,
      "restrictionType": "all",
      "allowedRoles": ["all"]
    },
    {
      "pageName": "Banner",
      "isRestricted": true,
      "restrictionType": "admins",
      "allowedRoles": ["admin"]
    }
  ]
}
```

#### 2. Get Page Restriction
**Endpoint:** `GET /api/admin/page-restrictions/:pageName`  
**Auth:** Required (Admin)

#### 3. Update Page Restriction
**Endpoint:** `PUT /api/admin/page-restrictions/:pageName`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "isRestricted": true,
  "restrictionType": "admins",
  "allowedRoles": ["admin"]
}
```

**Restriction Types:**
- `"all"` - Everyone
- `"users"` - Users only
- `"admins"` - Admins only
- `"search_users"` - Search users
- `"search_admins"` - Search admins

#### 4. Check Page Access
**Endpoint:** `GET /api/admin/page-restrictions/check/:pageName`  
**Auth:** Required

**Response:**
```json
{
  "success": true,
  "hasAccess": true,
  "message": "Page is not restricted"
}
```

---

### Terms & Conditions

#### 1. Get All Terms
**Endpoint:** `GET /api/terms`  
**Auth:** Required (Admin)  
**Query Params:** `isActive`, `page`, `limit`

#### 2. Get Active Terms (Public)
**Endpoint:** `GET /api/terms/active`  
**Auth:** Public

**Response:**
```json
{
  "success": true,
  "terms": [
    {
      "_id": "...",
      "title": "Service Agreement",
      "content": "Lorem ipsum...",
      "version": 1,
      "isActive": true,
      "effectiveDate": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 3. Create Terms
**Endpoint:** `POST /api/terms`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "title": "Service Agreement",
  "content": "Lorem ipsum dolor sit amet...",
  "effectiveDate": "2025-01-01"
}
```

**Note:** Creating new terms automatically deactivates previous versions

#### 4. Update Terms
**Endpoint:** `PUT /api/terms/:id`  
**Auth:** Required (Admin)

#### 5. Delete Terms
**Endpoint:** `DELETE /api/terms/:id`  
**Auth:** Required (Admin)

---

### Banner Management

#### 1. Get All Banners
**Endpoint:** `GET /api/banners`  
**Auth:** Required (Admin)  
**Query Params:** `status`, `page`, `limit`

**Response:**
```json
{
  "success": true,
  "banners": [
    {
      "_id": "...",
      "title": "Banner 1",
      "heading": "Gagnon-rosepink",
      "bodyText": "A great fashion wear suitable for business and outings",
      "buttonText": "Check it Out",
      "buttonUrl": "https://www.google.com",
      "image": "https://example.com/image.jpg",
      "status": "active",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "totalPages": 1,
  "currentPage": 1,
  "total": 2
}
```

#### 2. Get Active Banners (Public)
**Endpoint:** `GET /api/banners/active`  
**Auth:** Public

#### 3. Create Banner
**Endpoint:** `POST /api/banners`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "title": "Banner 1",
  "heading": "Gagnon-rosepink",
  "bodyText": "A great fashion wear suitable for business and outings",
  "buttonText": "Best Offer",
  "buttonUrl": "https://www.google.com",
  "image": "https://example.com/image.jpg",
  "backgroundColor": "#8B5CF6",
  "textColor": "#FFFFFF",
  "status": "active",
  "displayOrder": 0,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31"
}
```

#### 4. Update Banner
**Endpoint:** `PUT /api/banners/:id`  
**Auth:** Required (Admin)

#### 5. Delete Banner
**Endpoint:** `DELETE /api/banners/:id`  
**Auth:** Required (Admin)

#### 6. Preview Banner
**Endpoint:** `GET /api/banners/:id/preview`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "preview": {
    "title": "Banner 1",
    "heading": "Gagnon-rosepink",
    "bodyText": "A great fashion wear suitable for business and outings",
    "buttonText": "Best Offer",
    "buttonUrl": "https://www.google.com",
    "image": "https://example.com/image.jpg",
    "backgroundColor": "#8B5CF6",
    "textColor": "#FFFFFF",
    "status": "active"
  }
}
```

---

## Usage Examples

### 1. Get Reviews Overview
```bash
curl -X GET "http://localhost:3000/api/admin/reviews/overview" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Create Notification
```bash
curl -X POST "http://localhost:3000/api/admin/notifications" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientType": "all",
    "title": "New order alert",
    "message": "You have a new pending order",
    "scheduledDate": "2025-05-29",
    "scheduledTime": "10:00 am",
    "deliveryMethod": ["push", "email"],
    "isScheduled": true
  }'
```

### 3. Create Banner
```bash
curl -X POST "http://localhost:3000/api/banners" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Banner 1",
    "heading": "Gagnon-rosepink",
    "bodyText": "A great fashion wear",
    "buttonText": "Check it Out",
    "buttonUrl": "https://www.google.com",
    "status": "active"
  }'
```

### 4. Update Page Restriction
```bash
curl -X PUT "http://localhost:3000/api/admin/page-restrictions/System%20Settings" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isRestricted": true,
    "restrictionType": "admins",
    "allowedRoles": ["admin"]
  }'
```

### 5. Create Terms & Conditions
```bash
curl -X POST "http://localhost:3000/api/terms" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Service Agreement",
    "content": "Lorem ipsum dolor sit amet..."
  }'
```

---

## Files Created/Modified

### New Files:
- `backend/models/Banner.js`
- `backend/models/TermsAndCondition.js`
- `backend/models/PageRestriction.js`
- `backend/controllers/bannerController.js`
- `backend/controllers/termsController.js`
- `backend/controllers/pageRestrictionController.js`
- `backend/controllers/adminNotificationController.js`
- `backend/controllers/adminReviewController.js`
- `backend/controllers/systemSettingsController.js`
- `backend/routes/bannerRoutes.js`
- `backend/routes/termsRoutes.js`
- `backend/routes/pageRestrictionRoutes.js`
- `backend/routes/adminNotificationRoutes.js`
- `backend/routes/adminReviewRoutes.js`
- `backend/routes/systemSettingsRoutes.js`

### Modified Files:
- `backend/models/Notification.js` - Added admin notification fields
- `backend/server.js` - Registered all new routes

---

## Notes

1. **Notification Scheduling:**
   - Scheduled notifications are stored but not automatically sent
   - Use the send endpoint to manually trigger sending
   - For production, implement a cron job to check and send scheduled notifications

2. **Banner Display:**
   - Active banners are filtered by date range if startDate/endDate are set
   - Display order determines banner priority

3. **Terms & Conditions:**
   - Only one version can be active at a time
   - Creating new terms automatically deactivates old ones
   - Version numbers increment automatically

4. **Page Restrictions:**
   - Pages are created automatically if they don't exist
   - Restriction types determine who can access pages
   - Use check endpoint to verify access before rendering pages

5. **Reviews Statistics:**
   - Statistics are calculated from published reviews only
   - Rating distribution shows breakdown by star rating

---

## Next Steps

1. Implement notification scheduler (cron job) for scheduled notifications
2. Add email/SMS delivery integration for notifications
3. Add banner image upload functionality
4. Add terms version history tracking
5. Implement page restriction middleware for route protection
6. Add review moderation workflow


