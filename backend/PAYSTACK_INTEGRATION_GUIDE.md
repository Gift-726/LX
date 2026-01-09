# Paystack Payment Gateway Integration Guide

This document provides a complete guide for integrating and testing Paystack payment gateway in the LX e-commerce backend.

## Overview

Paystack integration allows users to pay for orders securely using cards, bank transfers, and other payment methods supported by Paystack.

---

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_d87383e7b165cc12319050f6abde7ef898070da6
PAYSTACK_PUBLIC_KEY=pk_test_6329c0b91a74207b75096445e60cce3db564b6b4

# Frontend URL (for callback after payment)
FRONTEND_URL=http://localhost:3001
PAYSTACK_CALLBACK_URL=http://localhost:3001/payment/callback
```

**Note:** 
- Use test keys for development
- Replace with live keys for production
- Update `FRONTEND_URL` and `PAYSTACK_CALLBACK_URL` with your actual frontend URL

---

## API Endpoints

### 1. Initialize Payment
**Endpoint:** `POST /api/payments/initialize`  
**Auth:** Required  
**Body:**
```json
{
  "orderId": "order_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/xxxxx",
    "access_code": "xxxxx",
    "reference": "ORD-XXXXX",
    "orderId": "...",
    "orderNumber": "ORD-XXXXX"
  }
}
```

### 2. Verify Payment
**Endpoint:** `GET /api/payments/verify/:reference`  
**Auth:** Required  
**Description:** Verifies payment status after user completes payment

**Response (Success):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-XXXXX",
      "total": 50000,
      "paymentStatus": "paid",
      "status": "confirmed"
    },
    "transaction": {
      "reference": "ORD-XXXXX",
      "amount": 50000,
      "currency": "NGN",
      "status": "success",
      "paidAt": "2025-01-15T10:00:00.000Z"
    }
  }
}
```

### 3. Get Payment Status
**Endpoint:** `GET /api/payments/status/:orderId`  
**Auth:** Required  
**Description:** Get current payment status of an order

**Response:**
```json
{
  "success": true,
  "payment": {
    "orderNumber": "ORD-XXXXX",
    "paymentStatus": "paid",
    "paymentReference": "ORD-XXXXX",
    "orderStatus": "confirmed",
    "total": 50000
  }
}
```

### 4. Refund Payment (Admin)
**Endpoint:** `POST /api/payments/refund/:orderId`  
**Auth:** Required (Admin)  
**Body:**
```json
{
  "amount": 25000,
  "reason": "Customer requested refund"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "refund": {
    "reference": "refund_ref_xxxxx",
    "amount": 25000,
    "currency": "NGN",
    "status": "processed"
  }
}
```

---

## Payment Flow

### Step-by-Step Process:

1. **User Creates Order**
   - User adds items to cart
   - User creates order via `POST /api/orders`
   - Order is created with `paymentStatus: "pending"`
   - Stock is NOT reduced yet (waiting for payment)

2. **Initialize Payment**
   - Frontend calls `POST /api/payments/initialize` with `orderId`
   - Backend creates Paystack transaction
   - Returns `authorization_url`

3. **User Redirects to Paystack**
   - Frontend redirects user to `authorization_url`
   - User completes payment on Paystack

4. **Paystack Redirects Back**
   - Paystack redirects to `PAYSTACK_CALLBACK_URL`
   - Frontend receives payment reference

5. **Verify Payment**
   - Frontend calls `GET /api/payments/verify/:reference`
   - Backend verifies with Paystack API
   - If successful:
     - Updates order `paymentStatus` to "paid"
     - Updates order `status` to "confirmed"
     - Reduces product stock
     - Increments sales count
   - Returns payment confirmation

---

## Testing with Paystack

### Test Cards

Paystack provides test cards for testing different scenarios:

#### Successful Payment:
- **Card Number:** `4084084084084081`
- **CVV:** Any 3 digits (e.g., `408`)
- **Expiry:** Any future date (e.g., `12/25`)
- **PIN:** Any 4 digits (e.g., `0000`)

#### Failed Payment:
- **Card Number:** `5060666666666666666`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **PIN:** Any 4 digits

#### Insufficient Funds:
- **Card Number:** `5060666666666666667`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **PIN:** Any 4 digits

#### 3D Secure (OTP):
- **Card Number:** `5060666666666666668`
- **CVV:** Any 3 digits
- **Expiry:** Any future date
- **PIN:** Any 4 digits
- **OTP:** Use `123456` when prompted

### Test Bank Account (Bank Transfer):
- **Bank:** Any bank
- **Account Number:** `0690000031`
- **Account Name:** Any name

---

## Testing Steps

### 1. Start Your Server
```bash
cd backend
node server.js
```

### 2. Create an Order
```bash
POST http://localhost:3000/api/orders
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "shippingAddressId": "address_id",
  "shippingMethodId": "shipping_method_id",
  "paymentMethod": "paystack"
}
```

**Response:** Copy the `order._id` from the response

### 3. Initialize Payment
```bash
POST http://localhost:3000/api/payments/initialize
Headers:
  Authorization: Bearer YOUR_TOKEN
  Content-Type: application/json

Body:
{
  "orderId": "order_id_from_step_2"
}
```

**Response:** Copy the `authorization_url` from the response

### 4. Test Payment
- Open the `authorization_url` in your browser
- Use test card: `4084084084084081`
- Complete the payment
- Paystack will redirect to your callback URL

### 5. Verify Payment
```bash
GET http://localhost:3000/api/payments/verify/ORD-XXXXX
Headers:
  Authorization: Bearer YOUR_TOKEN
```

Replace `ORD-XXXXX` with the order number or reference from step 3

### 6. Check Order Status
```bash
GET http://localhost:3000/api/orders/order_id
Headers:
  Authorization: Bearer YOUR_TOKEN
```

Verify that:
- `paymentStatus` is now "paid"
- `status` is "confirmed"
- Stock has been reduced

---

## Complete Test Flow Example

### Using cURL:

```bash
# 1. Create Order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shippingAddressId": "ADDRESS_ID",
    "shippingMethodId": "SHIPPING_ID",
    "paymentMethod": "paystack"
  }'

# Response: {"order": {"_id": "ORDER_ID", "orderNumber": "ORD-XXXXX"}}

# 2. Initialize Payment
curl -X POST http://localhost:3000/api/payments/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID"
  }'

# Response: {"data": {"authorization_url": "https://checkout.paystack.com/xxxxx"}}

# 3. Open authorization_url in browser and complete payment with test card

# 4. Verify Payment
curl -X GET http://localhost:3000/api/payments/verify/ORD-XXXXX \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Check Payment Status
curl -X GET http://localhost:3000/api/payments/status/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Frontend Integration Example

### React/Next.js Example:

```javascript
// 1. Create Order
const createOrder = async () => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      shippingAddressId: addressId,
      shippingMethodId: shippingId,
      paymentMethod: 'paystack'
    })
  });
  const data = await response.json();
  return data.order;
};

// 2. Initialize Payment
const initializePayment = async (orderId) => {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orderId })
  });
  const data = await response.json();
  return data.data;
};

// 3. Redirect to Paystack
const handlePayment = async () => {
  const order = await createOrder();
  const payment = await initializePayment(order._id);
  window.location.href = payment.authorization_url;
};

// 4. Verify Payment (after redirect)
const verifyPayment = async (reference) => {
  const response = await fetch(`/api/payments/verify/${reference}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};
```

---

## Error Handling

### Common Errors:

1. **"Order not found"**
   - Check if order ID is correct
   - Verify order belongs to authenticated user

2. **"Order has already been paid"**
   - Order payment status is already "paid"
   - Check order status before initializing payment

3. **"Payment verification failed"**
   - Payment was not successful
   - Check transaction status in Paystack dashboard
   - Verify reference is correct

4. **"Failed to initialize payment"**
   - Check Paystack secret key in `.env`
   - Verify network connection
   - Check Paystack API status

---

## Order Status Flow

### Payment Status:
- `pending` → Order created, payment not initiated
- `pending` → Payment initialized, waiting for user
- `paid` → Payment verified successfully
- `failed` → Payment failed or was declined
- `refunded` → Payment was refunded

### Order Status:
- `pending` → Order created
- `confirmed` → Payment verified, order confirmed
- `processing` → Order being prepared
- `shipped` → Order shipped
- `delivered` → Order delivered
- `refunded` → Order refunded

---

## Security Notes

1. **Never expose secret key**
   - Secret key should only be in `.env` file
   - Never commit `.env` to version control
   - Never send secret key to frontend

2. **Always verify on backend**
   - Don't trust frontend payment status
   - Always verify with Paystack API
   - Use webhook for backup verification (optional)

3. **Validate amounts**
   - Verify payment amount matches order total
   - Prevent amount manipulation

4. **Handle errors gracefully**
   - Log payment errors
   - Notify users of payment failures
   - Provide retry mechanisms

---

## Production Checklist

Before going live:

- [ ] Replace test keys with live keys
- [ ] Update `FRONTEND_URL` to production URL
- [ ] Update `PAYSTACK_CALLBACK_URL` to production callback URL
- [ ] Test with real payment (small amount)
- [ ] Set up webhook endpoint (optional but recommended)
- [ ] Monitor payment logs
- [ ] Set up error alerts
- [ ] Test refund functionality
- [ ] Review security measures

---

## Files Created/Modified

### New Files:
- `backend/config/paystack.js` - Paystack configuration
- `backend/controllers/paymentController.js` - Payment logic
- `backend/routes/paymentRoutes.js` - Payment routes

### Modified Files:
- `backend/models/Order.js` - Added Paystack fields
- `backend/controllers/orderController.js` - Updated order creation (stock reduction moved to payment verification)
- `backend/server.js` - Registered payment routes
- `backend/package.json` - Added Paystack dependency

---

## Support

For Paystack issues:
- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Paystack Status: https://status.paystack.com

For integration issues:
- Check server logs for errors
- Verify environment variables
- Test with Paystack test cards
- Review Paystack dashboard for transaction details

