# Unused Code Audit — Decision Log

**Audited:** 2026-09-18 · **Status:** nothing deleted, all files still in the tree.

19 files (2,060 lines) plus one duplicate function have **zero importers**. This
document exists so each one gets a deliberate decision instead of sitting in the
tree unread.

## How "unused" was verified

Two independent scans, both repo-wide:

1. **By path and by exported symbol** across `src/`, `__tests__/`, `index.js`,
   `package.json`, `app.config.ts`, `metro.config.js`, `jest.config.js`,
   `babel.config.js`, `eas.json`, `plugins/`, `modules/`, `android/app/src`.
2. **By git history** — `git log -S` for every import path, to catch modules that
   were wired up at some point and later unwired.

Barrel files were checked separately; none re-export any listed file.

Two files were **cleared** by this process and are correctly live:
`services/firebase/messaging/backgroundHandler.ts` and
`services/notifications/notifeeBackgroundHandler.ts` — both imported by the root
`index.js`, which a `src/`-only scan misses.

The production export is the tiebreaker: **4,056 modules with these files present
and 4,056 with them removed.** Metro never bundled any of it, so none of this
code affects app size or runtime today.

## Decision key

| Verdict | Meaning |
|---|---|
| **USE** | Fills a real gap. Worth wiring up. |
| **NARROW** | Works, but overlaps something live. Judgement call. |
| **DROP** | Duplicates a live implementation. No capability lost. |
| **IMPOSSIBLE** | Cannot work as designed on this stack, regardless of effort. |

---

## 1. `src/features/optimization/` — 580 lines, all created 2026-09-17

Not a business domain; it is infrastructure shaped as a feature. Never imported
by anything, including its own barrel's consumers.

| File | Lines | Verdict | Why |
|---|---|---|---|
| `utils/lazyLoad.tsx` | 82 | **IMPOSSIBLE** | React Native has no code splitting. Hermes emits a single `.hbc`; `import()` does not shrink the native bundle. The file's own docstring claims "Reduces initial bundle" — untrue on RN. |
| `utils/fontOptimization.ts` | 119 | **DROP** | Inter fonts are already embedded natively by the `expo-font` config plugin in `app.config.ts`. Nothing left to do at JS level. |
| `components/VirtualizedList.tsx` | 140 | **DROP** | `src/components/lists/AppFlashList.tsx` wraps `@shopify/flash-list` and has 6 consumers. FlashList outperforms FlatList-based virtualization. |
| `utils/memoryOptimization.ts` | 204 | **NARROW** | `useDebounced`, `useCleanup`, `BoundedCache` are reusable. But caching is already covered by React Query + `lib/sqlite/cache.ts`. `useDebounced` is the only piece with a clear gap; it uses `any` and would need typing. |
| `index.ts` | 35 | **DROP** | Barrel for the above. |

**Decision:** _pending_

---

## 2. `src/utils/` — 640 lines

| File | Lines | Created | Verdict | Why |
|---|---|---|---|---|
| `secureStorage.ts` | 129 | 2026-09-17 | **USE** (merge) | See §6 — real value, but adopting it naively logs out every user. |
| `abortController.ts` | 194 | 2026-09-17 | **DROP** | Its own comment says *"React Query handles this automatically!"*, and the app uses React Query throughout. Its `useFetch` calls `fetch()` directly, bypassing `apiClient`'s interceptors, auth, offline handling and retry — actively harmful if adopted. |
| `safeErrors.ts` | 157 | 2026-09-17 | **DROP** | `src/api/errors.ts` already does this with 13 consumers and is richer (`AppError`, typed kinds, `parseRetryAfter`). Also the source of 8 `no-explicit-any` lint warnings. |
| `image.ts` | 160 | 2026-09-17 | **IMPOSSIBLE** | Assumes `@2x`/`@3x` webp variants exist on disk. The app serves remote URLs through `expo-image` plus `constants/images.ts`. The density scheme does not match how images are actually delivered. |

**Decision:** _pending_

---

## 3. `src/components/ui/` — 345 lines

| File | Lines | Created | Verdict | Why |
|---|---|---|---|---|
| `GlassView.tsx` | 113 | 2026-08-14 | **USE** | `GlassHeader.tsx` and `TabBarGlass.tsx` each build the glass effect separately from `BlurView` + `LinearGradient`. `GlassView`/`GlassCard` is the generic base both could sit on. Straight deduplication, low risk. |
| `DateWheelPicker.tsx` | 192 | 2026-06-09 | **NARROW** | Pure-JS scroll wheel. The live `DatePickerModal.tsx` uses native `@react-native-community/datetimepicker` (better accessibility and locale handling). Only worth keeping for a bespoke design-system wheel. |
| `Screen.tsx` | 25 | 2026-06-09 | **DROP** | 25-line `SafeAreaView` wrapper. Screens use `SafeAreaView`/insets directly. Harmless, adds nothing. |
| `Text.tsx` | 15 | 2026-06-22 | **IMPOSSIBLE** | RN's `Text` is patched at the **Metro resolver level** — `metro.config.js` redirects `react-native/Libraries/Text/Text` to `utils/patchText.ts`, loaded before the main module. A component wrapper sits below that and is bypassed by every existing `<Text>`. |

**Decision:** _pending_

---

## 4. `src/store/`

| File | Lines | Created | Verdict | Why |
|---|---|---|---|---|
| `selectors.ts` | 161 | 2026-09-17 | **DROP** | Commit `28502fc` ("task1: 100% complete — implement named selectors in high-traffic files") added exactly one unused import to `HomeLayout.tsx` and 766 lines of completion notes; the selector was never called. Commit `4e0d026` removed that import on 2026-09-18 as an unused-import lint error. The codebase uses inline field selectors (`useCheckoutStore((s) => s.bill)`), which is the current Zustand guidance. |

**Note:** `src/store/STORE_BEST_PRACTICES.md` teaches `import { selectX } from '@/src/store/selectors'`. If this file is dropped, that doc needs updating.

**Decision:** _pending_

---

## 5. `src/hooks/`, `src/lib/`, `src/services/`

| File | Lines | Created | Verdict | Why |
|---|---|---|---|---|
| `hooks/system/useOnlineAction.ts` | 48 | 2026-08-18 | **USE** | Strongest candidate here. `runOnlineAction` exists but is a plain function — no `pending` state, no duplicate-tap guard. This hook adds both, with a ref-based guard that holds within the same tick where a state flag would not. `docs/offline-handling-audit.md` and `docs/infrastructure/offline-and-sync.md` already instruct developers to use it. Screens currently re-implement this by hand. |
| `services/performance.ts` | 109 | 2026-09-17 | **DROP** | Superseded by `services/firebase/performance/` (live, used via `PERF_TRACES` / `usePerformanceTrace`). Two competing trace-name enums is a real bug risk. |
| `lib/crashlytics.ts` | 5 | 2026-07-02 | **DROP** | Self-described "compatibility export for existing consumers outside this application". No such consumers exist. |
| `services/analytics/index.ts` | 2 | 2026-07-20 | **DROP** | Same shim pattern. |
| `services/performance/index.ts` | 2 | 2026-07-17 | **DROP** | Same shim pattern. |

**Decision:** _pending_

---

## 6. `secureStorage.ts` — adoption notes

Worth using, but **not as a drop-in beside `lib/storage.ts`**. Three blockers:

**Key mismatch — would log out every user.**

| | live `lib/storage.ts` | `utils/secureStorage.ts` |
|---|---|---|
| auth token | `caresure.auth.token` | `auth_token` |
| refresh | `caresure.auth.refreshToken` | `refresh_token` |

Four files read the token via `tokenStorage`: `api/client.ts`, `store/authStore.ts`,
`features/cart/hooks/useCartSocketSync.ts`, `lib/storage.ts`. Switching them to
`StorageKey.AUTH_TOKEN` reads a key that is empty on every existing install.

**`REFRESH_TOKEN` reverses a deliberate decision.** `lib/storage.ts` documents that
refresh tokens moved to an httpOnly cookie (`api/client.ts`, `withCredentials: true`);
the key survives only to delete stray values. Re-adopting it puts refresh tokens
back on device.

**`USER_DATA` may not fit.** `expo-secure-store` documents a ~2048-byte value limit.
A `CustomerProfile` JSON via `setSecureJSON` can exceed it. Measure before relying on it.

**Suggested path:** merge into one module under `src/lib/` — keep the typed
`StorageKey` facade and the secure/non-secure routing, reuse the **existing**
`caresure.auth.*` key strings, drop `REFRESH_TOKEN`, and have `tokenStorage`
delegate so the four call sites are unchanged. The gain is the typed facade for
`payment_method`, `language`, `theme`, `last_location` — which `lib/storage.ts`
does not cover, and is presumably why this file was written.

Also: it is infrastructure-with-setup, so by this repo's own layering it belongs in
`src/lib/`, not `src/utils/`. Its `Record<string, any>` violates the no-`any` rule.

---

## 7. Duplicate `buildOrderPayload` — handle separately

**This one is not merely unused; it is unsafe to leave in place.**

Two exported functions share the name `buildOrderPayload`:

| | `src/utils/orderPayload.ts` (live) | `src/utils/order.ts` (dead) |
|---|---|---|
| Consumers | `features/checkout/hooks/usePaymentCalculations.ts` + 2 test files | none |
| `idempotencyKey` / `addressId` | referenced **6 times** | **0 times** |

If anyone autocompletes the wrong import, orders silently lose idempotency
protection — duplicate orders on retry. That is precisely the class of bug the
`fix/checkout-variant-id-and-idempotency` branch exists to prevent.

`getOrderItemPricing` and `formatOrderId` in the same file **are live** (6 consumers)
and must be preserved. Only the duplicate function and its
`BuildOrderPayloadParams` interface would be removed — a 132-line cut leaving a
130-line file whose only remaining import is `OrderItem`.

**Recommended:** action this independently of every other decision above.

---

## Summary

| Verdict | Count | Lines |
|---|---|---|
| USE | 3 | 190 |
| NARROW | 2 | 396 |
| DROP | 11 | 953 |
| IMPOSSIBLE | 3 | 257 |

Removing everything marked DROP + IMPOSSIBLE would delete ~1,210 lines, drop the
lint warning count from 96 to roughly 70, and leave the production bundle
byte-identical.

## If files are removed, these docs need updating

Verified as containing instructions that would become invalid:

- `docs/guides/DEVELOPER_KIT.md` — teaches `setSecureItem()`, `handleAPIError()`,
  `selectUser`, `VirtualizedList`, `useLazyComponent`
- `docs/architecture/ADVANCED_OPTIMIZATIONS.md` — documents the whole optimization
  package; already cites paths that never existed (`@/src/utils/lazyLoad`)
- `src/store/STORE_BEST_PRACTICES.md` — imports from `@/src/store/selectors`
- `docs/architecture/PERFORMANCE_RESULTS.md` — cites `selectors.ts`, `services/performance.ts`
- `docs/architecture/SECURITY_AUDIT.md` — marks an item "ADDRESSED in memoryOptimization.ts"
- `docs/offline-handling-audit.md`, `docs/infrastructure/offline-and-sync.md` —
  reference `useOnlineAction`
- `CLAUDE.md` — lists `crashlytics` under `lib/`
