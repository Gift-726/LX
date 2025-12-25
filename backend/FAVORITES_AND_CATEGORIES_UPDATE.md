# Favorites and Categories Update Summary

## ✅ Changes Completed

### 1. Renamed Wishlist to Favorites
- **Model:** `backend/models/Wishlist.js` → `backend/models/Favorites.js`
- **Routes:** `/api/user/wishlist` → `/api/user/favorites`
- **Controller:** All wishlist functions renamed to favorites
- **Product Responses:** `isInWishlist` → `isInFavorites`

### 2. Category System Updates

#### New Features:
- **Last Selected Category Tracking:** Users now have a `lastSelectedCategory` field that tracks their last viewed category
- **Active Category Endpoint:** `GET /api/categories/active` - Returns user's last selected category (or first category for new users)
- **Auto-Tracking:** When a user views a category via `GET /api/categories/:id`, it automatically updates their last selected category

#### Admin Category Management:
- **Update Category:** `PUT /api/categories/:id` (Admin only)
- **Delete Category:** `DELETE /api/categories/:id` (Admin only)
  - Cannot delete categories with products
  - Cannot delete categories with subcategories

### 3. Default Categories
The system now has 11 default categories:
1. Travel Essentials
2. Dresses
3. Basics
4. Body Suits
5. Co-ords
6. Tops
7. Bottoms
8. Male
9. Female
10. Kids
11. Accessories

### 4. Seed Scripts Created

#### Seed Categories
**File:** `backend/scripts/seedCategories.js`

**Usage:**
```bash
cd backend
node scripts/seedCategories.js
```

This script:
- Creates all 11 default categories
- Sets proper display order
- Skips categories that already exist (safe to run multiple times)

#### Seed Products
**File:** `backend/scripts/seedProducts.js`

**Usage:**
```bash
cd backend
node scripts/seedProducts.js
```

This script:
- Creates 5-8 products for each of the 11 categories
- Total: ~70 products with realistic data
- Includes all required fields (title, description, price, category, images, tags, stock)
- Skips products that already exist (safe to run multiple times)

## 📋 Updated API Endpoints

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/top-level` - Get top-level categories only
- `GET /api/categories/active` - Get user's active category (last selected or first)
- `GET /api/categories/:id` - Get category by ID (tracks as last selected for authenticated users)
- `POST /api/categories` - Create category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Favorites (formerly Wishlist)
- `GET /api/user/favorites` - Get user's favorite products
- `POST /api/user/favorites` - Add product to favorites
- `DELETE /api/user/favorites/:id` - Remove product from favorites

### Product Responses
All product endpoints now include:
- `calculatedBadges`: Array of automatically calculated badges (HOT, NEW, SALE, LIMITED)
- `isInFavorites`: Boolean indicating if product is in user's favorites (only for authenticated users)

## 🔄 Migration Notes

### For Existing Users
- Existing users will have `lastSelectedCategory: null` initially
- When they access `/api/categories/active`, they'll get the first category
- Their last selected category will be tracked going forward

### For Existing Data
- If you had wishlist data, you'll need to migrate it manually or recreate it
- The Favorites model uses the same structure as the old Wishlist model

## 🚀 Next Steps

1. **Run Seed Scripts:**
   ```bash
   # First, seed categories
   node backend/scripts/seedCategories.js
   
   # Then, seed products
   node backend/scripts/seedProducts.js
   ```

2. **Update Frontend:**
   - Replace all `/api/user/wishlist` endpoints with `/api/user/favorites`
   - Replace `isInWishlist` with `isInFavorites` in product objects
   - Use `GET /api/categories/active` to get the default category on app load
   - Track category selection by calling `GET /api/categories/:id` when user clicks a category

3. **Test:**
   - Test category selection and tracking
   - Test favorites functionality
   - Test admin category management (create, update, delete)

## 📝 Important Notes

- **Category Selection:** The system automatically tracks the last selected category for authenticated users. For unauthenticated users or new users, it defaults to the first category.
- **Favorites vs Wishlist:** The concept is now "favorites" (favorite stores) instead of "wishlist". This aligns with the Figma design.
- **Product Badges:** Products automatically get badges based on:
  - **HOT:** High discount (>30%) or low stock (<10)
  - **NEW:** Created within last 7 days
  - **SALE:** Has discount percentage > 0
  - **LIMITED:** Stock < 5

## 🐛 Troubleshooting

### Categories Not Showing
- Make sure you've run `seedCategories.js`
- Check that categories exist in database: `db.categories.find()`

### Products Not Showing
- Make sure you've run `seedProducts.js`
- Check that products exist: `db.products.find()`
- Verify categories exist before seeding products

### Last Selected Category Not Working
- Ensure user is authenticated (JWT token in header)
- Check that `lastSelectedCategory` field exists in User model
- Verify category ID is valid when accessing `/api/categories/:id`

