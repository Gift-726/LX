# Paystack Setup Instructions

## Quick Setup

### 1. Add Environment Variables

Create or update your `.env` file in the `backend` directory with:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_d87383e7b165cc12319050f6abde7ef898070da6
PAYSTACK_PUBLIC_KEY=pk_test_6329c0b91a74207b75096445e60cce3db564b6b4

# Frontend URL (update with your frontend URL)
FRONTEND_URL=http://localhost:3001
PAYSTACK_CALLBACK_URL=http://localhost:3001/payment/callback
```

### 2. Restart Your Server

After adding the environment variables, restart your server:

```bash
node server.js
```

---

## Testing Paystack Integration

### Step 1: Create an Order

```bash
POST http://localhost:3000/api/orders
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "shippingAddressId": "your_address_id",
  "shippingMethodId": "your_shipping_method_id",
  "paymentMethod": "paystack"
}
```

**Save the `order._id` from the response**

### Step 2: Initialize Payment

```bash
POST http://localhost:3000/api/payments/initialize
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderId": "order_id_from_step_1"
}
```

**Copy the `authorization_url` from the response**

### Step 3: Test Payment

1. Open the `authorization_url` in your browser
2. Use Paystack test card:
   - **Card Number:** `4084084084084081`
   - **CVV:** `408`
   - **Expiry:** `12/25` (any future date)
   - **PIN:** `0000` (any 4 digits)
3. Complete the payment
4. Paystack will redirect you back

### Step 4: Verify Payment

```bash
GET http://localhost:3000/api/payments/verify/ORD-XXXXX
Authorization: Bearer YOUR_TOKEN
```

Replace `ORD-XXXXX` with your order number

### Step 5: Check Order Status

```bash
GET http://localhost:3000/api/orders/order_id
Authorization: Bearer YOUR_TOKEN
```

Verify:
- `paymentStatus` = "paid"
- `status` = "confirmed"
- Stock has been reduced

---

## Test Cards

### Successful Payment:
- Card: `4084084084084081`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: Any 4 digits

### Failed Payment:
- Card: `5060666666666666666`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: Any 4 digits

### 3D Secure (OTP):
- Card: `5060666666666666668`
- CVV: Any 3 digits
- Expiry: Any future date
- PIN: Any 4 digits
- OTP: `123456`

---

## Payment Flow Summary

1. **Create Order** → Order saved with `paymentStatus: "pending"`
2. **Initialize Payment** → Get Paystack authorization URL
3. **User Pays** → Complete payment on Paystack
4. **Verify Payment** → Backend verifies and updates order
5. **Order Confirmed** → Stock reduced, order ready to process

---

## Troubleshooting

### "Failed to initialize payment"
- Check if `PAYSTACK_SECRET_KEY` is set in `.env`
- Verify the key is correct
- Restart server after adding environment variables

### "Order not found"
- Verify order ID is correct
- Check if order belongs to authenticated user

### "Payment verification failed"
- Payment was not successful
- Check transaction in Paystack dashboard
- Verify reference is correct

---

## Next Steps

1. Add environment variables to `.env`
2. Restart server
3. Test with the steps above
4. Integrate with your frontend
5. For production, replace test keys with live keys

