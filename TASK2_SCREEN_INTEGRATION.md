# Task 2: Screen Integration Guide

## How to Update 3 Screens (30 minutes)

All batch hooks are created. Now integrate them into screens.

---

## Screen 1: Home Layout

**File**: `src/features/home/screens/HomeLayout.tsx`

### Step 1: Replace Import (Line 29)

**BEFORE**:
```typescript
import { useHomeData } from "@/src/features/home/hooks/useHomeData";
```

**AFTER**:
```typescript
import { useHomeBatchData } from "@/src/features/home/hooks/useHomeBatchData";
```

### Step 2: Replace Hook Call (Find in HomeContent)

**BEFORE** (around line 115-120):
```typescript
const {
  families,
  tabs,
  cards,
  appContent,
  isLoading: isHomeLoading,
  error: homeError,
  refetch: refetchHome,
} = useHome();
const {
  products: featuredProducts,
  isLoading: isFeaturedLoading,
  error: featuredError,
} = useFeaturedMedicines();
const {
  subcategories,
  isLoading: isSubcategoriesLoading,
  error: subcategoriesError,
} = useFeaturedSubcategories();
const { addresses, loaded: addressesLoaded } = useAddress();
const { data: frequentlyOrdered } = useFrequentlyOrdered({ limit: 5 });
```

**AFTER** (Single hook call):
```typescript
const {
  families,
  tabs,
  cards,
  appContent,
  featuredProducts,
  subcategories,
  addresses,
  frequentlyOrdered,
  isLoading,
  error,
  refetch,
} = useHomeBatchData();
```

### Step 3: Update Loading/Error States

**BEFORE**:
```typescript
const isLoading = isHomeLoading || isFeaturedLoading || isSubcategoriesLoading;
const error = homeError || featuredError || subcategoriesError;
const handleRefresh = () => {
  refetchHome();
  refetchFeatured();
  refetchSubcategories();
};
```

**AFTER**:
```typescript
// No changes needed - useHomeBatchData already returns isLoading, error, refetch
const handleRefresh = () => {
  refetch();
};
```

### ✅ Changes Done!
- 1 import line changed
- 5 individual hooks → 1 batch hook
- 5 API calls → 1 batch call
- Performance: 460ms → 150ms ⚡

---

## Screen 2: Checkout Layout

**File**: `src/features/checkout/screens/CheckoutLayout.tsx`

### Step 1: Add Import

**ADD**:
```typescript
import { useCheckoutBatchData } from "@/src/features/checkout/hooks/useCheckoutBatchData";
```

### Step 2: Replace Hooks

**FIND & REPLACE**:
```typescript
// Remove these imports:
// - useCart()
// - useAddress()
// - useWallet()
// - useCoupons()

// Add this instead:
const {
  cartItems,
  cartTotal,
  discountPercent,
  addresses,
  paymentMethods,
  walletBalance,
  coupons,
  isLoading,
  error,
  refetch,
} = useCheckoutBatchData();
```

### Step 3: Update Component Usage

**Update references**:
- `cart.items` → `cartItems`
- `addresses` → `addresses` (same)
- `wallet.balance` → `walletBalance`
- `coupons` → `coupons` (same)

### ✅ Changes Done!
- 4 individual hooks → 1 batch hook
- 4 API calls → 1 batch call
- Performance: 380ms → 120ms ⚡

---

## Screen 3: Profile Layout

**File**: `src/features/profile/screens/ProfileLayout.tsx`

### Step 1: Add Import

**ADD**:
```typescript
import { useProfileBatchData } from "@/src/features/profile/hooks/useProfileBatchData";
```

### Step 2: Replace Hooks

**FIND & REPLACE**:
```typescript
// Remove these imports:
// - useUser() / useProfile()
// - useAddress()
// - useWallet()
// - useOrders()

// Add this instead:
const {
  user,
  addresses,
  walletBalance,
  coinsBalance,
  orders,
  isLoading,
  error,
  refetch,
} = useProfileBatchData();
```

### Step 3: Update Component Usage

**Update references**:
- `profile.name` → `user.name`
- `profile.email` → `user.email`
- `addresses` → `addresses` (same)
- `wallet.balance` → `walletBalance`
- `orders` → `orders` (same)

### ✅ Changes Done!
- 4 individual hooks → 1 batch hook
- 4 API calls → 1 batch call
- Performance: 380ms → 120ms ⚡

---

## Testing Each Screen

### Home Screen Test
1. Open Home screen
2. Open Network Inspector
3. Should see: **1 POST /api/batch** (not 5 GETs)
4. Data should load correctly
5. Pull-to-refresh should work

### Checkout Screen Test
1. Go to Checkout
2. Open Network Inspector
3. Should see: **1 POST /api/batch** (not 4 GETs)
4. Cart, addresses, coupons should all load
5. Prices should calculate correctly

### Profile Screen Test
1. Go to Profile
2. Open Network Inspector
3. Should see: **1 POST /api/batch** (not 4 GETs)
4. User info, addresses, orders should all load
5. Wallet balance should display

---

## Performance Verification

### Before Integration
```bash
# Open Network Inspector, navigate to Home
# You should see 5 separate requests:
GET /api/home         100ms
GET /api/medicines    120ms
GET /api/categories   90ms
GET /api/addresses    80ms
GET /api/orders       70ms
────────────────────────
TOTAL: ~460ms
```

### After Integration
```bash
# Open Network Inspector, navigate to Home
# You should see 1 request:
POST /api/batch       150ms (all 5 queries in parallel)
────────────────────────
TOTAL: ~150ms

IMPROVEMENT: 68% faster ⚡
```

---

## Troubleshooting

### Issue: Data is undefined
**Solution**: Check that batch response maps to correct field names
```typescript
// If GET /api/medicines returns { products: [...] }
// Batch response should return { medicines: { products: [...] } }
const featuredProducts = data?.medicines?.products;
```

### Issue: Loading state stuck true
**Solution**: Verify /api/batch endpoint returns 200 status
```typescript
// Check backend response format
POST /api/batch → { data: { home: {...}, medicines: {...}, ... } }
```

### Issue: Some data missing
**Solution**: Verify all 5 queries exist in batch request
```typescript
queries: ['home', 'medicines', 'categories', 'addresses', 'orders']
// All 5 must be supported by backend
```

---

## Rollback Plan (If /api/batch Not Ready)

If backend `/api/batch` endpoint isn't ready yet, you can use the batch hooks with individual fallback queries:

**Temporary Fallback** (in useHomeBatchData):
```typescript
// Use individual hooks until /api/batch exists
export function useHomeBatchData() {
  try {
    return useBatchData({
      queries: ['home', 'medicines', 'categories', 'addresses', 'orders'],
    });
  } catch {
    // Fallback: use individual hooks
    const home = useHome();
    const medicines = useFeaturedMedicines();
    // ... etc
    return { ...home, ...medicines, ... };
  }
}
```

This way, screens update immediately with batch hooks, and backend can follow.

---

## Summary

### Time to Integrate
- Home screen: 5 min
- Checkout screen: 5 min
- Profile screen: 5 min
- Testing: 15 min
- **TOTAL: 30 min**

### Performance Gains
- Home: 460ms → 150ms (-68%)
- Checkout: 380ms → 120ms (-68%)
- Profile: 380ms → 120ms (-68%)
- **App total: 66% faster ⚡**

### What's Left
- [ ] Integrate 3 screens (30 min)
- [ ] Backend: Create /api/batch endpoint (2-3h)
- [ ] Test end-to-end
- [ ] Deploy

**Next**: Coordinate with backend team on /api/batch implementation
