# Offline Architecture & Network Resilience 📴

This document details the 6-layer offline handling architecture, error categorization, user feedback policies, and local sync mechanics in **CareSure Customer**.

---

## 1. The 6-Layer Offline Architecture

CareSure structures offline handling across six strict layers so feature developers only ever interact with the top two:

| Layer | Primary Files | Responsibility |
|---|---|---|
| **1. Transport** | `src/api/client.ts` | Rejects network requests before they hang or time out when the device is known to be offline. |
| **2. Error Model** | `src/api/errors.ts` | Normalizes all failures into an `AppError` with a distinct `kind`. |
| **3. Status** | `src/store/useNetworkStore.ts`, `src/utils/network.ts` | NetInfo is the single source of truth for reachability. |
| **4. Read Access**| `src/utils/offline/networkState.ts`, `src/hooks/useNetworkStatus.ts` | Predicate functions for callbacks and selector hooks for UI components. |
| **5. Policy** | `src/utils/offline/networkFeedback.ts`, `messages.ts` | The only place that decides whether to show a banner, toast, or modal. |
| **6. Action** | `src/utils/offline/requireInternet.ts`, `src/hooks/useOnlineAction.ts` | The public entry points screens call to guard buttons or async operations. |

---

## 2. Feedback Policy: "One Signal Per Event"

To avoid visual noise and stacked toasts, CareSure enforces an explicit feedback hierarchy:

1. **Global Banner (`NetworkToast.tsx`)**:
   - Mounted once in `app/_layout.tsx`.
   - Anchored to the bottom of the screen.
   - Shows whenever `isOffline() === true`: *"No internet connection. Please check your network and try again."*
2. **Everyday Actions (Search, Cart Stepper, Wishlist)**:
   - Guarded by `if (!requireInternet()) return;`.
   - Action simply aborts. No extra popup or toast is rendered because the global banner is already informing the user.
3. **Critical Financial / Upload Actions (Placing Orders, Uploading Prescriptions)**:
   - Guarded by `if (!requireInternet({ critical: true })) return;`.
   - Displays a blocking modal dialog requiring the user to acknowledge that their payment or order cannot be completed offline.
4. **Duplicate Message Throttling**:
   - Rapidly tapping buttons offline collapses repeated error messages inside a 2.5-second window to prevent toast spam.

---

## 3. Error Kinds & Retry Policies (`src/api/errors.ts`)

Every network error is categorized into one of the following kinds:
- `offline`: Never left the device (zero retries).
- `network`: DNS resolution failure or network dropped mid-flight.
- `timeout`: Server did not respond within request timeout.
- `unauthorized`: HTTP 401 (triggers logout / session refresh, zero retries).
- `forbidden`: HTTP 403 (insufficient permissions, zero retries).
- `not_found`: HTTP 404 (zero retries).
- `validation`: HTTP 422 (form validation errors, zero retries).
- `server`: HTTP 5xx (transient backend failure, eligible for React Query retry).

---

## 4. Local SQLite Cache Fallback

Static queries (such as settings, categories, and recent medicine searches) utilize `withSqliteCache` (`src/lib/sqlite/cache.ts`). If a query fails due to network outage, the cached SQLite record is served transparently, keeping the catalog browsable even without cellular signal.
