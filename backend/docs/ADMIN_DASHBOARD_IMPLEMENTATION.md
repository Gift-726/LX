# Admin Dashboard Backend Implementation

This document outlines the backend implementation for the admin dashboard and product management features.

## Overview

The admin dashboard provides:
1. **Dashboard Overview** - Revenue, active products, total orders, total users
2. **Sales Trend** - Bar chart data for sales over time
3. **Popular Items** - Best selling products, categories, and most sold items
4. **Add Item** - Create new products with sizes, colors, and availability toggle

---

## New Features

### 1. Product Availability Toggle
- Added `isAvailable` field to Product model
- Controls whether product is visible/purchasable
- Can be toggled when creating or updating products

### 2. Product Variants (Sizes & Colors)
- Products can have multiple size/color combinations
- Creates ProductVariant entries automatically
- Each variant has its own stock and SKU

---

## New Endpoints

### Dashboard

#### 1. Get Complete Dashboard Data
**Endpoint:** `GET /api/admin/dashboard`  
**Auth:** Required (Admin)  
**Query Params:**
- `period` - "today", "week", "month", "year" (default: "today")
- `year` - Year for specific period (optional)
- `month` - Month number (1-12) for specific month (optional)

**Response:**
```json
{
  "success": true,
  "period": "today",
  "overview": {
    "revenue": 2005789.98,
    "activeProducts": 567,
    "totalOrders": 78,
    "totalUsers": 78
  },
  "salesTrend": [
    {
      "date": "2023-08-01",
      "sales": 150000
    },
    {
      "date": "2023-08-02",
      "sales": 200000
    }
  ],
  "popularItems": {
    "bestSellingItem": {
      "name": "Rose Pink Gown",
      "quantity": 54
    },
    "bestSellingCategory": {
      "name": "Tops",
      "quantity": 54
    },
    "mostSold": {
      "name": "LV socks",
      "quantity": 54
    }
  }
}
```

#### 2. Get Dashboard Overview Only
**Endpoint:** `GET /api/admin/dashboard/overview`  
**Auth:** Required (Admin)  
**Query Params:** `period` (today, week, month, year)

**Response:**
```json
{
  "success": true,
  "period": "today",
  "overview": {
    "revenue": 2005789.98,
    "activeProducts": 567,
    "totalOrders": 78,
    "totalUsers": 78
  }
}
```

#### 3. Get Sales Trend
**Endpoint:** `GET /api/admin/dashboard/sales-trend`  
**Auth:** Required (Admin)  
**Query Params:**
- `period` - "month" or "year"
- `year` - Year (required for year period)
- `month` - Month number 1-12 (required for month period)

**Response:**
```json
{
  "success": true,
  "period": "month",
  "year": 2023,
  "month": 8,
  "trend": [
    {
      "date": "2023-08-01",
      "sales": 150000
    },
    {
      "date": "2023-08-02",
      "sales": 200000
    }
  ]
}
```

#### 4. Get Popular Items
**Endpoint:** `GET /api/admin/dashboard/popular-items`  
**Auth:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "popularItems": {
    "bestSellingItem": {
      "name": "Rose Pink Gown",
      "quantity": 54,
      "revenue": 2916000
    },
    "bestSellingCategory": {
      "name": "Tops",
      "quantity": 54
    },
    "mostSold": {
      "name": "LV socks",
      "quantity": 54
    }
  }
}
```

---

### Product Creation (Updated)

#### Create Product with Variants
**Endpoint:** `POST /api/products`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "title": "Rose Pink Gown",
  "description": "A beautiful rose pink gown for special occasions",
  "price": 98999.99,
  "currency": "NGN",
  "discountPercentage": 20,
  "category": "category_id_here",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "tags": ["Women", "Formal", "Dress"],
  "stock": 100,
  "isAvailable": true,
  "sizes": ["M", "L", "XL", "XXL"],
  "colors": ["White", "Black", "Gray", "Red"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "_id": "...",
    "title": "Rose Pink Gown",
    "price": 98999.99,
    "isAvailable": true,
    "hasVariants": true,
    ...
  },
  "variants": [
    {
      "_id": "...",
      "product": "...",
      "size": "M",
      "color": "White",
      "stock": 0,
      "sku": "ABC12345-M-WHI"
    },
    {
      "_id": "...",
      "product": "...",
      "size": "M",
      "color": "Black",
      "stock": 0,
      "sku": "ABC12345-M-BLA"
    }
    // ... more variants for each size/color combination
  ]
}
```

**Notes:**
- If `sizes` and `colors` are both provided, variants are automatically created
- Each size/color combination gets its own ProductVariant entry
- SKU is auto-generated: `{PRODUCT_ID}-{SIZE}-{COLOR_CODE}`
- If no sizes/colors provided, product is created without variants
- `isAvailable` defaults to `true` if not provided

---

## Updated Models

### Product Model
Added field:
- `isAvailable` (Boolean, default: true) - Controls product availability

---

## Usage Examples

### 1. Get Dashboard for Today
```bash
curl -X GET "http://localhost:3000/api/admin/dashboard?period=today" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 2. Get Sales Trend for August 2023
```bash
curl -X GET "http://localhost:3000/api/admin/dashboard/sales-trend?period=month&year=2023&month=8" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Create Product with Variants
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Rose Pink Gown",
    "description": "A beautiful gown",
    "price": 98999.99,
    "category": "CATEGORY_ID",
    "isAvailable": true,
    "sizes": ["M", "L", "XL", "XXL"],
    "colors": ["White", "Black", "Gray", "Red"],
    "images": ["https://example.com/image.jpg"]
  }'
```

### 4. Create Simple Product (No Variants)
```bash
curl -X POST "http://localhost:3000/api/products" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Simple Product",
    "description": "No variants",
    "price": 5000,
    "category": "CATEGORY_ID",
    "isAvailable": true,
    "stock": 50
  }'
```

---

## Valid Sizes

The following sizes are valid for product variants:
- "XS"
- "S"
- "M"
- "L"
- "XL"
- "XXL"
- "XXXL"
- "One Size"

---

## Files Created/Modified

### New Files:
- `backend/controllers/dashboardController.js` - Dashboard analytics logic
- `backend/routes/dashboardRoutes.js` - Dashboard routes

### Modified Files:
- `backend/models/Product.js` - Added `isAvailable` field
- `backend/controllers/productController.js` - Updated `createProduct` to handle variants, sizes, colors, and availability
- `backend/server.js` - Registered dashboard routes

---

## Notes

1. **Dashboard Periods:**
   - `today` - Current day
   - `week` - Last 7 days
   - `month` - Current month
   - `year` - Current year
   - Can specify specific year/month with query params

2. **Product Variants:**
   - Variants are only created if both `sizes` and `colors` arrays are provided
   - Each combination gets its own variant with unique SKU
   - Variant stock defaults to 0 (can be updated later)
   - Product's total stock is sum of all variant stocks

3. **Product Availability:**
   - `isAvailable: true` - Product is visible and purchasable
   - `isAvailable: false` - Product is hidden/not available
   - Can be toggled when creating or updating products

4. **Revenue Calculation:**
   - Only includes orders with `paymentStatus: "paid"`
   - Sums the `total` field from orders
   - Filtered by the selected time period

5. **Popular Items:**
   - Best selling item: Based on total quantity sold from OrderItems
   - Best selling category: Based on total quantity by category
   - Most sold: Based on product's `salesCount` field

---

## Next Steps

1. Test all dashboard endpoints
2. Implement image upload functionality for products
3. Add more analytics (e.g., customer demographics, product performance)
4. Add export functionality for reports
5. Add filters for dashboard data (e.g., by category, by product)

