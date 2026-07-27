# Web ↔ Mobile Business-Logic Parity Audit

**Date:** 2026-07-27
**Scope:** Customer-facing business rules shared between the two clients that hit the same backend.

- **Mobile** — `CodeNeptune_Care-sure` (Expo / React Native, Zustand, React Query)
- **Web** — `W/customer-website` (Next.js 16, Redux Toolkit, React Query) — read-only reference

Both clients call the same backend, so where a **business rule** (money, eligibility, state) is computed client-side, the two should agree. This audit lists where they **don't**. Platform-inherent differences (offline cache, cookie vs stored token) are separated out at the end.

> **Decisions taken 2026-07-27** (money path): handling charge = **charge per admin setting** (mobile correct); free delivery = **free at threshold and above** (mobile correct); wallet vs credits = **corporate credits first** (mobile changed to match). See per-section status.
>
> - ✅ **#1 fixed on mobile** — `useBillingCalculations` now applies corporate credits before wallet, with a new credits-first test.
> - 🔵 **#2, #3** — mobile is already correct; the fix is **web-side** (documented here, not actionable from this repo).

> All file:line references were current at audit time; verify before acting on any single line.

---

## Severity summary

| #   | Area         | Divergence                                                                     | Impact                                                           | Severity          |
| --- | ------------ | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ----------------- |
| 1   | Billing      | Wallet vs Corporate-Credits **application order**                              | Different balance drained first → different remaining balances   | ✅ Fixed (mobile) |
| 2   | Billing      | Web **hardcodes handling charge = 0**                                          | Web never charges admin handling fee; mobile does                | 🔵 Web-side fix   |
| 3   | Billing      | **Free-delivery boundary** (`>=` vs `<=`)                                      | At subtotal _exactly_ = threshold, mobile is free, web charges   | 🔵 Web-side fix   |
| 4   | Coupon       | Mobile **recomputes live + auto-removes**; web **freezes** apply-time discount | Web can keep a stale/ineligible coupon discount after cart edits | 🟠 Medium (money) |
| 5   | Prescription | Web refill reminder is **frequency-only**; mobile also has **custom date**     | Feature gap                                                      | 🟠 Medium         |
| 6   | Account      | **Delete Account** exists on mobile only                                       | Feature gap (compliance-relevant)                                | 🟠 Medium         |
| 7   | Billing      | **Live Price Sync** is a web-only checkout option                              | Feature gap; mobile always sends `false`                         | 🟡 Low            |
| 8   | Checkout     | Web has a **checkout-session token + 10-min expiry**; mobile has none          | Behavioural difference                                           | 🟡 Low            |
| 9   | Billing      | **Fallback defaults differ** (`coinUsagePercentage` 10 vs 100, etc.)           | Only bites if admin settings fail to load                        | 🟡 Low            |
| 10  | Pincode      | Mobile tolerates non-2xx serviceability bodies; web does not                   | Web may error where mobile shows "not serviceable"               | 🟡 Low            |
| 11  | Auth         | verify-otp payload differs (`deviceId` vs `platform`)                          | Expected, but worth tracking                                     | ⚪ Info           |

---

## 1. ✅ Wallet vs Corporate-Credits application order — FIXED (mobile, 2026-07-27)

The order in which wallet balance and corporate credits are consumed differs, so the **same cart drains different balances**.

- **Mobile** — always **wallet first, then corporate credits**, no user control.
  `src/hooks/useBillingCalculations.ts:60-98` (WALLET_DISCOUNT computed at 65, credits at 89 off `subtotalBeforeCorporateCredits`).
- **Web** — user-selectable via a `walletFirst` flag that **defaults to `false`**, i.e. **corporate credits first, then wallet**.
  `src/lib/utils/cart-utils.ts:94-112`; default `useState(false)` at `src/components/cart/sections/Hero.tsx:66`.

**Effect:** For a corporate user toggling both, mobile spends wallet money before company credits; web (default) spends company credits before wallet money. Different post-order balances for identical inputs.

**Decision & fix:** Canonical order = **corporate credits first** (spend company money before the customer's own wallet). Mobile's `useBillingCalculations` was reworked to a credits→wallet waterfall to match web's default, and a `credits-first` test was added (`__tests__/hooks/useBillingCalculations.test.ts`). Web's `walletFirst` toggle remains web-only; not ported to mobile.

---

## 2. 🔵 Handling charge hardcoded to 0 on web — web-side fix (mobile correct)

**Decision (2026-07-27):** Handling charge should follow the admin setting — mobile is correct, no mobile change. Action below is on web.

- **Mobile** — reads handling charge from admin settings: `src/hooks/useDeliveryCharges.ts:21` (`cart.handlingCharge`).
- **Web** — `const handlingCharge = 0;` hardcoded in the bill calculator: `src/lib/utils/cart-utils.ts:82`. The UI only renders it when `> 0`, so it's always hidden on web.

**Effect:** If admin configures a non-zero handling charge, mobile customers pay it and web customers don't — for the same order.

**Recommendation:** Web should read `handlingCharge` from `cart` settings like mobile, or confirm handling charge is deliberately mobile-only.

---

## 3. 🔵 Free-delivery boundary is off-by-one at the threshold — web-side fix (mobile correct)

**Decision (2026-07-27):** Free delivery applies **at the threshold and above** — mobile is correct (`>=`), no mobile change. Web should change `<=` so exactly-at-threshold is free.

- **Mobile** — free when `subtotal >= freeDeliveryThreshold`: `src/hooks/useDeliveryCharges.ts:17-20`.
- **Web** — charges when `totalSellingPrice <= freeDeliveryAbove`: `src/lib/utils/cart-utils.ts:81`.

**Effect:** At a subtotal _exactly equal_ to the threshold (e.g. ₹500 with threshold ₹500): **mobile = free delivery, web = charged**. Web also uses `threshold + 1` as the progress-bar target (`Hero.tsx:306`), reinforcing the "not free until you exceed it" behaviour.

**Recommendation:** Agree on inclusive vs exclusive at the boundary and align both comparisons.

---

## 4. 🟠 Coupon discount: live recompute vs frozen value

- **Mobile** — recomputes the coupon discount **live from the coupon's own rule** (percentage/fixed, `maxDiscountAmount` cap, `minOrderValue` eligibility) on every cart change, and **auto-removes** the coupon when the cart drops below `minOrderValue`:
  `src/hooks/useCartCalculations.ts:159-186` (recompute), `:165-169` (auto-remove). It also **pre-validates every listed coupon** so unusable ones show inactive before Apply: `src/hooks/useCouponAvailability.ts`.
- **Web** — passes the **frozen apply-time value** `appliedCoupon?.discount` straight into the bill: `src/components/cart/sections/Hero.tsx:300` → `cart-utils.ts:74`. No live recompute or auto-removal is visible in the calc path.

**Effect:** On web, applying a coupon and then reducing quantity below its `minOrderValue` can leave a **stale discount** applied until re-validated; mobile self-corrects. Percentage coupons with a max-cap may also drift.

**Recommendation:** Have web re-derive the coupon discount from the coupon definition on each cart mutation (and drop it when ineligible), mirroring mobile — or rely on the backend to re-validate at order creation and reject mismatches.

---

## 5. 🟠 Refill reminder — custom date is mobile-only

- **Mobile** — `setReminder(id, input: ReminderInput)` accepts **frequency (7/14/21/30 days) OR a custom date**: `src/services/prescription.service.ts:70`; logic in `src/hooks/useRefillReminder.ts`.
- **Web** — `setReminder(id, frequencyDays: 7 | 14 | 21 | 30)` — **frequency only**, no custom date: `src/lib/services/prescription.service.ts:132`.

**Effect:** A reminder set to a custom date on mobile has no equivalent on web (matches the known refill-reminder contract note). Cancel/set otherwise agree.

---

## 6. 🟠 Delete Account — mobile-only

- **Mobile** — full flow: `src/services/auth.service.ts:49` (`deleteAccount`) → dedicated screen `app/profile/delete-account.tsx`.
- **Web** — no delete-account service, route, or UI found (`grep` for `deleteAccount` / `delete-account` returns nothing).

**Effect:** Account deletion is only possible from mobile. Often a store/compliance requirement to offer on all customer surfaces.

---

## 7. 🟡 Live Price Sync — web-only checkout option

- **Web** — `livePriceSync` is a first-class bill input threaded through checkout (`calculateCartBill(items, walletOn, coinsOn, livePriceSync, …)`, `cart-utils.ts:37`) and persisted into the pending checkout (`Hero.tsx:231`).
- **Mobile** — no such toggle; the order payload always sends `livePriceSyncUsed: false`: `src/hooks/usePaymentCalculations.ts:227`.

**Effect:** Feature gap. Confirm whether live price sync should exist on mobile.

---

## 8. 🟡 Checkout session token + expiry — web-only

- **Web** — starts a checkout session with a random token and a **10-minute expiry** (`expiresAt = Date.now() + 600000`): `src/components/cart/sections/Hero.tsx:246-263`.
- **Mobile** — checkout state lives in `checkoutStore` with no session token or expiry; the bill is frozen at "Proceed" (`useCartCalculations.handleProceed`).

**Effect:** Web can expire an in-progress checkout; mobile can't. Low impact but a behavioural difference in how stale a mid-checkout bill can get.

---

## 9. 🟡 Fallback defaults differ (settings-load failure only)

When admin settings are present both clients use the same values. The **hardcoded fallbacks** differ:

| Setting                  | Mobile fallback                                                                    | Web fallback               |
| ------------------------ | ---------------------------------------------------------------------------------- | -------------------------- |
| `coinUsagePercentage`    | `10` (`useBillingCalculations.ts:41`)                                              | `100` (`cart-utils.ts:63`) |
| `freeDeliveryAbove`      | gated — `isReady=false`, charges = 0 until settings land (`useDeliveryCharges.ts`) | `500` (`cart-utils.ts:60`) |
| `standardDeliveryCharge` | gated (0 until ready)                                                              | `50` (`cart-utils.ts:61`)  |

**Effect:** If settings fail to load, web would let coins cover **100%** of the order vs mobile's **10%**, and web would invent a ₹50 / ₹500 delivery rule while mobile blocks checkout until real settings arrive (`handleProceed` returns early when `!chargesReady`). Mobile's "gate until ready" is the safer posture.

**Recommendation:** Align the fallbacks (and ideally have web also gate checkout until settings load).

---

## 10. 🟡 Pincode serviceability error handling

- **Mobile** — if the backend returns a **non-2xx** for a non-serviceable pincode but the body still carries `serviceable`, mobile reads it and returns normally: `src/api/pincode.api.ts:23-31`.
- **Web** — `pincodeService.check` only reads `data.data` on success: `src/lib/services/pincode.service.ts:14-20`; a non-2xx would throw.

**Effect:** Depending on how the backend signals "not serviceable", web may surface a generic error where mobile cleanly shows "not serviceable".

---

## 11. ⚪ Auth verify-otp payload (expected platform difference)

- **Mobile** — sends hardware `deviceId` (mandatory for push registration), no platform tag: `src/services/auth.service.ts:13-17`.
- **Web** — sends `platform: 'WEBSITE'`, no `deviceId`: `src/lib/services/auth.service.ts:59`.

Expected and correct per platform; listed for completeness. Related: web appears to rely on an httpOnly cookie for refresh (empty-body `/auth/refresh`), while mobile stores the refresh token explicitly (`tokenStorage.setRefreshToken`). Platform-inherent.

---

## Confirmed parity (no action)

- **Coins discount base & formula** — both cap usable coins at `min(coinsBalance, sellingTotal × coinUsagePct% / coinValue)`, floor the coin count, then value it. (`useBillingCalculations.ts:52-58` ↔ `cart-utils.ts:77-79`.)
- **Selling price derivation** — both derive payable price as `mrp × (1 − discountPercent/100)` and treat backend `unitPrice` as MRP. (`useCartCalculations.ts:110-121` ↔ `cart-utils.ts:48-57`.)
- **Product savings** — `mrpTotal − sellingTotal` on both.
- **Cart CRUD & endpoints** — identical (`/cart`, `/cart/items`, PATCH/DELETE). Add/update/remove semantics match; web's min-quantity floor of 1 (`Hero.tsx:190-195`) is a UI guard, not a rule divergence.
- **Coupon / order / return / wallet / pincode API contracts** — same endpoints and payload shapes.
- **Order cancel** — both support `POST /orders/{id}/cancel` with a reason (mobile via `order.api.ts:69`, web via `order.service.cancelOrder`). Mobile just doesn't re-export it through `order.service`.
- **Wallet top-up** — both have it (mobile `useAddMoney` + `AddMoneyLayout`; web `walletService.addMoney`).
- **Corporate-credit eligibility gate** — both require `subtotal >= minOrderValueForDiscount` and cap at `maxDiscountPerOrder`.

## Platform-inherent (not business-rule gaps)

- **Offline data sync** — mobile has SQLite-backed sync (`src/services/sync.service.ts`) for home/category/medicine/frequent-order content; web (a website) has none.
- **Guest-cart merge on login** — web merges via `cartService.syncCart(localItems)` (fetching missing medicine details); mobile merges via `cartStore` + `useOtp`/`useCart`. Same outcome, different mechanism.
- **State container** — Zustand (mobile, 15 stores) vs Redux Toolkit (web, 5 slices). Not a rule difference.
- **Token storage** — stored refresh token (mobile) vs httpOnly cookie (web).

---

## Suggested priority order for fixes

1. **#2 handling charge** and **#1 wallet/credits order** — direct money divergences, easiest to reason about.
2. **#3 free-delivery boundary** — one-character fix once the intended semantics are agreed.
3. **#4 coupon live recompute** — protects against stale discounts at order creation (backend re-validation is a good backstop regardless).
4. **#6 delete account** and **#5 refill custom date** — feature gaps; prioritise delete-account if there's a compliance driver.
5. **#9 fallback defaults / #10 pincode / #7 live price sync / #8 session expiry** — lower urgency; batch as cleanup.

/////////////////

## Summary for senior review

The change prevents the order-level discount ratio from being displayed as every medicine’s individual discount percentage.

Previously, when item-level discount data was missing, the application calculated one order-wide ratio and displayed that same percentage for every medicine.

## Files changed

- `src/utils/order.ts`
- `src/types/order.ts`
- `src/components/profile/orders/OrderTrackingLayout.tsx`
- `src/components/profile/orders/tracking-sections/ItemsOrderedSection.tsx`
- `__tests__/utils/orderItemPricing.test.ts`
- `src/api/order.api.ts` — development logging only

## Previous behavior

`OrderTrackingLayout` calculated one ratio:

```tsx
discountRatio={mrpTotal > 0 ? subtotal / mrpTotal : 1}
```

`getOrderItemPricing()` converted it into a percentage:

```ts
discountPercent: (1 - orderDiscountRatio) * 100;
```

Therefore, if three items lacked snapshot discount data, all three received the same calculated discount.

The old utility also checked only:

```ts
item.medicineSnapshot?.discountPercent;
item.medicineSnapshot?.discountPercentage;
```

It ignored top-level backend fields such as:

```ts
item.discountPercent;
item.discountPercentage;
item.mrp;
```

## New discount priority

The displayed percentage now uses the first valid item-specific value:

```ts
const directDiscount = firstValidDiscount(
  item.discountPercent,
  item.discountPercentage,
  item.medicineSnapshot?.discountPercent,
  item.medicineSnapshot?.discountPercentage,
);
```

A valid percentage must be:

```ts
Number.isFinite(value);
value > 0;
value <= 100;
```

Numeric strings such as `"21.05"` are supported.

## Item price resolution

MRP priority:

```ts
item.mrp;
item.medicineSnapshot?.mrp;
item.unitPrice;
item.sellingPrice; // only when no separate MRP exists
```

Selling-price priority:

```ts
item.sellingPrice;
```

For legacy records, `unitPrice` is treated as selling price only when an explicit, larger item MRP exists:

```ts
explicitMrp != null && unitPrice != null && unitPrice < explicitMrp;
```

## Derived percentage

Calculation happens only if no valid direct or snapshot discount exists:

```ts
if (
  mrp > 0 &&
  itemSellingPrice != null &&
  itemSellingPrice >= 0 &&
  itemSellingPrice < mrp
) {
  return {
    sellingPrice: round2(itemSellingPrice),
    mrp,
    discountPercent: round2(((mrp - itemSellingPrice) / mrp) * 100),
  };
}
```

Example:

```ts
mrp = 100;
sellingPrice = 78.95;
```

Result:

```ts
discountPercent = 21.05;
```

## Order-level fallback

The prop was renamed from:

```ts
discountRatio;
```

to:

```ts
priceEstimateRatio;
```

Call site:

```tsx
<ItemsOrderedSection
  items={items}
  orderId={orderId}
  orderStatus={order?.status}
  isCancelling={isCancelling}
  priceEstimateRatio={mrpTotal > 0 ? subtotal / mrpTotal : 1}
/>
```

The ratio may estimate a missing selling price for old orders, but it explicitly returns zero as the item percentage:

```ts
if (mrp > 0 && validEstimateRatio != null) {
  return {
    sellingPrice: round2(mrp * validEstimateRatio),
    mrp,
    discountPercent: 0,
  };
}
```

Therefore, it cannot generate a discount badge.

## Invalid data handling

The utility rejects:

- `undefined` and `null`
- Empty strings
- `NaN` and infinity
- Negative prices
- Discount percentages ≤0
- Discount percentages >100
- Selling price equal to or greater than MRP

When no reliable item discount exists:

```ts
return {
  sellingPrice: mrp,
  mrp,
  discountPercent: 0,
};
```

No badge is displayed.

## Type compatibility

Added optional backend compatibility:

```ts
export interface OrderItem {
  // existing fields...
  unitPrice?: string;
  sellingPrice?: number | string;
  mrp?: number | string;
  discountPercent?: number | string;
  discountPercentage?: number | string;
}
```

No backend contract was changed; this only allows the client to consume an existing optional response field.

## Development logging

`order.api.ts` now logs normalized item pricing in development:

```ts
if (__DEV__) {
  console.log(
    "[getOrderById] item pricing:",
    data.items?.map((item: any) => ({
      name: item.medicineSnapshot?.name,
      unitPrice: item.unitPrice,
      sellingPrice: item.sellingPrice,
      mrp: item.mrp,
      discountPercent: item.discountPercent,
      discountPercentage: item.discountPercentage,
      snapshotMrp: item.medicineSnapshot?.mrp,
      snapshotDiscountPercent: item.medicineSnapshot?.discountPercent,
      snapshotDiscountPercentage: item.medicineSnapshot?.discountPercentage,
    })),
  );
}
```

This does not execute in production.

## Tests added

Focused tests verify:

- Direct `discountPercent`
- Direct `discountPercentage`
- Snapshot discount fields
- Priority between item and snapshot fields
- Numeric strings
- Derived percentage
- Different discounts within one order
- Missing values
- Invalid MRP/selling-price combinations
- Negative, `NaN`, infinity and >100 values
- Order-ratio percentage leakage prevention

Validation:

- TypeScript passed
- 2 Jest suites passed
- 23 tests passed
- Modified-file lint: zero errors

## Important remaining consideration

The active order-creation mapping in `usePaymentCalculations.ts` currently does not copy the cart’s exact discount into:

```ts
medicineSnapshot.discountPercent;
```

Therefore, if the backend returns `0` and does not provide an item selling price, an existing order cannot recover the original `21.05%`.

The display correction is complete, but preserving the exact percentage for newly created orders should additionally copy:

```ts
discountPercent: i.discountPercent ?? i.metadata?.discountPercent ?? 0;
```

into the order item’s `medicineSnapshot`. This would only preserve display metadata; it would not alter totals or payment calculations.
