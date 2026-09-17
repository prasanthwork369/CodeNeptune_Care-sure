# Pending Integration Tasks (7-10 Hours)

## Status: Ready to Implement

All infrastructure is built. These 4 tasks complete the optimization:

---

## ✅ Task 1: Update Components to Use Selectors (2-3 hours)

**Goal**: Convert components from full store access to selectors
**Impact**: 80-90% fewer re-renders

### Components to Update (Priority Order)

#### 1. **Cart Badge** (Highest Traffic)
**File**: `src/features/cart/components/CartItemCounter.tsx`
**Current Status**: ✅ Already using selectors correctly!

```typescript
// ✓ GOOD - already optimized
const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
const setCartPending = useCartPendingStore((s) => s.setPending);
```

#### 2. **Home Screen Navigation**
**File**: `src/features/home/screens/HomeLayout.tsx`
**Action**: Check if using full stores anywhere, convert to selectors

```typescript
// BEFORE: Full store
const location = useLocationStore(); // Uses all fields

// AFTER: Selector
import { selectSelectedAddress } from '@/src/store/selectors';
const address = useLocationStore(selectSelectedAddress); // Only address
```

#### 3. **Profile Header**
**File**: Find with: `grep -r "ProfileHeader\|profile.*header" src --include="*.tsx"`
**Action**: Update to use `selectUser` selector

```typescript
// BEFORE
const auth = useAuthStore();
return <Text>{auth.user?.name}</Text>;

// AFTER
import { selectUser } from '@/src/store/selectors';
const user = useAuthStore(selectUser);
return <Text>{user?.name}</Text>;
```

#### 4. **Tab Bar / Navigation**
**File**: Find with: `grep -r "TabBar\|Navigation" src/components --include="*.tsx"`
**Action**: Update UI state with selectors

```typescript
// BEFORE
const ui = useUIStore();
const isVisible = ui.showTabBar;

// AFTER
import { selectIsModalOpen } from '@/src/store/selectors';
const isVisible = useUIStore((s) => !s.modals.cartOpen);
```

### How to Check If Already Optimized

```bash
# Search for components using full store without selectors
grep -r "useCartPendingStore()" src --include="*.tsx" | grep -v "const.*selectCart"
grep -r "useAuthStore()" src --include="*.tsx" | grep -v "const.*select"
grep -r "useCheckoutStore()" src --include="*.tsx" | grep -v "const.*select"
```

**Current Status**: Components appear already optimized! ✅

---

## ✅ Task 2: Integrate Request Batching in Key Screens (3-4 hours)

**Goal**: Use `batchFetch` or `useBatchData` to combine API calls
**Impact**: 50-70% fewer API calls

### Screens to Update (Priority Order)

#### 1. **Home Screen**
**File**: `src/features/home/screens/HomeLayout.tsx`
**Current Hooks**: `useHomeData`, `useSettings`, `useCartRead`, `useDeliveryAddress`

**Implementation**:
```typescript
import { useBatchData } from '@/src/hooks/queries/useBatchData';

// BEFORE: Multiple separate queries
const homeData = useHomeData();
const settings = useSettings();
const cartData = useCartRead();
const address = useDeliveryAddress();

// AFTER: One batched query
const batchData = useBatchData({
  queries: ['home', 'settings', 'cart', 'addresses'],
  staleTime: 5 * 60_000,
});

const { home, settings, cart, addresses } = batchData.data || {};
```

**Expected**: 4 API calls → 1 request

#### 2. **Checkout Screen**
**File**: Find with: `grep -r "checkout.*screen" src --include="*.tsx"`
**Current Hooks**: Cart, addresses, wallet, coupons

**Implementation**:
```typescript
import { useBatchData } from '@/src/hooks/queries/useBatchData';

const checkoutData = useBatchData({
  queries: ['cart', 'addresses', 'wallet', 'coupons'],
});
```

**Expected**: 4 API calls → 1 request

#### 3. **Profile Screen**
**File**: Find with: `grep -r "profile.*screen\|MyProfile" src --include="*.tsx"`
**Current Hooks**: User profile, addresses, orders, wallet

**Implementation**:
```typescript
const profileData = useBatchData({
  queries: ['profile', 'addresses', 'orders', 'wallet'],
});
```

**Expected**: 4 API calls → 1 request

#### 4. **Prescription Upload Screen**
**File**: Find with: `grep -r "prescription.*upload" src --include="*.tsx"`
**Action**: Batch load user + prescriptions

```typescript
const prescriptionData = useBatchData({
  queries: ['profile', 'prescriptions', 'medicines'],
});
```

### Backend Requirement
⚠️ **Note**: Requires `/api/v1/batch` endpoint on backend
- Takes: `{ queries: ['profile', 'cart', 'orders'] }`
- Returns: `{ profile: {...}, cart: {...}, orders: {...} }`

---

## ✅ Task 3: Convert PNG Files to WebP (1-2 hours)

**Goal**: Convert remaining PNG images to WebP format
**Impact**: 60% smaller images

### PNG Files to Convert

```
❌ assets/images/auth/medicine-4.png          (156KB)
❌ assets/images/icons/update-bell.png        (42KB)
❌ assets/icons/wallet-outline-purple.png     (28KB)
❌ assets/icons/pill-pink.png                 (18KB)
❌ assets/icons/gift-outline-blue.png         (22KB)
❌ assets/images/splash-icon.png              (85KB)
❌ assets/images/orders/corporate-order-badge.png (12KB)

TOTAL: ~363KB → ~110KB after conversion (70% reduction)
```

### Conversion Steps

**Step 1: Install ImageMagick**
```bash
# macOS
brew install imagemagick

# Windows: Download from https://imagemagick.org/download/binaries/
# Ubuntu
sudo apt-get install imagemagick
```

**Step 2: Convert Each File**
```bash
cd assets/images/

# Convert PNG to WebP
magick convert auth/medicine-4.png auth/medicine-4.webp
magick convert icons/update-bell.png icons/update-bell.webp
magick convert icons/wallet-outline-purple.png icons/wallet-outline-purple.webp
magick convert icons/pill-pink.png icons/pill-pink.webp
magick convert icons/gift-outline-blue.png icons/gift-outline-blue.webp
magick convert splash-icon.png splash-icon.webp
magick convert orders/corporate-order-badge.png orders/corporate-order-badge.webp
```

**Step 3: Update src/constants/images.ts**
```typescript
// BEFORE
medicine4: require("../../assets/images/auth/medicine-4.png"),
updateBell: require("../../assets/images/icons/update-bell.png"),

// AFTER
medicine4: require("../../assets/images/auth/medicine-4.webp"),
updateBell: require("../../assets/images/icons/update-bell.webp"),
```

**Step 4: Remove Old PNG Files**
```bash
rm assets/images/auth/medicine-4.png
rm assets/images/icons/update-bell.png
rm assets/images/icons/wallet-outline-purple.png
rm assets/images/icons/pill-pink.png
rm assets/images/icons/gift-outline-blue.png
rm assets/images/splash-icon.png
rm assets/images/orders/corporate-order-badge.png
```

**Step 5: Verify**
```bash
# Check bundle size before/after
npm run bundle:analyze
```

---

## ✅ Task 4: Measure Improvements (1 hour)

**Goal**: Verify performance gains with real metrics
**Impact**: Proof of optimization value

### Measurement Checklist

#### 1. **Bundle Size** (5 min)
```bash
npm run bundle:analyze
# Compare: 700KB (before) → 400KB (after) = -43%
```

#### 2. **App Startup Time** (10 min)
**iOS**: Xcode → Product → Scheme → Edit Scheme → Run → Options → Logging
**Android**: `logcat | grep "AppLaunch"`

Expected: 3.5s → 1.5s (-57%)

#### 3. **Re-renders** (15 min)
Open React DevTools Profiler:
1. Start recording
2. Add item to cart
3. Check re-renders count

Expected: 15-20 → 1-2 (-90%)

#### 4. **API Calls** (10 min)
Open Network Inspector:
1. Open Home screen
2. Count network requests

Expected: 5-10 → 1-2 (-80%)

#### 5. **Memory Usage** (10 min)
Open Android Studio Profiler:
1. Open app
2. Browse for 2 minutes
3. Check heap size

Expected: 300MB → 200MB (-33%)

#### 6. **Image Load Time** (5 min)
Network Throttling (Chrome DevTools):
1. Slow 3G
2. Load home screen with images

Expected: 2.5MB in 25s → 0.75MB in 7s

### Sample Measurement Report

```
METRIC              | BEFORE    | AFTER     | GAIN
────────────────────|-----------|-----------|───────
Bundle Size (gzip)  | 700KB     | 400KB     | -43% ✅
Startup Time        | 3.5s      | 1.5s      | -57% ✅
Re-renders/action   | 15-20     | 1-2       | -90% ✅
API calls/screen    | 5-10      | 1-2       | -80% ✅
Memory Usage        | 300MB     | 200MB     | -33% ✅
Image Load (2G)     | 25s       | 7s        | -72% ✅
────────────────────|-----------|-----------|───────
OVERALL             | Baseline  | OPTIMIZED | 3-5x ⚡
```

---

## 📋 Execution Plan

### Week 1: Selectors & Batching (5-6 hours)
- [ ] Audit components for selector usage
- [ ] Update Home screen with batching
- [ ] Update Checkout screen with batching
- [ ] Update Profile screen with batching
- [ ] Test each integration

### Week 2: Images & Measurement (2-4 hours)
- [ ] Convert 7 PNG files to WebP
- [ ] Update image constants
- [ ] Run bundle analysis
- [ ] Measure all 6 metrics
- [ ] Document results

### Week 3: Polish & Deploy
- [ ] Fix any issues
- [ ] A/B test with users
- [ ] Monitor performance in production
- [ ] Celebrate 3-5x faster app! 🎉

---

## Commands Reference

```bash
# Components using selectors (should be many)
grep -r "selectCart\|selectUser\|selectCheckout" src --include="*.tsx" | wc -l

# Components using full stores (should be few)
grep -r "useCartPendingStore()" src --include="*.tsx" | grep -v "selectCart" | wc -l

# Batch API test
npm run bundle:analyze

# Performance profile
# iOS: instruments -t "System Trace" -o output.trace
# Android: Android Studio Profiler

# Image conversion
find assets -name "*.png" | while read f; do magick convert "$f" "${f%.png}.webp"; done

# Measure startup (Android)
adb logcat | grep "AppLaunch"
```

---

## Success Criteria

✅ All tasks complete when:
1. Components using selectors where possible
2. Home/Checkout/Profile screens using batching
3. All PNG files converted to WebP
4. Measurements show 3-5x improvement
5. No regressions in functionality
6. Zero new bugs in Crashlytics

**Estimated Time**: 7-10 hours total
**Expected Impact**: 3-5x faster app ⚡
