# Junior Developer Knowledge Transfer (KT) Guide 📘

Welcome to **CareSure Customer**! This guide is created to help you understand the architecture, codebase conventions, business workflows, and daily development routines step-by-step without having to constantly interrupt senior teammates.

---

## 1. CareSure Basics

### What is CareSure Customer?
CareSure Customer is a production-grade online pharmacy mobile application built using **React Native** and **Expo**. It allows patients and retail consumers to:
- Browse medicines by therapeutic category, manufacturer, and dosage form.
- Search for medicines and over-the-counter (OTC) wellness products.
- Discover affordable generic substitutes for expensive branded medicines.
- Upload and scan physical doctor prescriptions directly with their phone camera.
- Place delivery orders to their home address, apply promotional coupons, and redeem CareSure Coins (loyalty credits).
- Track order fulfillment and delivery live.

### Main User Journey
```text
App Launch
   ↓
Detect Location & Pincode Serviceability
   ↓
Browse / Search Medicines OR Upload Doctor Prescription
   ↓
Add Items to Cart (Validate Prescription Requirements & Stock)
   ↓
Apply Coupon / Redeem CareSure Coins
   ↓
Select / Add Delivery Address
   ↓
Checkout & Order Placement (COD / Online Payment)
   ↓
Live Order Tracking & Status Updates
```

---

## 2. Project Structure Explained

The project is structured with a clear separation between **routing**, **reusable UI**, **feature packages**, and **infrastructure**:

```text
Care-sure_Customer/
├── app/                  # ROUTING ONLY (Expo Router file-based routes)
├── src/                  # CORE APPLICATION SOURCE
│   ├── api/              # Raw HTTP API requests & error models (Axios)
│   ├── components/       # Reusable UI components grouped strictly BY FEATURE
│   ├── constants/        # Centralized images, icons, status codes, colors
│   ├── features/         # Self-contained business feature modules
│   ├── hooks/            # Feature queries, mutations, and UI hooks
│   ├── lib/              # Infrastructure (React Query client, SQLite, Storage)
│   ├── modules/          # TypeScript bridge wrappers for native Expo modules
│   ├── services/         # Business logic sitting above api/ (Sync, Analytics, FCM)
│   ├── store/            # Global client state (Zustand stores)
│   ├── theme/            # Colors, spacing, typography tokens, transitions
│   ├── types/            # Shared TypeScript type definitions
│   └── utils/            # Pure helpers & offline-handling utilities
├── modules/              # Custom local Android Expo Modules (Kotlin code)
├── plugins/              # Expo Config Plugins modifying Android prebuild configs
├── scripts/              # Helper scripts (e.g. optimize-assets.js)
├── .maestro/             # E2E UI automation smoke test flows
└── docs/                 # Developer manuals and architecture documents
```

### What belongs where?
- **`app/`**: ONLY file-based route definitions and layouts. Do **not** put heavy styling, complex business logic, or large state stores inside `app/`. Screens should simply import feature components from `src/` and wire them up.
- **`src/components/<feature>/`**: UI components grouped by domain feature (e.g. `src/components/cart/CartItemCard.tsx`), **not** grouped by arbitrary UI type like `buttons/` or `modals/`.
- **`src/features/<feature>/`**: Heavy feature logic, screen layouts, hooks, and local types (e.g. `src/features/prescription/`, `src/features/cart/`).
- **`src/api/` vs `src/services/`**:
  - `src/api/`: Pure Axios HTTP network calls and raw request/response types. Nothing else.
  - `src/services/`: Used **only** when extra business logic sits on top of raw API calls (e.g. response reshaping, multi-call aggregation, or offline sync).
- **`modules/`**: Native Kotlin modules with `expo-module.config.json` bridging Android platform APIs (e.g. In-App Updates, SMS OTP hint).
- **`plugins/`**: JavaScript build plugins invoked during `npx expo prebuild` to configure Gradle, Android permissions, ProGuard, etc.

---

## 3. Application Startup Lifecycle

When the user taps the CareSure icon on their device, the app initializes in this exact sequence:

```text
               User Taps App Icon
                       ↓
                   index.js
  (Registers headless background handlers for Firebase FCM
   and Notifee BEFORE Expo Router mounts)
                       ↓
                  Expo Router
                       ↓
               app/_layout.tsx
  (Mounts foundational providers & background services:
   1. initDb() -> SQLite database initialization
   2. initCrashReporting() -> Firebase Crashlytics
   3. SafeAreaProvider & KeyboardProvider
   4. GestureHandlerRootView
   5. QueryClientProvider (React Query cache)
   6. BottomSheetModalProvider)
                       ↓
                    AppGate
  (Evaluates app blocking conditions:
   - Is app in Maintenance Mode? -> AppGateScreen
   - Is app below minSupportedVersion? -> Immediate Play Store Update
   - Is a soft update available? -> SoftUpdateModal banner)
                       ↓
               Global Subsystems
  (CartSyncProvider: WebSocket live cart sync
   PushNotificationProvider: FCM token registration & listener
   NetworkToast: Real-time network reachability banner)
                       ↓
               Authentication Check
  (authStore reads stored token from SecureStore / AsyncStorage)
                       ↓
           Main Navigation Screen ((tabs)/index)
```

---

## 4. Navigation & Routing

CareSure uses **Expo Router** (file-based routing similar to Next.js).

### Route Groups
Folder names enclosed in parentheses `(name)` are **route groups**. They organize routes logically without altering the URL path:
- `app/(auth)/`: Login, OTP verification screens.
- `app/(tabs)/`: Main bottom tab bar (Home, Categories, Prescription Upload, Profile).
- `app/(commerce)/`: Shopping cart, coupons screen, order success screen.
- `app/(prescription)/`: Patient selection, prescription preview, medicine comparison.
- `app/(catalog)/`: Catalog and category listing screens.

### Dynamic & Standalone Routes
- `app/product/[id].tsx`: Dynamic medicine product details page (e.g. `/product/64f123abc`).
- `app/category/[id].tsx`: Dynamic category products page.
- `app/search/index.tsx`: Full-screen search with debounce and history.

### Deep Linking & URL Rewriting (`app/+native-intent.ts`)
When a user clicks a marketing link or web URL like `https://caresure.com/medicines/paracetamol/64b123`, `+native-intent.ts` automatically intercepts it and rewrites the incoming URL to the mobile app route `/product/64b123`.

---

## 5. State Management Made Simple

CareSure uses **Zustand** for global client state.

### The Decision Rule: Where should state live?
1. **React Query**: For any data that comes from the backend server (e.g. products list, order history, active banners).
2. **Local State (`useState`)**: For temporary UI state used only inside one component (e.g. accordion open/closed, text input focus, modal visibility).
3. **Zustand Store**: For client state that must be shared across multiple screens or persisted between app launches.

### Core Zustand Stores & Ownership

| Store Name | File Location | What Data It Owns |
|---|---|---|
| `authStore` | `src/store/authStore.ts` | Logged-in user profile, JWT access token, login status. |
| `cartStore` | `src/store/cartStore.ts` | Local cart items, quantity counter, applied coupon code. |
| `checkoutStore` | `src/store/checkoutStore.ts` | Selected delivery address, payment method, frozen bill breakdown. |
| `prescriptionDraftStore` | `src/store/prescriptionDraftStore.ts` | Selected prescription images, draft notes, selected patient ID. |
| `locationStore` | `src/store/locationStore.ts` | User's active GPS coordinates, selected address, detected pincode. |
| `useNetworkStore` | `src/store/useNetworkStore.ts` | Device internet reachability (connected, disconnected, low network). |
| `uiStore` | `src/store/uiStore.ts` | Global alerts, confirmation modals, UI flags. |
| `lastRouteStore` | `src/store/lastRouteStore.ts` | Last active screen path (used to restore navigation state after cold boot). |

---

## 6. API & Backend Communication

Every network interaction follows this strict uni-directional flow:

```text
[Screen Component]
       ↓ calls
[Feature Hook] (e.g. useCart, useProduct)
       ↓ calls
[React Query / Mutation]
       ↓ invokes
[API File] (e.g. src/api/cart.api.ts)
       ↓ uses
[apiClient (Axios)] (src/api/client.ts)
  - Injects Bearer token from secure storage
  - Checks if device is online before sending
       ↓ HTTP Request
[CareSure Backend Server]
       ↓ HTTP Response
[Error Interceptor / Normalizer] (src/api/errors.ts)
  - Transforms any HTTP 4xx/5xx into a typed AppError
  - If 401 Unauthorized -> triggers session expiry handler
       ↓
[React Query Cache / Zustand Store]
       ↓ Re-renders
[Screen UI Updates]
```

### Key API Rules:
1. **Never make raw `fetch()` or raw `axios()` calls inside components.** Always use or create a function in `src/api/<resource>.api.ts`.
2. **Never expose API keys or secrets in client code.**
3. **401 Handling**: When an access token expires, `src/api/client.ts` intercepts the response, attempts refresh or clears session data, and redirects the user to login.

---

## 7. Important Business Flows Walkthrough

### 1. Login & OTP Flow
1. User enters 10-digit phone number on `app/(auth)/login.tsx`.
2. The `PhoneNumberHint` native Android module offers a Google Play autofill popup for the user's SIM number.
3. User submits number -> backend generates OTP.
4. User lands on `app/(auth)/verify-otp.tsx`.
5. The `react-native-otp-verify` native module automatically reads incoming SMS messages and populates the 6-digit OTP fields.
6. On verification success: JWT token is saved via `src/lib/storage.ts`, user profile is saved to `authStore`, and any items in the guest cart are merged into the user's account.

### 2. Product Browsing & Add to Cart
1. User views product on `app/product/[id].tsx`.
2. Screen queries product details via `useProduct(id)`.
3. If the product requires a prescription (`requiresPrescription: true`), an orange prescription-required badge is displayed.
4. User taps **Add to Cart** -> calls `useCart().addItem(product)`.
5. `cartStore` updates item quantity optimistically, and background sync notifies the backend.

### 3. Prescription Upload Flow
1. User navigates to `app/(prescription)/choose-method.tsx`.
2. User chooses **Scan Document** (triggers `react-native-document-scanner-plugin` with edge detection) OR **Choose from Gallery**.
3. Scanned pages are saved as temporary image URIs into `prescriptionDraftStore`.
4. User confirms patient on `app/(prescription)/select-patient.tsx`.
5. User previews pages on `app/(prescription)/preview.tsx` (supports zoom, reorder, PDF generation).
6. Upload submission pushes images via multipart form data to `/api/v1/prescriptions`.

### 4. Checkout & Order Flow
1. User reviews cart in `app/(commerce)/cart.tsx`.
2. Subtotal, delivery fee, handling fee, coupon discount, and CareSure Coins deduction are calculated live via `useBillingCalculations()`.
3. User taps **Proceed to Checkout** -> navigates to checkout screen.
4. Billing summary freezes in `checkoutStore` to prevent price changes mid-payment.
5. User selects delivery address (`locationStore`) and payment option (Cash on Delivery or Online Payment).
6. Order placed -> User lands on `app/(commerce)/order-success.tsx` with animated confetti and order tracking link.

---

## 8. Offline & Caching Architecture

CareSure is built to handle poor cellular reception in rural and semi-urban environments gracefully:

- **NetInfo Listener (`src/utils/network.ts`)**: Constantly monitors real network state.
- **Global Offline Banner (`NetworkToast.tsx`)**: Mounted once in `_layout.tsx`. Appears automatically at the bottom whenever connection is lost.
- **Proactive Offline Rejection (`src/utils/offline/requireInternet.ts`)**: Critical actions (like placing an order) check `requireInternet({ critical: true })` before sending an HTTP request, preventing hanging loaders.
- **SQLite Local Cache (`src/lib/sqlite/cache.ts`)**: Caches static catalog data and user preferences locally so browsing remains responsive with zero latency.
- **React Query Persistence**: Caches recent search queries and medicine details in memory with preconfigured `staleTime` and `gcTime`.

---

## 9. Push Notifications Architecture

CareSure uses a **dual-engine notification pipeline**:

1. **Firebase Cloud Messaging (`@react-native-firebase/messaging`)**: Receives remote push notifications from the server.
2. **Notifee (`@notifee/react-native`)**: Displays rich, interactive notification popups with buttons, image previews, and custom channels on Android.
3. **Headless Background Tasks**: Registered at the very top of `index.js` so that when an Android push arrives while the app is killed/closed, the device can show the notification without crashing.
4. **Deep-Link Navigation (`NotificationNavigation.ts`)**: When the user taps a notification (e.g. "Order Dispatched" or "20% Off Vitamins"), the app parses the payload and navigates directly to `/profile/orders/track?id=...` or `/product/[id]`.

---

## 10. How to Test Your Code

Always test your code before submitting a pull request!

```bash
# 1. Run all unit and component tests:
npm test

# 2. Run Jest in interactive watch mode (while editing code):
npm run test:watch

# 3. Generate a test code-coverage report:
npm run test:coverage

# 4. Check for code style & linting errors:
npm run lint

# 5. Check for TypeScript type errors (MANDATORY):
npx tsc --noEmit
```

### Understanding Our Testing Tools:
- **Jest & React Native Testing Library (RNTL)**: Used for unit testing hooks, stores, and UI component rendering. Mocks for native modules live in `jest.setup.ts`.
- **Maestro (`.maestro/`)**: Automated black-box UI testing tool. It tests complete user journeys like `smoke-login-cart.yaml` on real emulators without flaky JavaScript test harnesses.

---

## 11. Build & Release Basics

### Build Types Explained:
- **Development Build (`npm run android` / `npm run ios`)**: Runs local Metro bundler with debug symbols and developer tools attached.
- **Preview Build (`eas build --profile preview`)**: Creates an installable `.apk` file for Android that QA testers can install directly on physical phones without connecting to a computer.
- **Production Build (`eas build --profile production`)**: Generates an optimized, signed `.aab` (Android App Bundle) with R8/ProGuard code minification enabled, ready for the Google Play Store.

### Over-The-Air (OTA) Updates (`EAS Update`):
When you make JavaScript/TypeScript or styling changes that **do not modify native code**, you do not need to submit a new app version to the Google Play Store! You can publish an OTA update directly:
```bash
eas update --channel production --message "Fix coupon display discount rounding"
```
*Note: If you add or modify a native library, config plugin, or Android permission, you MUST make a full binary build because OTA updates cannot alter native Kotlin code.*

---

## 12. Recommended 14-Day Learning Roadmap

To master the CareSure codebase without feeling overwhelmed, follow this structured 14-day sequence:

- **Day 1: Project Setup & Structure** → Set up environment (`.env.local`), run `npm run android`, explore `package.json`, `app/`, and `src/`.
- **Day 2: Navigation & Routing** → Read `docs/navigation-and-routes.md`, explore `app/_layout.tsx` and route groups `(tabs)` and `(commerce)`.
- **Day 3: Styling & Design System** → Review `global.css`, `tailwind.config.js`, NativeWind rules in `CLAUDE.md`, and `src/constants/images.ts`.
- **Day 4: Authentication Flow** → Read `docs/features/auth-flow.md`, trace `app/(auth)/login.tsx` and `src/store/authStore.ts`.
- **Day 5: Home & Catalogue Browsing** → Explore `app/(tabs)/index.tsx`, category feed components, and `src/features/home/`.
- **Day 6: Product Details Screen** → Explore `app/product/[id].tsx`, generic substitute comparisons, and stock badges.
- **Day 7: Cart Architecture** → Read `docs/features/commerce-checkout.md`, trace `cartStore.ts` and `useCartSocketSync.ts`.
- **Day 8: Prescription Scanner** → Read `docs/features/prescription-flow.md`, inspect document scanner plugins and `prescriptionDraftStore.ts`.
- **Day 9: Checkout & Billing Engine** → Review `useBillingCalculations.ts`, `useDeliveryCharges.ts`, and `checkoutStore.ts`.
- **Day 10: Location & Addresses** → Read `docs/features/location-serviceability.md`, check `location.service.ts` and pincode checking.
- **Day 11: API Layer & React Query** → Inspect `src/api/client.ts`, `src/lib/react-query/queryClient.ts`, and `src/api/errors.ts`.
- **Day 12: Offline Handling & SQLite** → Read `docs/infrastructure/offline-and-sync.md`, test turning Wi-Fi off and checking `NetworkToast`.
- **Day 13: Push Notifications & Native Modules** → Read `docs/infrastructure/notifications.md` and `docs/infrastructure/local-modules-and-plugins.md`.
- **Day 14: Testing & Release Readiness** → Run Jest test suite (`npm test`), inspect `.maestro/` flows, and review `docs/release-and-deployment.md`.

---

## 13. Junior Developer Golden Rules 🛡️

1. **Understand Before Modifying**: Never edit a shared store, utility, or component until you have searched the codebase for all places where it is used.
2. **Search Before Creating**: Always search `src/components/` and `src/utils/` first. 80% of common UI elements (buttons, badges, spinners, formatters) already exist.
3. **Never Duplicate State**: Server data belongs in React Query. Client-only global data belongs in Zustand. Do not copy React Query data into Zustand stores unless caching a draft.
4. **Follow NativeWind Rules**: Use Tailwind `className` utility classes. Only use `StyleSheet.create` for the explicit exceptions listed in `CLAUDE.md` (e.g. dynamic animation values, SafeAreaView).
5. **Always Centralize Images**: Never write `require('../../../assets/image.png')` inside a component. Import it through `src/constants/images.ts`.
6. **Do Not Touch Generated `android/` Folder**: The `android/` folder is gitignored and regenerated on every `npx expo prebuild`. Any native tweaks must go into `plugins/` or `modules/`.
7. **Test Affected Flows**: After making a change, always run `npx tsc --noEmit` and manually verify the entire user flow on an emulator.

---

## 14. KT Verification Checklist

Use this checklist during your 1-on-1 handoff with your senior engineer or mentor:

- [ ] Local environment successfully running (`npm run android` boots to home screen)
- [ ] Able to run `npx tsc --noEmit` and `npm test` with 0 errors
- [ ] Explained how `app/_layout.tsx` initializes SQLite and Crashlytics
- [ ] Explained how `index.js` handles background push notifications
- [ ] Walked through Login -> OTP verification -> Auth store flow
- [ ] Demonstrated adding an item to the cart and explained `useCartSocketSync`
- [ ] Demonstrated uploading a prescription via scanner or gallery
- [ ] Explained how `useBillingCalculations` computes taxes, delivery fees, and CareSure Coins
- [ ] Triggered the offline banner by turning off network connectivity
- [ ] Located all 4 local native modules in `/modules/` and understood their purpose
- [ ] Ready to pick up first junior feature ticket or bug fix!
