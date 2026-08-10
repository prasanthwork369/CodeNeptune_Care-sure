# Offline Handling — Audit & Architecture

Audited 2026-08-06. Phase 1 (core) implemented; Phase 2 (per-screen migration) is
the checklist at the end.

## 1. Architecture

Six layers. A feature author touches only the last two.

| Layer | File | Responsibility |
|---|---|---|
| Transport | [`src/api/client.ts`](../src/api/client.ts) | Rejects offline requests before they hang; never decides UI (one backstop report, see below) |
| Error model | [`src/api/errors.ts`](../src/api/errors.ts) | Every failure becomes an `AppError` with a `kind` |
| Status | [`src/store/useNetworkStore.ts`](../src/store/useNetworkStore.ts) + [`src/utils/network.ts`](../src/utils/network.ts) | NetInfo is the only writer of connection state |
| Read access | [`src/utils/offline/networkState.ts`](../src/utils/offline/networkState.ts), [`src/hooks/useNetworkStatus.ts`](../src/hooks/useNetworkStatus.ts) | Imperative predicate for actions, selector hook for rendering |
| Policy | [`src/utils/offline/networkFeedback.ts`](../src/utils/offline/networkFeedback.ts), [`messages.ts`](../src/utils/offline/messages.ts) | The only place that decides banner vs toast vs modal, and the only copy |
| Action | [`src/utils/offline/requireInternet.ts`](../src/utils/offline/requireInternet.ts), [`runOnlineAction.ts`](../src/utils/offline/runOnlineAction.ts), [`src/hooks/useOnlineAction.ts`](../src/hooks/useOnlineAction.ts) | What screens call |

### How a screen uses it

```ts
// Simple guard — everyday action
const onWishlist = () => {
  if (!requireInternet()) return;   // no loader, no request, no navigation
  toggleWishlist();
};

// Full wrapper — gives pending + duplicate-tap guard + error reporting
const { run, pending } = useOnlineAction();
const onPlaceOrder = () => run(() => createOrder(payload), { critical: true });
<AppButton loading={pending} disabled={pending} onPress={onPlaceOrder} />

// Rendering an offline state
const { isOffline, isLowNetwork } = useNetworkStatus();
```

`runOnlineAction` never throws. It returns
`{ ok: true, data }` | `{ ok: false, reason: "offline" | "busy" | "error", error? }`.

### Feedback policy

**One signal per event.** The banner owns the entire offline state; nothing else
narrates it.

| Situation | Treatment |
|---|---|
| Offline, any duration | Global banner only — [`NetworkToast`](../src/components/common/NetworkToast.tsx), mounted app-wide, with a Refresh action |
| Everyday action blocked (cart, search, login, OTP) | Nothing extra. The action simply does not start, and the banner is already on screen saying why |
| Placing an order blocked | Banner **plus** the blocking modal — `requireInternet({ critical: true })`. The only flow that uses `critical`, because an order not happening must be acknowledged |
| Connection failure surfacing from a request | Nothing extra — the client has already marked the app unreachable, so the banner is up |
| Any other failure (server, timeout, validation) | One error toast; the banner says nothing about these |
| Request cancelled (debounce, unmount) | Nothing. Not a failure. |
| Query failed but cached data is on screen | Nothing. The banner already explains it. |
| Query failed with an empty cache | Error toast — the user is looking at nothing |

The toast and the banner are both bottom-anchored ~90–100px up, so stacking them
was also a visual collision, not just a duplicate message.

One sentence everywhere, `OFFLINE_MESSAGE`:
*"No internet connection. Please check your network and try again."*
Repeats of the same message inside 2.5s collapse into one toast, so hammering a
button offline cannot stack messages.

### Error kinds

`offline` (never left the device) · `network` (DNS, reset, unreachable) ·
`timeout` · `cancelled` · `unauthorized` · `forbidden` · `not_found` ·
`validation` · `server` · `unknown`. None of `offline`, `network`, `cancelled`,
`unauthorized`, `forbidden`, `not_found`, `validation` is retried.

### React Query defaults ([`queryClient.ts`](../src/lib/react-query/queryClient.ts))

- **`networkMode: "always"` on queries *and* mutations.** The default `"online"`
  *pauses* offline work, so `refetch()`/`mutateAsync()` never settle — that is the
  root cause of the infinite loaders. Running them lets the client's gate reject
  immediately.
- **Global `MutationCache.onError`** reports every mutation failure in the
  standard style. Previously `() => {}`, which silently swallowed all 31.
- **Global `QueryCache.onError`** reports only when the query has no cached data.
- Opt out per mutation/query with `meta: { silentError: true }` when the screen
  renders its own inline error.
- `refetchOnReconnect` refetches only *stale* queries, so reconnecting cannot
  stampede the API, and nothing remounts — screen state is preserved.

## 2. Action inventory

### Internet required — 31 React Query mutations
Auth (requestOtp, verifyOtp, logout, deleteAccount, email verify ×2) · Cart (add,
update, remove, clear, checkout) · Orders (create, return, cancel) · Address (add,
update, delete) · Profile (update, avatar upload) · Patients (add, update, delete)
· Prescription (upload, mutations, refill reminder) · Notifications (dismiss, mark
read, preferences) · Wallet (addMoney) · Search history (record, clear, delete) ·
Substitute request · Pincode check.

All 31 are now covered by the global error handler and can no longer hang.

### Internet required — direct service/api calls (Phase 2 targets)
Coupon apply ([CartCouponSection](../src/components/cart/sections/CartCouponSection.tsx),
[CouponsLayout](../src/components/cart/coupons/CouponsLayout.tsx)) · storage uploads
([PreviewLayout](../src/components/prescription/preview/PreviewLayout.tsx),
[ReturnProductLayout](../src/components/profile/orders/ReturnProductLayout.tsx),
[useSelectPatientImages](../src/hooks/useSelectPatientImages.ts)) · location search &
reverse geocode ([LocationBottomSheet](../src/components/home/sections/LocationBottomSheet.tsx))
· order cancel ([CancelOrderLayout](../src/components/profile/orders/CancelOrderLayout.tsx))
· invoice + digital-prescription downloads · prescription viewer · signup bonus
([SignupBonusPopup](../src/components/auth/SignupBonusPopup.tsx) — excluded by
instruction, do not modify).

### Offline supported
Navigation, tab switching, SQLite-cached screens (`withSqliteCache` + `initialData`:
home, profile, orders, product, categories), guest cart (local zustand — writes
must **not** be gated on the network), prescription draft, coupon selection state,
theme/settings, contact actions (`tel:`/`mailto:` are OS intents).

### Mixed
Home (cached feed, live refresh) · Cart (guest local, authed remote) · Search
(cached history offline, results online) · Orders list (cached list, live detail).

### Learned reachability

NetInfo's own reachability probe runs on an interval and uses the app's network
stack, so it is both slow and, when the OS blocks *the app* specifically, late.
[`reachability.ts`](../src/utils/offline/reachability.ts) therefore treats real
request outcomes as evidence:

| Signal | Effect |
|---|---|
| Any request fails at the connection level (no response, not a timeout) | `isInternetReachable → false`, so the banner and the gate engage at once |
| Any request succeeds | `isInternetReachable → true`, so a wrong reading can never latch the app into a dead state |
| NetInfo event | Overwrites both, as the authority on the transport |

`markReachable()` deliberately cannot clear a hard `isConnected: false` — only
NetInfo lifts that.

## 3. Edge cases handled

- **`null` connection state** (cold start, before NetInfo reports) counts as
  online, so the first action is never wrongly blocked.
- **Connected but unreachable** (captive portal, dead router) counts as offline —
  otherwise every request burned the full timeout (15s prod / 60s dev).
- **OS blocks the app but not the device** (per-app data restriction on Vivo /
  Xiaomi / Samsung, data saver, VPN with no route): NetInfo still reports
  connected, so the first request goes out and fails fast; that failure marks the
  app unreachable, and every tap after it is gated instantly with the banner up.
  A later success clears it.
- **Drop mid-flight**: the response interceptor re-checks and normalizes to
  `offline` rather than a raw axios error.
- **Duplicate taps**: `useOnlineAction` guards with a ref, which holds inside the
  same tick where a state flag would not.
- **Loader never starts offline**: the gate runs *before* `setPending(true)`.
- **Guest vs authed cart**: guest writes are local, so they are not gated.
- **Repeat toasts**: 2.5s de-dupe window, shared by the backstop and the screens.
- **Cancellations**: silent by kind, so debounced search never toasts.

## 4. Remaining work — Phase 2 checklist

- [x] Replace the 4 hand-rolled checks with `requireInternet` — done in
      [useLogin.ts](../src/hooks/useLogin.ts), [useOtp.ts](../src/hooks/useOtp.ts) (×2)
      and [usePaymentCalculations.ts](../src/hooks/usePaymentCalculations.ts)
      (`critical: true`). These were the last callers of `showOfflineAlert()`, and
      the source of a modal appearing alongside the banner.
- [x] Gate the direct-call sites listed above — done 2026-08-10 via `requireInternet`:
      location sheet (×3), coupon apply (`CartCouponSection`, `CouponsLayout`),
      storage uploads (`useSelectPatientImages` add + delete, `ReturnProductLayout`),
      order cancel (`CancelOrderLayout`), prescription upload (`PreviewLayout` — replaced
      the last hand-rolled `isConnected` check), prescription download (`RxOrdersLayout`).
      `critical: true` on order cancel, return submit and prescription upload; the rest
      are banner-only per the single-signal policy. The viewer's `getById` is left
      ungated deliberately — it is a read that falls back to the passed params.
- [x] `meta: { silentError: true }` — done 2026-08-10 on `requestOtp`, `verifyOtp`
      ([useAuth](../src/hooks/mutations/useAuth.ts)) and both email-verify mutations
      ([useEmailVerification](../src/hooks/mutations/useEmailVerification.ts)). All four
      surface their error inline (OTP screen via `useAuth().error`, `EmailVerifyModal`
      via `error={verifyError}`), so the global toast was repeating it. `logout` and
      `deleteAccount` deliberately keep the toast — they render nothing inline.
- [~] `requiresInternet` prop on [`AppButton`](../src/components/ui/AppButton.tsx) —
      **not actionable as written.** The three screens named here
      ([AddAddressLayout](../src/components/profile/addresses/AddAddressLayout.tsx),
      [AddPatientLayout](../src/components/profile/patients/AddPatientLayout.tsx),
      [MyProfileLayout](../src/components/profile/common/MyProfileLayout.tsx)) do not use
      `AppButton` — they use raw `Touchable` with their own `disabled` + opacity. Adding
      the prop changes nothing until they are migrated, which is a visual refactor with
      real risk. Their current `useIsOffline()` disable is already correct behaviour;
      only the styling is ad-hoc. `SearchPageLayout` uses `isOffline` to render an
      offline view, not to disable a button, so it is out of scope entirely.
- [x] `RefreshControl` verification — done 2026-08-10, **all five are safe**. Home uses
      `Promise.allSettled` + `finally` so the spinner always stops; Notifications, Orders
      and Profile bind to React Query's `isRefetching`, which settles quickly offline now
      that `networkMode: "always"` no longer pauses work. `ProductGrid` passes a hardcoded
      `refreshing={false}` — it cannot hang, but pull-to-refresh there gives no feedback
      at all. Minor UX gap, not an offline bug.
- [ ] Empty-cache offline states: screens with no SQLite cache now show an error
      instead of an endless skeleton — decide per screen whether that needs a
      retry view

## 5. Recommendations

1. **`requestQueue` is dead code.** [`src/utils/requestQueue.ts`](../src/utils/requestQueue.ts)
   is loaded on boot, persisted, and processed on reconnect, but nothing ever
   calls `add()`. Either wire it to genuinely replayable writes (cart quantity,
   notification dismiss) or delete it — carrying it implies an offline-write
   guarantee the app does not have.
2. **Idempotency for replay.** `createOrder` already takes an idempotency key;
   any future offline write queue must, too.
3. **Screens needing manual review on device** (behaviour change from
   `networkMode: "always"`): any screen with no SQLite cache — wallet, coupons,
   notification preferences, return flow, prescription order medicines. They now
   fail fast instead of hanging, which is correct, but the empty state should be
   looked at.
