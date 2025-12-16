# Figma Design - Backend Implementation Guide

## 📱 Design Analysis Summary

Based on the Figma design, I've analyzed all three screens and implemented the necessary backend features.

---

## ✅ What's Been Implemented

### 1. Featured Products ✅
**For:** "Best Offer" banner on Home Screen

**Endpoint:** `GET /api/products/featured`

**Features:**
- Get products marked as featured
- Only returns active featured products (not expired)
- Supports limit parameter
- Includes calculated badges

**Usage:**
```javascript
GET /api/products/featured?limit=1
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "title": "Gagnon-rosepink",
      "description": "A great fashion wear suitable for business and outings.",
      "price": 99999.99,
      "isFeatured": true,
      "calculatedBadges": ["HOT", "NEW"],
      "images": ["..."],
      "category": { "name": "Dresses" }
    }
  ]
}
```

---

### 2. Wishlist System ✅
**For:** Heart icons on products

**Endpoints:**
- `GET /api/user/wishlist` - Get user's wishlist
- `POST /api/user/wishlist` - Add product to wishlist
- `DELETE /api/user/wishlist/:id` - Remove from wishlist

**Features:**
- Prevents duplicate entries
- Returns products with full details
- Products include `isInWishlist` flag when user is authenticated

**Usage:**
```javascript
// Add to wishlist
POST /api/user/wishlist
Headers: { Authorization: Bearer <token> }
Body: { "productId": "675a1b2c3d4e5f6g7h8i9j0k" }

// Get wishlist
GET /api/user/wishlist
Headers: { Authorization: Bearer <token> }

// Remove from wishlist
DELETE /api/user/wishlist/:productId
Headers: { Authorization: Bearer <token> }
```

---

### 3. Product Badges ✅
**For:** "20% OFF", "48% OFF", "HOT" badges

**Features:**
- Automatic badge calculation based on:
  - Discount percentage (≥40% = "HOT", >0% = "SALE")
  - Product age (≤7 days = "NEW")
  - Stock level (≤5 items = "LIMITED")
- Manual badges can be set via `badges` field
- Included in all product responses as `calculatedBadges`

**Product Response:**
```json
{
  "title": "Italian Suite",
  "price": 52999.99,
  "discountPercentage": 48,
  "calculatedBadges": ["HOT", "SALE"],
  "stock": 3,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

---

### 4. Category Display Order ✅
**For:** Proper category sorting in tabs and grid

**Features:**
- `displayOrder` field in Category model
- Categories sorted by `displayOrder` then alphabetically
- New endpoint: `GET /api/categories/top-level` for category tabs

**Usage:**
```javascript
// Get all categories (sorted)
GET /api/categories

// Get only top-level categories (for tabs)
GET /api/categories/top-level
```

---

### 5. Category Icons ✅
**For:** Circular category icons (Men, Women, Kids, etc.)

**Features:**
- `icon` field added to Category model
- Can use `image` field or separate `icon` field
- Both supported in API responses

---

### 6. Wishlist Status in Products ✅
**For:** Show filled/empty heart icons

**Features:**
- All product responses include `isInWishlist` flag (when user is authenticated)
- Automatically calculated based on user's wishlist
- Works with all product endpoints

**Product Response (Authenticated User):**
```json
{
  "_id": "675a1b2c3d4e5f6g7h8i9j0k",
  "title": "Rosewater fiz",
  "price": 360,
  "isInWishlist": true,  // ← Shows if product is favorited
  "calculatedBadges": ["NEW"]
}
```

---

## 🎯 Frontend Integration Guide

### Home Screen Implementation

```javascript
// 1. Get user profile (for greeting "Hi, Omotayo")
const profile = await fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await profile.json();
// Use: user.user.firstname

// 2. Get unread notifications (for bell icon)
const notifications = await fetch('/api/user/notifications/unread-count', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { unreadCount } = await notifications.json();

// 3. Get categories (for tabs and icons)
const categories = await fetch('/api/categories/top-level');
const { categories: categoryTabs } = await categories.json();

// 4. Get featured product (for "Best Offer" banner)
const featured = await fetch('/api/products/featured?limit=1');
const { products: [featuredProduct] } = await featured.json();

// 5. Get recommended products
const recommended = await fetch('/api/products/recommended?limit=10');
const { products: recommendedProducts } = await recommended.json();

// 6. Get products by category
const products = await fetch(`/api/products?category=${categoryId}&page=1&limit=20`);
const { products: productList } = await products.json();
```

### Search Screen Implementation

```javascript
// 1. Get recent searches
const recentSearches = await fetch('/api/user/search-history?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { history } = await recentSearches.json();

// 2. Get categories (for category grid)
const categories = await fetch('/api/categories');
const { categories: categoryGrid } = await categories.json();

// 3. Search products
const searchResults = await fetch(`/api/products?search=${query}`);
const { products } = await searchResults.json();
```

### Search Results Screen Implementation

```javascript
// 1. Get search results
const results = await fetch(`/api/products?search=${query}&page=${page}&limit=20`);
const { products, totalPages, currentPage } = await results.json();

// 2. Toggle wishlist (heart icon)
const toggleWishlist = async (productId, isInWishlist) => {
  if (isInWishlist) {
    // Remove from wishlist
    await fetch(`/api/user/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } else {
    // Add to wishlist
    await fetch('/api/user/wishlist', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });
  }
};
```

---

## 📊 Data Models Updated

### Product Model
```javascript
{
  // ... existing fields
  isFeatured: Boolean,           // For "Best Offer" banner
  featuredAt: Date,              // When featured
  featuredUntil: Date,            // Feature expiry
  badges: [String]               // Manual badges: ["HOT", "NEW", "SALE"]
}
```

### Category Model
```javascript
{
  // ... existing fields
  icon: String,                  // Icon URL for circular icons
  displayOrder: Number           // For sorting categories
}
```

### Wishlist Model (NEW)
```javascript
{
  user: ObjectId,                // Reference to User
  product: ObjectId,             // Reference to Product
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 API Endpoints Summary

### New Endpoints

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/products/featured` | GET | Get featured products | No |
| `/api/categories/top-level` | GET | Get top-level categories only | No |
| `/api/user/wishlist` | GET | Get user's wishlist | Yes |
| `/api/user/wishlist` | POST | Add to wishlist | Yes |
| `/api/user/wishlist/:id` | DELETE | Remove from wishlist | Yes |

### Enhanced Endpoints

| Endpoint | Enhancement |
|----------|-------------|
| `GET /api/products` | Now includes `calculatedBadges` and `isInWishlist` |
| `GET /api/products/:id` | Now includes `calculatedBadges` and `isInWishlist` |
| `GET /api/products/recommended` | Now includes `calculatedBadges` |
| `GET /api/categories` | Now sorted by `displayOrder` |

---

## 🎨 Design-to-API Mapping

### Home Screen Elements

| Design Element | Backend Endpoint | Status |
|----------------|------------------|--------|
| "Hi, Omotayo" | `GET /api/user/profile` | ✅ |
| Notification bell | `GET /api/user/notifications/unread-count` | ✅ |
| Search bar | `GET /api/products?search=...` | ✅ |
| Category tabs | `GET /api/categories/top-level` | ✅ |
| Category icons | `GET /api/categories` (has `icon` field) | ✅ |
| "Best Offer" banner | `GET /api/products/featured?limit=1` | ✅ |
| Recommended section | `GET /api/products/recommended?limit=10` | ✅ |
| Product cards | `GET /api/products?category=...&page=1` | ✅ |
| Discount badges | `calculatedBadges` in product response | ✅ |

### Search Screen Elements

| Design Element | Backend Endpoint | Status |
|----------------|------------------|--------|
| Recent searches | `GET /api/user/search-history` | ✅ |
| Category grid | `GET /api/categories` | ✅ |
| Search button | `GET /api/products?search=...` | ✅ |

### Search Results Screen Elements

| Design Element | Backend Endpoint | Status |
|----------------|------------------|--------|
| Product grid | `GET /api/products?search=...` | ✅ |
| Heart icon | `GET /api/user/wishlist` + `POST/DELETE` | ✅ |
| Product details | `GET /api/products/:id` | ✅ |

---

## 🚀 Quick Start for Frontend

### 1. Home Screen Data Fetching

```javascript
// Fetch all data needed for home screen
const fetchHomeData = async (token) => {
  const [profile, notifications, categories, featured, recommended, products] = await Promise.all([
    fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
    fetch('/api/user/notifications/unread-count', { headers: { 'Authorization': `Bearer ${token}` } }),
    fetch('/api/categories/top-level'),
    fetch('/api/products/featured?limit=1'),
    fetch('/api/products/recommended?limit=10'),
    fetch('/api/products?page=1&limit=20')
  ]);

  return {
    user: await profile.json(),
    unreadCount: (await notifications.json()).unreadCount,
    categories: (await categories.json()).categories,
    featuredProduct: (await featured.json()).products[0],
    recommended: (await recommended.json()).products,
    products: (await products.json()).products
  };
};
```

### 2. Product Card Component Data

Each product in the response includes:
```javascript
{
  _id: "...",
  title: "Product Name",
  price: 99999.99,
  discountPercentage: 20,
  calculatedBadges: ["SALE", "NEW"],  // For badges
  isInWishlist: false,                // For heart icon
  images: ["url1", "url2"],
  category: { name: "Dresses", image: "..." }
}
```

### 3. Wishlist Toggle

```javascript
const handleWishlistToggle = async (productId, currentStatus) => {
  try {
    if (currentStatus) {
      // Remove from wishlist
      await fetch(`/api/user/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else {
      // Add to wishlist
      await fetch('/api/user/wishlist', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId })
      });
    }
    // Update UI
    setWishlistStatus(!currentStatus);
  } catch (error) {
    console.error('Wishlist error:', error);
  }
};
```

---

## ✅ Implementation Checklist

- [x] Featured products endpoint
- [x] Wishlist model and endpoints
- [x] Product badges (automatic calculation)
- [x] Category display order
- [x] Top-level categories endpoint
- [x] Category icon field
- [x] Wishlist status in product responses
- [x] Badge calculation logic
- [x] All routes updated
- [x] All controllers updated

---

## 📝 Notes for Frontend Developer

1. **Badges:** Use `calculatedBadges` array to display badges. Badges are automatically calculated but can be overridden with manual `badges` field.

2. **Wishlist:** The `isInWishlist` field is only included when user is authenticated. For unauthenticated users, it will be `false` or undefined.

3. **Featured Products:** Set `isFeatured: true` when creating/updating products to feature them. Use `featuredUntil` for time-limited features.

4. **Category Sorting:** Set `displayOrder` when creating categories to control their order in tabs and grids.

5. **Search History:** Automatically saved when user searches. Use `GET /api/user/search-history` to show recent searches.

---

**Status:** ✅ All features from Figma design are now implemented in the backend!

