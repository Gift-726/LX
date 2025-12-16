# Figma Design Analysis - Backend Requirements

## 📱 Design Overview

Based on the Figma design, the app has 3 main screens:
1. **Home/Discovery Screen** - Featured products, categories, recommendations
2. **Search Screen** - Recent searches, category grid
3. **Search Results Screen** - Filtered product grid

---

## ✅ Backend Features Already Implemented

### 1. Authentication & User Management ✅
- ✅ User registration with 2FA
- ✅ User login with 2FA
- ✅ User profile (`GET /api/user/profile`)
- ✅ OAuth (Google/Facebook)
- ✅ Password reset

### 2. Products ✅
- ✅ Get all products with filters (`GET /api/products`)
- ✅ Get product by ID (`GET /api/products/:id`)
- ✅ Get recommended products (`GET /api/products/recommended`)
- ✅ Product search functionality
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Tag filtering
- ✅ Pagination

### 3. Categories ✅
- ✅ Get all categories (`GET /api/categories`)
- ✅ Get category by ID (`GET /api/categories/:id`)
- ✅ Hierarchical categories (parent/child)
- ✅ Category images

### 4. Search History ✅
- ✅ Get search history (`GET /api/user/search-history`)
- ✅ Save search query (`POST /api/user/search-history`)
- ✅ Clear search history (`DELETE /api/user/search-history`)

### 5. Notifications ✅
- ✅ Get notifications (`GET /api/user/notifications`)
- ✅ Get unread count (`GET /api/user/notifications/unread-count`)
- ✅ Mark as read (`PUT /api/user/notifications/:id/read`)

---

## 🆕 Backend Features Needed for Figma Design

### 1. Featured Products / Best Offers ⚠️

**Design Requirement:** "Best Offer" banner with featured product

**Current Status:** ❌ Not implemented

**Needed Endpoint:**
```http
GET /api/products/featured
```

**Implementation Needed:**
- Add `isFeatured` field to Product model
- Add `featuredUntil` date field (for time-limited features)
- Create endpoint to get featured products
- Admin endpoint to set/unset featured products

---

### 2. Wishlist/Favorites ⚠️

**Design Requirement:** Heart icon on products (favorite/wishlist)

**Current Status:** ❌ Not implemented

**Needed Endpoints:**
```http
GET    /api/user/wishlist          # Get user's wishlist
POST   /api/user/wishlist          # Add product to wishlist
DELETE /api/user/wishlist/:id      # Remove from wishlist
```

**Implementation Needed:**
- Create `Wishlist` model
- Add wishlist routes
- Add wishlist controller methods
- Update product response to include `isInWishlist` flag

---

### 3. User Greeting / Personalization ⚠️

**Design Requirement:** "Hi, Omotayo" - personalized greeting

**Current Status:** ✅ Partially implemented (user profile has firstname)

**Needed:** 
- User profile already has `firstname` - frontend can use this
- No additional backend needed

---

### 4. Category Grid with Images ⚠️

**Design Requirement:** Category grid (BASICS, BOTTOMS, CO-ORDS, DRESSES) with images

**Current Status:** ✅ Implemented (categories have images)

**Needed:**
- Categories already support images
- May need endpoint to get categories in grid format
- Consider adding `displayOrder` field for sorting

---

### 5. Product Discount Badges ⚠️

**Design Requirement:** "20% OFF", "48% OFF", "HOT" badges on products

**Current Status:** ✅ Partially implemented

**Current:** Products have `discountPercentage` field
**Needed:** 
- Add `badge` or `badges` field (array) to Product model
- Support for: "HOT", "NEW", "SALE", "BESTSELLER"
- Or calculate badges based on discount percentage

---

### 6. Product Details Page ⚠️

**Design Requirement:** "Details >" link on products

**Current Status:** ✅ Implemented (`GET /api/products/:id`)

**Needed:** No additional backend needed

---

### 7. Category Tabs Navigation ⚠️

**Design Requirement:** Horizontal scrollable category tabs

**Current Status:** ✅ Implemented (`GET /api/categories`)

**Needed:** 
- May need to add `displayOrder` or `sortOrder` field
- May need endpoint for top-level categories only

---

### 8. Circular Category Icons ⚠️

**Design Requirement:** Circular icons for Men, Women, Kids, Accessories, Winter

**Current Status:** ✅ Implemented (categories have images)

**Needed:**
- Categories already support images
- May need `icon` field separate from `image` field
- Or use existing `image` field

---

### 9. Product Image URLs ⚠️

**Design Requirement:** Multiple product images in cards

**Current Status:** ✅ Implemented (products have `images` array)

**Needed:** No additional backend needed

---

## 🔧 Required Backend Implementations

### Priority 1: Critical Features

#### 1. Featured Products Endpoint

**File:** `backend/controllers/productController.js`

```javascript
const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const products = await Product.find({ 
      isFeatured: true,
      featuredUntil: { $gte: new Date() } // Only active featured products
    })
      .populate("category", "name image")
      .sort({ featuredAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
```

**Route:** Add to `backend/routes/productRoutes.js`
```javascript
router.get("/featured", getFeaturedProducts);
```

**Model Update:** `backend/models/Product.js`
```javascript
isFeatured: { type: Boolean, default: false },
featuredAt: { type: Date },
featuredUntil: { type: Date }
```

---

#### 2. Wishlist System

**New Model:** `backend/models/Wishlist.js`
```javascript
const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    product: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    }
  },
  { timestamps: true }
);

// Prevent duplicate entries
wishlistSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Wishlist", wishlistSchema);
```

**New Controller:** Add to `backend/controllers/userController.js`
```javascript
const Wishlist = require("../models/Wishlist");

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .populate("product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      wishlist: wishlist.map(item => item.product)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required"
      });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      user: req.user._id,
      product: productId
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist"
      });
    }

    await Wishlist.create({
      user: req.user._id,
      product: productId
    });

    res.json({
      success: true,
      message: "Product added to wishlist"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: id
    });

    res.json({
      success: true,
      message: "Product removed from wishlist"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
```

**Routes:** Add to `backend/routes/userRoutes.js`
```javascript
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist", protect, addToWishlist);
router.delete("/wishlist/:id", protect, removeFromWishlist);
```

---

#### 3. Product Badges

**Model Update:** `backend/models/Product.js`
```javascript
badges: [{ 
  type: String, 
  enum: ["HOT", "NEW", "SALE", "BESTSELLER", "LIMITED"] 
}],
```

**Or calculate badges in controller:**
```javascript
// In productController.js - add badge calculation
const calculateBadges = (product) => {
  const badges = [];
  
  if (product.discountPercentage >= 40) {
    badges.push("HOT");
  }
  if (product.discountPercentage > 0) {
    badges.push("SALE");
  }
  // Check if product is new (created within last 7 days)
  const daysSinceCreation = (Date.now() - product.createdAt) / (1000 * 60 * 60 * 24);
  if (daysSinceCreation <= 7) {
    badges.push("NEW");
  }
  
  return badges;
};
```

---

#### 4. Category Display Order

**Model Update:** `backend/models/Category.js`
```javascript
displayOrder: { type: Number, default: 0 }, // For sorting
```

**Controller Update:** `backend/controllers/categoryController.js`
```javascript
// Sort by displayOrder, then by name
const categories = await Category.find()
  .populate("parentCategory", "name")
  .sort({ displayOrder: 1, name: 1 });
```

---

### Priority 2: Enhancements

#### 5. Top-Level Categories Only

**New Endpoint:** `GET /api/categories/top-level`

```javascript
const getTopLevelCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      parentCategory: null 
    })
      .sort({ displayOrder: 1, name: 1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};
```

---

#### 6. Check if Product is in Wishlist

**Update Product Controller:** When getting products, check if user has them in wishlist

```javascript
// In getProducts or getProductById
const isInWishlist = await Wishlist.findOne({
  user: req.user?._id,
  product: product._id
});

product = product.toObject();
product.isInWishlist = !!isInWishlist;
```

---

## 📊 Implementation Checklist

### Must Have (Priority 1)
- [ ] **Featured Products** - For "Best Offer" banner
- [ ] **Wishlist System** - For heart icons on products
- [ ] **Product Badges** - For discount badges (HOT, SALE, etc.)
- [ ] **Category Display Order** - For proper category sorting

### Nice to Have (Priority 2)
- [ ] **Top-Level Categories Endpoint** - For category tabs
- [ ] **Wishlist Status in Product Response** - Show if product is favorited
- [ ] **Category Icons** - Separate icon field (or use existing image)
- [ ] **Product View Count** - Track popular products

---

## 🎯 API Endpoints Summary for Frontend

### Home Screen Requirements

```javascript
// 1. Get user profile (for greeting)
GET /api/user/profile
Headers: { Authorization: Bearer <token> }

// 2. Get unread notification count (for bell icon)
GET /api/user/notifications/unread-count
Headers: { Authorization: Bearer <token> }

// 3. Get all categories (for tabs and icons)
GET /api/categories

// 4. Get featured products (for "Best Offer" banner)
GET /api/products/featured?limit=1

// 5. Get recommended products (for "Recommended" section)
GET /api/products/recommended?limit=10

// 6. Get products with filters (for product cards)
GET /api/products?page=1&limit=20&category=<categoryId>
```

### Search Screen Requirements

```javascript
// 1. Get recent search history
GET /api/user/search-history?limit=10
Headers: { Authorization: Bearer <token> }

// 2. Get categories (for category grid)
GET /api/categories

// 3. Search products
GET /api/products?search=<query>
```

### Search Results Screen Requirements

```javascript
// 1. Get search results
GET /api/products?search=<query>&page=1&limit=20

// 2. Get user wishlist (to show heart icons)
GET /api/user/wishlist
Headers: { Authorization: Bearer <token> }

// 3. Add/remove from wishlist
POST /api/user/wishlist
Body: { productId: "<id>" }
Headers: { Authorization: Bearer <token> }

DELETE /api/user/wishlist/:id
Headers: { Authorization: Bearer <token> }
```

---

## 🔄 Data Flow Examples

### Home Screen Data Flow

```
1. App loads
   ↓
2. GET /api/user/profile (for "Hi, Omotayo")
   ↓
3. GET /api/user/notifications/unread-count (for bell icon)
   ↓
4. GET /api/categories (for tabs and icons)
   ↓
5. GET /api/products/featured?limit=1 (for "Best Offer" banner)
   ↓
6. GET /api/products/recommended?limit=10 (for "Recommended" section)
   ↓
7. GET /api/products?page=1&limit=20 (for product grid)
```

### Search Flow

```
1. User types in search
   ↓
2. GET /api/products?search=<query> (show results)
   ↓
3. User clicks search
   ↓
4. POST /api/user/search-history (save query)
   ↓
5. GET /api/products?search=<query> (final results)
```

### Wishlist Flow

```
1. User clicks heart icon
   ↓
2. POST /api/user/wishlist (add to wishlist)
   Body: { productId: "..." }
   ↓
3. Update UI (heart filled)
   ↓
4. Or DELETE /api/user/wishlist/:id (remove)
```

---

## 📝 Next Steps

1. **Implement Featured Products** - Critical for home screen
2. **Implement Wishlist** - Critical for product interactions
3. **Add Product Badges** - Important for visual design
4. **Add Category Display Order** - For proper organization
5. **Update Product Responses** - Include wishlist status

---

## ✅ What's Already Working

- ✅ User authentication (2FA)
- ✅ Product listing with filters
- ✅ Category management
- ✅ Search functionality
- ✅ Search history
- ✅ Notifications
- ✅ User profile

---

**Status:** Most core features are implemented. Need to add Featured Products and Wishlist for full Figma design support.

