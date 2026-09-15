# Navigation & Routing Guide 🗺️

CareSure Customer uses **Expo Router** with file-based routing and TypeScript typed routes enabled.

---

## 1. Route Map & Directory Structure

All routes live inside the root `app/` folder. Screens in `app/` are lightweight entry points that import components from `src/features/`.

```text
app/
├── _layout.tsx                     # Root Provider Stack & AppGate
├── index.tsx                       # Initial redirect gate (Splash -> Tabs / Onboarding)
├── +native-intent.ts               # Deep link URL normalizer & rewrite engine
├── +not-found.tsx                  # 404 fallback screen
│
├── (tabs)/                         # Bottom Tab Navigator
│   ├── _layout.tsx                 # Tab bar UI & iconography
│   ├── index.tsx                   # Home feed (Promotions, Categories, Featured)
│   ├── categories.tsx              # Full Category directory
│   ├── upload.tsx                  # Quick prescription upload action tab
│   └── profile.tsx                 # Account overview tab
│
├── (auth)/                         # Authentication Route Group
│   ├── _layout.tsx
│   ├── login.tsx                   # Phone number entry screen
│   ├── verify-otp.tsx              # 6-digit OTP verification screen
│   └── welcome.tsx                 # Post-signup welcome screen
│
├── (commerce)/                     # Commerce & Checkout Flow
│   ├── _layout.tsx
│   ├── cart.tsx                    # Full cart screen (items, bill, coupons)
│   ├── coupons.tsx                 # Coupon selection modal
│   └── order-success.tsx           # Order placement success screen with confetti
│
├── (prescription)/                 # Prescription Management Flow
│   ├── _layout.tsx
│   ├── choose-method.tsx           # Camera / Gallery / Edge-detection scanner
│   ├── select-patient.tsx          # Patient selection modal
│   ├── preview.tsx                 # Prescription multi-page preview & reorder
│   ├── medicine-comparison.tsx     # Generic substitutes & comparisons
│   ├── payment.tsx                 # Prescription checkout & payment
│   ├── prescription-viewer.tsx     # Full-screen PDF/image prescription viewer
│   └── prescription-history.tsx    # List of previously uploaded prescriptions
│
├── product/                        # Product Catalogue
│   ├── _layout.tsx
│   ├── [id].tsx                    # Dynamic medicine details screen
│   └── image-viewer.tsx            # Full-screen pinch-to-zoom product gallery
│
├── category/                       # Category Views
│   └── [id].tsx                    # Filtered category product listing
│
├── search/                         # Global Search Flow
│   ├── _layout.tsx
│   ├── index.tsx                   # Instant search with debounce and history
│   └── product/
│       └── [id].tsx                # Product detail accessed from search results
│
├── notifications/                  # User Notifications
│   ├── _layout.tsx
│   └── index.tsx                   # In-app notification center
│
└── profile/                        # User Account Sub-Routes
    ├── _layout.tsx
    ├── index.tsx                   # Main profile menu
    ├── my-profile.tsx              # Edit name, email, avatar
    ├── delete-account.tsx          # Account deletion confirmation
    ├── addresses/                  # Saved delivery addresses
    ├── orders/                     # Order history, index.tsx & track.tsx (?id=...)
    ├── patients/                   # Family members / patient profiles
    ├── wallet/                     # CareSure Coins & transaction log
    └── support/                    # Help center, FAQs, customer support
```

---

## 2. Deep Linking & App Links

### Supported URL Schemes & Domains
1. **Custom Scheme**: `caresure://` (e.g. `caresure://product/123`)
2. **Android App Links / iOS Universal Links**:
   - QA: `https://qa-caresure.codeneptune.com`
   - Production: `https://caresure.com`

### Dynamic Deep Link Normalization (`app/+native-intent.ts`)
The web store and marketing links often use descriptive SEO slugs such as:
`https://caresure.com/medicines/paracetamol-500mg/64b123`

The mobile app's native route is `/product/64b123`. `+native-intent.ts` intercepts all incoming system URLs and translates them automatically:

```typescript
// app/+native-intent.ts
const PRODUCT_TYPE_SLUGS = ["medicines", "otc", "fmcg"];

export function redirectSystemPath({ path }: { path: string | null; initial: boolean }): string {
  if (!path) return path ?? "/";
  try {
    let pathname = path;
    const schemeMatch = path.match(/^[a-z][a-z0-9+.-]*:\/\/[^/]*(\/.*)$/i);
    if (schemeMatch) pathname = schemeMatch[1];

    // Maps /{productType}/{slug}/{id} -> /product/{id}
    const m = pathname.match(/^\/([^/]+)\/([^/]+)\/([^/?#]+)(?:[/?#].*)?$/);
    if (m && PRODUCT_TYPE_SLUGS.includes(m[1].toLowerCase())) {
      const id = decodeURIComponent(m[3]);
      return `/product/${encodeURIComponent(id)}`;
    }
  } catch {
    // Fallback on parsing failure
  }
  return path;
}
```

---

## 3. Navigation State Restoration (`lastRouteStore`)

To prevent users from losing their context when the Android OS kills the app in the background, `lastRouteStore` preserves the active screen route:

- **Tracked Routes**: Dynamic product views (`/product/[id]`), cart (`/cart`), categories, search.
- **Excluded Routes**: Ephemeral screens like OTP verification, order success, or modals are marked unsafe via `isSafeRoute()`.
- **Cold Boot Recovery**: If an app is launched within 30 minutes of being closed, the router can restore the user directly to the screen they were previously viewing.

---

## 4. Navigation Best Practices

1. **Use Expo Router's `router.push()` or `router.replace()`**:
   ```typescript
   import { router } from "expo-router";

   // Navigate to product:
   router.push(`/product/${productId}`);

   // Replace after authentication:
   router.replace("/(tabs)");
   ```
2. **Never hardcode relative file paths in navigation**: Always use route URLs (e.g. `/(commerce)/cart`, not `../../cart`).
3. **Pass only IDs through route parameters**: Pass resource identifiers in URL search params or dynamic routes. Heavy objects (e.g. the entire product object or cart array) must come from stores or React Query caches to prevent serialization lag.
