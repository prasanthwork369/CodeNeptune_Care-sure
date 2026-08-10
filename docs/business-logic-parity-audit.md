# Web ↔ Mobile Business-Logic Parity Audit

**Date:** 2026-08-10 (supersedes the 2026-07-27 audit deleted in `99b3271`)
**Scope:** Customer-facing business rules shared by the two clients on the same backend.

- **Mobile** — `CodeNeptune_Care-sure` (Expo / React Native, Zustand, React Query)
- **Web** — `Web/customer-website` (Next.js, Redux Toolkit, React Query) — reference snapshot taken 2026-08-10

> **Canonical rule:** where the two clients disagree on money, **mobile is authoritative**. Every remaining
> divergence below is a web-side fix. Do not "align" mobile down to web — that reverses decisions taken
> on 2026-07-27 and would charge customers incorrectly.

---

## Status since the last audit

| # | Area | Divergence | Status |
|---|------|-----------|--------|
| 1 | Billing | Wallet vs corporate-credits order | ✅ Aligned — both credits-first |
| 2 | Billing | Web hardcoded handling charge = 0 | ✅ **Web fixed** — now reads `cartData.handlingCharge` |
| 3 | Billing | Free-delivery boundary | ❌ **Open — web-side** |
| 4 | Coupon | Live recompute vs frozen discount | 🟡 Partly closed on web |
| 5 | Prescription | Refill custom date | ❌ Open — web lacks it |
| 6 | Account | Delete Account | ❌ Open — web lacks it |
| 7 | Billing | Live Price Sync | ❌ Open — mobile lacks it |
| 8 | Checkout | Session token + expiry | ❌ Open — mobile lacks it |
| 9 | Billing | Fallback defaults when settings fail | ❌ **Open — web-side** |
| 10 | Pincode | Non-2xx serviceability handling | ❌ Open — web-side |
| 11 | Auth | verify-otp payload | ⚪ Platform-inherent, no action |

---

## Open — web must change

### 3. Free-delivery boundary (money)

At a subtotal **exactly equal** to the threshold, the two clients disagree.

- **Mobile (correct)** — free when `subtotal >= freeDeliveryAbove`: `src/hooks/useDeliveryCharges.ts:18`
- **Web** — charges when `totalSellingPrice <= freeDeliveryAbove`: `src/lib/utils/cart-utils.ts:86`

Cart of ₹500 with a ₹500 threshold: **mobile free, web charges ₹50.**

**Fix:** change web's comparison to `<` so at-threshold is free.

### 9. Fallback defaults when admin settings fail to load

| Setting | Mobile | Web |
|---|---|---|
| `coinUsagePercentage` | `10` (`useBillingCalculations.ts:42`) | `100` (`cart-utils.ts:68`) |
| `freeDeliveryAbove` | gated — charges 0 until settings arrive | `500` (`cart-utils.ts:65`) |
| `standardDeliveryCharge` | gated | `50` (`cart-utils.ts:66`) |

If settings fail to load, web lets coins cover **100%** of an order (mobile: 10%) and invents a ₹50/₹500
delivery rule. Mobile gates instead — `isReady` is false and checkout is blocked until real settings land.

**Fix:** web should adopt mobile's gating, or at minimum match the fallbacks.

### 10. Pincode serviceability on non-2xx

Mobile reads a `serviceable` flag out of a non-2xx body and returns normally (`src/api/pincode.api.ts`);
web's `pincodeService.check` only reads `data.data` on success, so the same response throws a generic error.

---

## Open — mobile could adopt from web

### 7. Live Price Sync

Web threads a `livePriceSync` flag through the whole bill and checkout (23 references). Mobile has no
toggle and always sends `livePriceSyncUsed: false` (`src/hooks/usePaymentCalculations.ts`).

**Decide:** should mobile expose this, or is it deliberately web-only?

### 8. Checkout session token + 10-minute expiry

Web starts a checkout session with a random token and `expiresAt = Date.now() + 600000`
(`components/cart/sections/Hero.tsx:273`, `app/patient-details/page.tsx:223`). Mobile freezes the bill in
`checkoutStore` at "Proceed" with no token or expiry, so a mid-checkout bill can go stale indefinitely.

---

## Open — feature gaps on web

### 5. Refill reminder custom date

Mobile accepts frequency **or** a custom date (`src/hooks/useRefillReminder.ts`); web's
`setReminder(id, frequencyDays: number)` is frequency-only (`lib/services/prescription.service.ts:132`).
A custom-date reminder set on mobile has no web equivalent.

### 6. Delete Account

Mobile has the full flow (`src/services/auth.service.ts`, `app/profile/delete-account.tsx`). Web has no
service, route or UI — `deleteAccount` / `delete-account` return nothing. Often a store/compliance
requirement on every customer surface.

---

## 4. Coupon discount — partly closed

- **Mobile** — recomputes the discount live from the coupon rule on every cart change and auto-removes it
  when the cart falls below `minOrderValue` (`src/hooks/useCartCalculations.ts`), and pre-validates every
  listed coupon (`src/hooks/useCouponAvailability.ts`).
- **Web** — still passes the frozen apply-time `appliedCoupon.discount` into the bill
  (`cart-utils.ts:79`), but now re-validates and removes with a message on cart change
  (`Hero.tsx:146-160`).

Web is close enough that a stale discount should self-correct, but the value in the bill is still the
frozen one between validations. Backend re-validation at order creation remains the right backstop.

---

## Confirmed parity (no action)

- Coins formula — `min(coinsBalance, sellingTotal × coinUsagePct% / coinValue)`, floored, then valued
- Selling-price derivation and product savings (`mrpTotal − sellingTotal`)
- Cart CRUD endpoints and semantics
- Coupon / order / return / wallet API contracts
- Order cancel, wallet top-up, corporate-credit eligibility gate

## Platform-inherent (not divergences)

- Mobile: SQLite offline sync, push notifications, native modules — web has no equivalent
- State container: Zustand (mobile) vs Redux (web) — deliberate, not a rule difference
- Token storage: stored refresh token (mobile) vs httpOnly cookie (web)
- Web-only content pages: blogs, find-a-pharmacy, about-us, contact-us, privacy, terms

## Structural note

Web's `src/` carries two accidental duplications — `constants/` + `lib/constants/`, and
`lib/validation/` + `lib/validations/`. Mobile deliberately does **not** mirror these. Mobile's
`src/utils/validation.ts` (120 lines, one cohesive module) is intentionally kept over web's 7-file split.

---

## Priority

1. **#3 free-delivery boundary** — one-character web fix, direct money impact
2. **#9 fallback defaults** — web adopts mobile's gate-until-ready posture
3. **#6 delete account** — compliance driver
4. **#5 refill custom date**, **#10 pincode** — feature/robustness gaps
5. **#7 live price sync**, **#8 session expiry** — decide whether mobile should adopt
