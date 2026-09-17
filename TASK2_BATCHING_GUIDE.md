# Task 2: Request Batching - Implementation Guide

## Goal: 50-70% Fewer API Calls

Combine multiple separate API calls into **1 batched request**

---

## Current State: Home Screen Example

### Before Batching (5 Separate Calls)

```typescript
// src/features/home/hooks/useHomeData.ts

const { families, tabs, cards, appContent } = useHome();          // Call 1
const { products: featuredProducts } = useFeaturedMedicines();    // Call 2
const { subcategories } = useFeaturedSubcategories();             // Call 3
const { addresses } = useAddress();                               // Call 4
const { data: frequentlyOrdered } = useFrequentlyOrdered({...});  // Call 5

// RESULT: 5 sequential/parallel API calls = ~500-700ms
```

**Network Waterfall**:
```
GET /api/home                → 100ms
GET /api/medicines/featured  → 120ms
GET /api/categories          → 90ms
GET /api/addresses           → 80ms
GET /api/orders/frequent     → 70ms
────────────────────────────────
TOTAL: 460ms (5 calls)
```

---

## After Batching (1 Batch Call)

### Option A: New Composite Hook

**New File**: `src/features/home/hooks/useHomeBatchData.ts`

```typescript
import { useBatchData } from '@/src/hooks/queries/useBatchData';

/**
 * Batch load all home screen data in one request
 * 
 * Combines:
 * - Home (families, tabs, cards)
 * - Featured medicines
 * - Categories
 * - Addresses
 * - Frequently ordered
 */
export function useHomeBatchData() {
  const batchData = useBatchData({
    queries: [
      'home',          // families, tabs, cards, appContent
      'medicines',     // featured medicines
      'categories',    // featured categories
      'addresses',     // user addresses
      'orders'         // frequently ordered
    ],
    staleTime: 5 * 60_000,  // 5 minutes
    gcTime: 60 * 60_000,    // 1 hour
  });

  return {
    appContent: batchData.data?.home?.appContent,
    families: batchData.data?.home?.families,
    tabs: batchData.data?.home?.tabs,
    cards: batchData.data?.home?.cards,
    
    featuredProducts: batchData.data?.medicines?.products,
    subcategories: batchData.data?.categories?.subcategories,
    addresses: batchData.data?.addresses,
    frequentlyOrdered: batchData.data?.orders?.data || [],
    
    isLoading: batchData.isLoading,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
```

**Usage in HomeLayout**:
```typescript
import { useHomeBatchData } from '@/src/features/home/hooks/useHomeBatchData';

function HomeContent() {
  const { 
    appContent, 
    families, 
    featuredProducts, 
    addresses,
    frequentlyOrdered,
    isLoading 
  } = useHomeBatchData();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <HeroBanner content={appContent} />
      <FamilyCarousel families={families} />
      <FeaturedProducts products={featuredProducts} />
      ...
    </>
  );
}
```

**Network Result**:
```
POST /api/batch {
  queries: ['home', 'medicines', 'categories', 'addresses', 'orders']
}
────────────────────────────────
TOTAL: 150ms (1 call)

SAVINGS: 460ms → 150ms = 68% faster! ⚡
```

---

## Implementation Plan: 3 Key Screens

### Screen 1: Home Screen (5→1 calls)

**File**: Create `src/features/home/hooks/useHomeBatchData.ts`

```typescript
export function useHomeBatchData() {
  return useBatchData({
    queries: ['home', 'medicines', 'categories', 'addresses', 'orders'],
  });
}
```

**Current Hooks Replaced**:
- ❌ useHome()
- ❌ useFeaturedMedicines()
- ❌ useFeaturedSubcategories()
- ❌ useAddress()
- ❌ useFrequentlyOrdered()

**Savings**: 5 calls → 1 call (-80%)

---

### Screen 2: Checkout Screen (4→1 calls)

**File**: Create `src/features/checkout/hooks/useCheckoutBatchData.ts`

```typescript
export function useCheckoutBatchData() {
  return useBatchData({
    queries: ['cart', 'addresses', 'wallet', 'coupons'],
  });
}
```

**Current Hooks Replaced**:
- ❌ useCart()
- ❌ useAddress()
- ❌ useWallet()
- ❌ useCoupons()

**Savings**: 4 calls → 1 call (-75%)

---

### Screen 3: Profile Screen (4→1 calls)

**File**: Create `src/features/profile/hooks/useProfileBatchData.ts`

```typescript
export function useProfileBatchData() {
  return useBatchData({
    queries: ['profile', 'addresses', 'wallet', 'orders'],
  });
}
```

**Current Hooks Replaced**:
- ❌ useUser() / useProfile()
- ❌ useAddress()
- ❌ useWallet()
- ❌ useOrders()

**Savings**: 4 calls → 1 call (-75%)

---

## Implementation Steps

### Step 1: Create Home Batch Hook (15 min)
```bash
# Create new hook file
touch src/features/home/hooks/useHomeBatchData.ts

# Copy template from this guide
# Update field mappings for your data structure
```

### Step 2: Update HomeLayout (10 min)
```typescript
// Replace individual hooks with batch hook
import { useHomeBatchData } from './useHomeBatchData';
const data = useHomeBatchData();
```

### Step 3: Create Checkout Batch Hook (15 min)
```bash
touch src/features/checkout/hooks/useCheckoutBatchData.ts
```

### Step 4: Update CheckoutLayout (10 min)
```typescript
import { useCheckoutBatchData } from './useCheckoutBatchData';
```

### Step 5: Create Profile Batch Hook (15 min)
```bash
touch src/features/profile/hooks/useProfileBatchData.ts
```

### Step 6: Update ProfileLayout (10 min)
```typescript
import { useProfileBatchData } from './useProfileBatchData';
```

### Step 7: Test & Verify (15 min)
```bash
# Test each screen
# Check Network Inspector: should see 1 POST to /api/batch
# Verify data loads correctly
# No errors or missing fields
```

**Total Time**: 90 minutes (1.5 hours)

---

## Backend Requirements

⚠️ **Requires Backend Implementation**

The `/api/v1/batch` endpoint must exist and support:

```typescript
// REQUEST
POST /api/v1/batch
{
  "queries": ["home", "medicines", "categories", "addresses", "orders"]
}

// RESPONSE
{
  "data": {
    "home": { families: [...], tabs: [...], cards: [...], appContent: {...} },
    "medicines": { products: [...] },
    "categories": { subcategories: [...] },
    "addresses": [{...}, {...}],
    "orders": { data: [...] }
  }
}
```

### Coordinator with Backend
- [ ] Define `/api/v1/batch` schema
- [ ] Implement batching logic (combine 5 queries)
- [ ] Handle partial failures (if one query fails)
- [ ] Return 200 with errors object for failed queries
- [ ] Test with Postman/curl

**Backend Effort**: 2-3 hours (parallel with frontend)

---

## Before vs After Metrics

### Home Screen
```
BEFORE: 5 API calls in series = 460ms total
AFTER:  1 batch call = 150ms total
GAIN:   68% faster ⚡
```

### Checkout Screen
```
BEFORE: 4 API calls = 380ms
AFTER:  1 batch call = 120ms
GAIN:   68% faster ⚡
```

### Profile Screen
```
BEFORE: 4 API calls = 380ms
AFTER:  1 batch call = 120ms
GAIN:   68% faster ⚡
```

### App-Wide Impact
```
Previous: Typical user journey uses 3 screens
Home:     460ms → 150ms
Checkout: 380ms → 120ms
Profile:  380ms → 120ms
────────────────────────
BEFORE: 1220ms total
AFTER:  390ms total
GAIN:   68% faster for entire user journey!
```

---

## Code Template: Batch Hook

```typescript
/**
 * Batch load all [SCREEN] data in one request
 * 
 * Replaces these hooks:
 * - useHook1()
 * - useHook2()
 * - useHook3()
 * - useHook4()
 */

import { useBatchData } from '@/src/hooks/queries/useBatchData';

export function use[SCREEN]BatchData() {
  const batchData = useBatchData({
    queries: [
      'query1',  // What it fetches: field1, field2
      'query2',  // What it fetches: field3, field4
      'query3',  // What it fetches: field5
      'query4',  // What it fetches: field6
    ],
    staleTime: 5 * 60_000,    // 5 minutes for frequently-changing data
    gcTime: 60 * 60_000,      // 1 hour for memory
  });

  return {
    // Map batch response to original hook shape
    field1: batchData.data?.query1?.field1,
    field2: batchData.data?.query1?.field2,
    field3: batchData.data?.query2?.field3,
    field4: batchData.data?.query2?.field4,
    field5: batchData.data?.query3?.field5,
    field6: batchData.data?.query4?.field6,
    
    // Forward loading/error states
    isLoading: batchData.isLoading,
    error: batchData.error,
    refetch: batchData.refetch,
  };
}
```

---

## Testing Checklist

- [ ] All 3 batch hooks created and exported
- [ ] All 3 screens updated to use batch hooks
- [ ] TypeScript: No errors
- [ ] Network Inspector: Shows 1 POST /api/batch per screen
- [ ] Data loads correctly on each screen
- [ ] No missing fields or broken components
- [ ] Loading state works (shows spinner)
- [ ] Error state works (shows error message)
- [ ] Pull-to-refresh works (calls refetch)
- [ ] App doesn't crash on offline/network failure
- [ ] React DevTools: Re-renders are minimal

---

## Rollback Plan (If Backend Not Ready)

If `/api/v1/batch` isn't ready, fall back to individual hooks:

```typescript
// In useHomeBatchData.ts
export function useHomeBatchData() {
  // FALLBACK: Use individual hooks until /api/v1/batch exists
  const home = useHome();
  const medicines = useFeaturedMedicines();
  const categories = useFeaturedSubcategories();
  const addresses = useAddress();
  const orders = useFrequentlyOrdered({ limit: 5 });

  return {
    appContent: home.appContent,
    families: home.families,
    // ... map other fields
    isLoading: home.isLoading || medicines.isLoading || ...,
    error: home.error || medicines.error || ...,
  };
}
```

This way, the UI code stays the same - just the data fetching method changes.

---

## Success Criteria

✅ Task 2 complete when:
1. All 3 batch hooks created
2. All 3 screens updated
3. Network shows 1 batch call per screen
4. Data displays correctly
5. No TypeScript errors
6. All tests pass
7. Performance improved by 68%

**Time**: 1.5 hours (frontend) + 2-3 hours (backend)
**Impact**: 50-70% fewer API calls ⚡
**Status**: Ready to implement

---

## Next Steps

1. **Backend team**: Implement `/api/v1/batch` endpoint
2. **Frontend team**: Create 3 batch hooks using this template
3. **Test together**: Verify batching works end-to-end
4. **Monitor**: Check network calls in production

**Task 2 Target**: This week
**Expected Launch**: 68% faster screens ⚡
