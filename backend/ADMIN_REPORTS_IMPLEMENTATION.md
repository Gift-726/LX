# Admin Reports and Analytics Implementation

This document outlines the backend implementation for the Reports and Analytics page, Add User functionality, and enhanced Category management.

## Overview

The implementation includes:
1. **Reports and Analytics** - Comprehensive reporting with charts and metrics
2. **Add User** - Admin can create new users
3. **Enhanced Categories** - Search functionality and description field

---

## New Features

### 1. Reports and Analytics
- Sales Report count
- Product Performance percentage
- Customer Insight count
- Revenue Overview
- Revenue Chart (with D, W, M, Y filters)
- Sales Trend Chart (with D, W, M, Y filters)
- User Engagement Chart (with D, W, M, Y filters)
- Export endpoints (PDF/Excel placeholders)

### 2. Add User (Admin)
- Create new users with name, email, password, and role
- Active status toggle (maps to isSuspended)
- Auto-verification for admin-created users

### 3. Enhanced Categories
- Added description field
- Search functionality by name or description

---

## New Endpoints

### Reports and Analytics

#### 1. Get Reports Overview
**Endpoint:** `GET /api/admin/reports/overview`  
**Auth:** Required (Admin)  
**Query Params:**
- `period` - "today", "week", "month", "year" (default: "today")

**Response:**
```json
{
  "success": true,
  "period": "today",
  "overview": {
    "salesReport": 28,
    "productPerformance": "88%",
    "customerInsight": 28,
    "revenue": 2005789.98
  }
}
```

#### 2. Get Revenue Chart
**Endpoint:** `GET /api/admin/reports/revenue-chart`  
**Auth:** Required (Admin)  
**Query Params:**
- `period` - "D" (Day), "W" (Week), "M" (Month), "Y" (Year) (default: "M")
- `year` - Year for specific period (optional)
- `month` - Month number 1-12 for specific month (optional)

**Response:**
```json
{
  "success": true,
  "period": "M",
  "year": 2023,
  "month": 8,
  "chartData": [
    {
      "date": "2023-08-01",
      "revenue": 150000
    },
    {
      "date": "2023-08-02",
      "revenue": 200000
    }
  ]
}
```

#### 3. Get Sales Trend Chart
**Endpoint:** `GET /api/admin/reports/sales-trend-chart`  
**Auth:** Required (Admin)  
**Query Params:** Same as revenue chart

**Response:**
```json
{
  "success": true,
  "period": "M",
  "year": 2023,
  "month": 8,
  "chartData": [
    {
      "date": "2023-08-01",
      "sales": 50
    },
    {
      "date": "2023-08-02",
      "sales": 75
    }
  ]
}
```

#### 4. Get User Engagement Chart
**Endpoint:** `GET /api/admin/reports/user-engagement-chart`  
**Auth:** Required (Admin)  
**Query Params:** Same as revenue chart

**Response:**
```json
{
  "success": true,
  "period": "M",
  "year": 2023,
  "month": 8,
  "chartData": [
    {
      "date": "2023-08-01",
      "engagement": 120
    },
    {
      "date": "2023-08-02",
      "engagement": 150
    }
  ]
}
```

#### 5. Get Complete Reports
**Endpoint:** `GET /api/admin/reports`  
**Auth:** Required (Admin)  
**Query Params:**
- `period` - Overview period (today, week, month, year)
- `chartPeriod` - Chart period (D, W, M, Y)

**Response:**
```json
{
  "success": true,
  "period": "today",
  "overview": {
    "salesReport": 28,
    "productPerformance": "88%",
    "customerInsight": 28,
    "revenue": 2005789.98
  },
  "charts": {
    "revenue": "Call /api/admin/reports/revenue-chart",
    "salesTrend": "Call /api/admin/reports/sales-trend-chart",
    "userEngagement": "Call /api/admin/reports/user-engagement-chart"
  }
}
```

#### 6. Export as PDF
**Endpoint:** `GET /api/admin/reports/export/pdf`  
**Auth:** Required (Admin)  
**Note:** Placeholder endpoint. Returns message indicating PDF generation requires additional library.

#### 7. Export as Excel
**Endpoint:** `GET /api/admin/reports/export/excel`  
**Auth:** Required (Admin)  
**Note:** Placeholder endpoint. Returns message indicating Excel generation requires additional library.

---

### Add User (Admin)

#### Create User
**Endpoint:** `POST /api/admin/users`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "name": "Creative Omotayo",
  "email": "creative@example.com",
  "password": "password123",
  "role": "user",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "...",
    "firstname": "Creative",
    "lastname": "Omotayo",
    "email": "creative@example.com",
    "role": "user",
    "isVerified": true,
    "isSuspended": false
  }
}
```

**Notes:**
- `name` is split into `firstname` and `lastname`
- `isActive: false` maps to `isSuspended: true`
- Admin-created users are auto-verified
- Password must be at least 6 characters

---

### Enhanced Categories

#### Get All Categories (with search)
**Endpoint:** `GET /api/categories`  
**Query Params:**
- `search` - Search by name or description

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "_id": "...",
      "name": "Shoes",
      "description": "Sneakers, Corporate shoes, Palm, Sandals",
      "image": "...",
      "parentCategory": null
    }
  ]
}
```

#### Create Category (with description)
**Endpoint:** `POST /api/categories`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "name": "Shoes",
  "description": "Sneakers, Corporate shoes, Palm, Sandals",
  "image": "https://example.com/image.jpg",
  "parentCategory": null
}
```

#### Update Category (with description)
**Endpoint:** `PUT /api/categories/:id`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "name": "Shoes",
  "description": "Updated description",
  "image": "https://example.com/new-image.jpg"
}
```

---

## Updated Models

### Category Model
Added field:
- `description` (String) - Category description

---

## Usage Examples

### 1. Get Reports Overview
```bash
curl -X GET "http://localhost:3000/api/admin/reports/overview?period=today" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Get Revenue Chart for August 2023
```bash
curl -X GET "http://localhost:3000/api/admin/reports/revenue-chart?period=M&year=2023&month=8" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Get Sales Trend Chart
```bash
curl -X GET "http://localhost:3000/api/admin/reports/sales-trend-chart?period=M" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Create User
```bash
curl -X POST "http://localhost:3000/api/admin/users" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Creative Omotayo",
    "email": "creative@example.com",
    "password": "password123",
    "role": "user",
    "isActive": true
  }'
```

### 5. Search Categories
```bash
curl -X GET "http://localhost:3000/api/categories?search=shoes" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 6. Create Category with Description
```bash
curl -X POST "http://localhost:3000/api/categories" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shoes",
    "description": "Sneakers, Corporate shoes, Palm, Sandals"
  }'
```

---

## Chart Period Filters

### Period Options:
- **D** (Day) - Last 30 days, grouped by day
- **W** (Week) - Last 12 weeks, grouped by week
- **M** (Month) - Current month or specific month, grouped by day
- **Y** (Year) - Current year or specific year, grouped by month

### Date Format:
- Day: `YYYY-MM-DD` (e.g., "2023-08-01")
- Week: `YYYY-WXX` (e.g., "2023-W32")
- Month: `YYYY-MM` (e.g., "2023-08")

---

## Metrics Calculation

### Sales Report
- Count of all orders in the selected period

### Product Performance
- Percentage of active products that have sales
- Formula: `(products with sales / total active products) * 100`

### Customer Insight
- Count of unique customers who placed orders in the period

### Revenue Overview
- Sum of all paid order totals in the period

---

## Export Functionality

The export endpoints are currently placeholders. To implement actual file generation:

### PDF Export
Consider using:
- **pdfkit** - Node.js PDF generation
- **puppeteer** - Generate PDF from HTML
- **jspdf** - Client-side PDF generation

### Excel Export
Consider using:
- **exceljs** - Server-side Excel generation
- **xlsx** (SheetJS) - Server or client-side
- **node-xlsx** - Simple Excel generation

**Example Implementation:**
```javascript
// For Excel export
const ExcelJS = require('exceljs');
const workbook = new ExcelJS.Workbook();
const worksheet = workbook.addWorksheet('Reports');
// Add data and send file
```

---

## Files Created/Modified

### New Files:
- `backend/controllers/reportsController.js` - Reports and analytics logic
- `backend/routes/reportsRoutes.js` - Reports routes

### Modified Files:
- `backend/models/Category.js` - Added description field
- `backend/controllers/categoryController.js` - Added search and description support
- `backend/controllers/adminUserController.js` - Added createUser function
- `backend/routes/adminUserRoutes.js` - Added create user route
- `backend/server.js` - Registered reports routes

---

## Notes

1. **Chart Data:**
   - All charts support D, W, M, Y period filters
   - Data is grouped appropriately based on period
   - Empty periods are not included (only dates with data)

2. **User Creation:**
   - Name is automatically split into firstname and lastname
   - Password is hashed using bcrypt
   - Admin-created users bypass email verification
   - `isActive: false` suspends the user

3. **Category Search:**
   - Searches both name and description fields
   - Case-insensitive search
   - Returns all matching categories

4. **Export Endpoints:**
   - Currently return informational messages
   - Can be implemented with appropriate libraries
   - Frontend can also generate files client-side using the chart data

---

## Next Steps

1. Implement actual PDF/Excel generation using libraries
2. Add more analytics metrics (e.g., average order value, conversion rate)
3. Add date range picker support for custom periods
4. Add comparison features (e.g., compare this month vs last month)
5. Add export filters (export specific date ranges, categories, etc.)


