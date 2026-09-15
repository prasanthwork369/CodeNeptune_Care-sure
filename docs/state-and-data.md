# State Management & Data Layer Guide 🗄️

This document details client state management with **Zustand**, server state caching with **React Query**, local persistence with **SQLite & AsyncStorage**, and data ownership policies in **CareSure Customer**.

---

## 1. State Categorization & Decision Rules

CareSure divides state into three distinct buckets:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Server State (React Query)                               │
│ - Owned by the backend                                      │
│ - Products, categories, orders, coupons, settings           │
│ - Handles caching, deduplication, polling, refetching       │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
┌──────────────────────────────┴──────────────────────────────┐
│ 2. Global Client State (Zustand)                            │
│ - Owned by the mobile app across multiple screens           │
│ - Auth token, local cart, draft prescription, active GPS    │
│ - Persisted across app restarts when necessary              │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │
┌──────────────────────────────┴──────────────────────────────┐
│ 3. Ephemeral Local UI State (useState / useReducer)         │
│ - Owned by a single component                               │
│ - Modal visibility, form input focus, accordion expanded    │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Zustand Stores Inventory (18 Stores)

| Store | File Location | Persistence | Purpose & Owned Data |
|---|---|---|---|
| **`authStore`** | `src/store/authStore.ts` | SecureStore / AsyncStorage | User authentication status, user profile (`IUser`), access token. |
| **`cartStore`** | `src/store/cartStore.ts` | AsyncStorage | Cart items list, item quantities, applied coupon code, subtotal count. |
| **`checkoutStore`** | `src/store/checkoutStore.ts` | Memory | Active checkout state: selected address, payment method, frozen billing breakdown. |
| **`checkoutDraftStore`** | `src/store/checkoutDraftStore.ts` | AsyncStorage | Draft patient notes, delivery instructions, checkout preferences. |
| **`couponStore`** | `src/store/couponStore.ts` | Memory | Applied coupon details, eligibility state, savings value. |
| **`prescriptionDraftStore`**| `src/store/prescriptionDraftStore.ts` | AsyncStorage | Scanned pages/images, prescription title, selected patient ID, delivery option. |
| **`prescriptionOrderStore`**| `src/store/prescriptionOrderStore.ts` | Memory | Active order flow initiated directly from prescription review. |
| **`returnDraftStore`** | `src/store/returnDraftStore.ts` | Memory | Return items selection, return reason, proof image attachments. |
| **`locationStore`** | `src/store/locationStore.ts` | AsyncStorage | Active delivery address, GPS coordinates, detected pincode, serviceability flag. |
| **`useNetworkStore`** | `src/store/useNetworkStore.ts` | Memory | Network state: `isConnected`, `isInternetReachable`, connection type (`wifi`/`cellular`). |
| **`notificationStore`**| `src/store/notificationStore.ts` | AsyncStorage | List of in-app notification records, unread badge counter. |
| **`notificationNavigationStore`**| `src/store/notificationNavigationStore.ts` | Memory | Deep-link path queued from a notification tap received while the app was booting. |
| **`feedScrolling`** | `src/store/feedScrolling.ts` | Memory | Scroll velocity & Y-offset for collapsing header animations on the Home feed. |
| **`lastRouteStore`** | `src/store/lastRouteStore.ts` | AsyncStorage | Last active screen URL & query params for cold-boot state restoration. |
| **`tabBarVisibility`** | `src/store/tabBarVisibility.ts` | Memory | Controls visibility of the bottom tab navigator on child screens. |
| **`useTabBarStore`** | `src/store/useTabBarStore.ts` | Memory | Active bottom tab index and badge states. |
| **`toastStore`** | `src/store/toastStore.ts` | Memory | Global floating toast message queue (`showToast`). |
| **`uiStore`** | `src/store/uiStore.ts` | Memory | Global alert dialogs (`showAlert`), confirmation prompts, global loading spinners. |

---

## 3. Server State & React Query (`src/lib/react-query`)

CareSure configures `@tanstack/react-query` via `src/lib/react-query/queryClient.ts`:

- **Stale Time**: Defaults to 30 seconds for product lists and category directories.
- **Garbage Collection Time (`gcTime`)**: 10 minutes. Unused cache entries remain in memory for instant back-navigation.
- **Retry Policy**: 
  - Retries up to 2 times for transient network failures.
  - **Zero retries** for HTTP 400, 401, 403, 404, 422, or offline aborts.
- **Centralized Query Keys (`queryKeys.ts`)**:
  ```typescript
  export const queryKeys = {
    settings: () => ["settings"] as const,
    cart: () => ["cart"] as const,
    products: (filters: Record<string, unknown>) => ["products", filters] as const,
    product: (id: string) => ["product", id] as const,
    prescriptions: () => ["prescriptions"] as const,
    orders: () => ["orders"] as const,
    order: (id: string) => ["order", id] as const,
    addresses: () => ["addresses"] as const,
  };
  ```

---

## 4. SQLite Local Cache Layer (`src/lib/sqlite`)

For instant load times and offline catalog browsing, CareSure incorporates an embedded SQLite database (`caresure.db`):

### Database Schema (`src/lib/sqlite/db.ts`)
```sql
CREATE TABLE IF NOT EXISTS api_cache (
  key TEXT PRIMARY KEY NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_metadata (
  component_name TEXT PRIMARY KEY NOT NULL,
  last_sync_time TEXT NOT NULL
);
```

### Cache Utilities (`src/lib/sqlite/cache.ts`)
- **`withSqliteCache(key, fetcher)`**: Higher-order function that wraps a network call. On success, it persists data to SQLite asynchronously via `setTimeout(..., 0)`. On failure, it serves the cached SQLite data.
- **`useCachedSeed<T>(key)`**: Reads initial data from SQLite synchronously on mount so React Query renders cached data instantly before background network refetching completes.
- **`apiCache.clear()`**: Clears the entire database on user logout to prevent account data leakage.
