# Commerce, Cart & Checkout Engine 🛒

This document describes the shopping cart architecture, WebSocket live cart updates, billing calculations, coupon system, and checkout state machine in **CareSure Customer**.

---

## 1. Commerce Lifecycle Diagram

```text
Product Screen / Catalog
           │
           ├─► Add to Cart (cartStore.addItem)
           │
           ▼
Cart Screen (/app/(commerce)/cart.tsx)
    │
    ├─► useCartSocketSync (WebSocket listens for remote cart modifications)
    ├─► Quantity stepper & item removal (cartStore)
    ├─► Stock validation & prescription warning flags
    ├─► Coupon Selection Modal (/app/(commerce)/coupons.tsx)
    │
    ▼
Billing Calculations Engine (useBillingCalculations)
    ├── Subtotal & Product MRP Savings
    ├── Dynamic Delivery Charges (useDeliveryCharges)
    ├── Handling Fee (settings.handlingCharge)
    ├── Coupon Discount (couponStore)
    └── CareSure Coins Loyalty Deduction (up to 10% limit)
           │
           ▼
Proceed to Checkout
           │
           ▼
Checkout Store (checkoutStore)
    ├── Freezes current bill summary (prevents price changes mid-payment)
    ├── Selects Delivery Address (locationStore)
    ├── Selects Payment Method (COD / Online Payment)
           │
           ▼
Order Placement (POST /api/v1/orders)
           │
           ▼
Order Success Screen (/app/(commerce)/order-success.tsx)
    ├── Confetti animation & invoice summary
    └── Redirects to Order Tracking (/profile/orders/track?id=...)
```

---

## 2. Cart State & Real-Time Sync

### 1. `cartStore` (`src/store/cartStore.ts`)
- Stores item IDs, quantities, product names, images, prescription requirement flags, and prices in `AsyncStorage`.
- Supports optimistic UI updates: tapping `+` immediately increments the counter on screen before the network request resolves.

### 2. WebSocket Real-Time Sync (`useCartSocketSync`)
- CareSure maintains a WebSocket connection (`socket.io-client`).
- When products in a user's cart change on the server (e.g. price update, inventory stockout, or backend cart modification), the socket emits an event that invalidates React Query's `["cart"]` cache, seamlessly synchronizing the UI.

---

## 3. Billing Engine (`useBillingCalculations.ts`)

The billing engine provides identical, authoritative math across Cart, Checkout, and Prescription Order screens:

1. **Subtotal**: Sum of selling prices of all items in the cart.
2. **Product MRP Savings**: `roundToPaise(Math.max(0, mrpTotal - subtotal))`.
3. **Delivery Fee**: Free delivery when `subtotal >= freeDeliveryAbove` threshold (governed by `useDeliveryCharges`).
4. **Handling Fee**: Configured by admin settings.
5. **Coupons**: Validates minimum cart value and computes percentage or flat savings via `couponStore`.
6. **CareSure Coins**: Deducts up to `coinUsagePercentage` (default: 10%) of the subtotal using the user's available coins balance.
7. **Total Payable**:
   $$\text{Payable} = \max(0, \text{Subtotal} - \text{Coupon} - \text{Coins} + \text{Delivery} + \text{Handling})$$

---

## 4. Checkout State Machine (`checkoutStore.ts`)

When the user taps **Proceed to Checkout**:
1. The billing calculations are frozen into `checkoutStore` so that background price fluctuations cannot change the final amount charged during payment gateway interaction.
2. `locationStore` provides the selected delivery address ID and verified pincode.
3. On order confirmation:
   - `cartStore.clearCart()` empties the local cart.
   - `checkoutStore.reset()` clears checkout state.
   - The user is navigated to `/(commerce)/order-success`.
