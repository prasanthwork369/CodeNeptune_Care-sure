# CareSure — Production Readiness Audit

_Audit date: 2026-07-02_

## 🔴 Launch Blockers (fix before shipping)

1. **`src/components/cart/CouponsLayout.tsx:10-39`** — The "View all coupons" full-page screen uses a hardcoded `MOCK_COUPONS` array (`CARE10`, `SAVE150`, `FIRST50`, `CARE200`) instead of the real backend. This is a different screen from the cart's quick-apply section (`CartCouponSection.tsx`), which correctly calls `useCoupons()`. Users can currently apply fake coupon codes that don't exist on the backend.
2. **`src/utils/urls.ts:3`** — `const LIVE = false` hardcoded. The file's own comment says "Flip LIVE to switch between live API and QA." Must be flipped (or made env-driven) before a production build, or the shipped app will hit the QA backend.
3. **`app.config.ts:7,19`** — `version: "1.0.0"`, `versionCode: 1` — literal placeholder values, need real versioning before store submission.
4. **No crash reporting/analytics** — no Sentry/Crashlytics/Firebase Analytics anywhere in the app. Zero visibility into production crashes or user behavior post-launch.
5. **`src/hooks/useLogin.ts:74`** — `prefillOtp: res?.data?.otp` passes the OTP through router navigation params. Only a real concern if the backend actually returns the OTP value outside of a controlled QA/staging environment — confirm with backend whether this field is prod-safe or QA-only.

## 🟠 High Priority

6. **Delete Account** (`src/components/profile/common/MyProfileLayout.tsx:122`) and **Delete Prescription** (`src/components/profile/orders/RxOrdersLayout.tsx:345`) — stub `onPress: () => {}`, no backend wiring (Delete Account already known/blocked on missing endpoint).
7. **Email verification button** (`src/components/profile/common/MyProfileLayout.tsx:154`) — stub, no-op.
8. **Order rating/review screen** — completely absent from the codebase (no UI, types, or API).
9. **~181 `any`-typed values** across 64+ files (notably `src/types/cart.ts`, `src/types/home.ts`, `src/components/animations/flyToCart/FlyToCartContext.tsx`) — violates the project's own CLAUDE.md "no any" rule and undermines type safety project-wide.
10. Refresh-token queue has no exponential backoff on repeated 5xx failures from the refresh endpoint (note: it does **not** infinite-loop per request — `_retry` correctly caps each request to one retry attempt).

## 🟡 Medium

11. Two direct `require(...)` image imports bypassing `constants/images.ts` (`src/components/profile/select-patient/sections/PatientEmptyState.tsx:16`, `src/components/splash/SplashAnimationScreen.tsx:13`).
12. A few remaining ungated/dev-only `console.log` calls (order payloads, wallet data) in `src/components/prescription/PaymentLayout.tsx`, `src/api/order.api.ts` — most others were already cleaned up in the earlier performance pass.
13. `caresure.app`/`api.caresure.dev` placeholder domains referenced as fallbacks — `src/lib/env.ts` (which has the `api.caresure.dev` fallback) is **dead code, unused anywhere in the app** — low real-world risk, safe to delete rather than fix.
14. `src/components/dev/DevTestButton.tsx` and a `'/test': '/search'` route mapping in `src/components/home/sections/BannerCarousel.tsx` — leftover dev scaffolding, currently harmless (flag defaults off) but worth removing before launch.
15. Search history "Clear"/"Delete item" handlers are no-ops (`src/components/search/SearchPageLayout.tsx:157-158`).

## 🟢 Corrections to Standard Security-Scanner Noise

- **"Firebase API key hardcoded"** — not a real vulnerability. Firebase Android/iOS config keys are designed to be public in the client binary; access is restricted via Firebase Security Rules + package-name/SHA-fingerprint restriction on Google's side, not by hiding the key. No action needed.
- **Privacy Policy / Terms of Service** — already implemented (backend-driven via `useMobileAppLinks()` + `PolicyLink`).
- **`app/frequent-orders.tsx` duplicate route** — already fixed (removed in this session).

## Suggested Fix Order

1. Mock coupons → wire to real API
2. `LIVE` flag + version bump as a pre-flight release checklist item
3. Crash reporting integration
4. The three stub buttons (Delete Account, Delete Prescription, Email verification)
5. Order rating/review screen
