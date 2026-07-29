# CareSure audit — handoff

Paste this whole file as your first prompt. It is the complete state of an in-progress screen-by-screen audit.

---

## Your role

You are a Principal React Native / Expo engineer maintaining **CareSure**, a production pharmacy app. A screen-by-screen audit is underway. Continue it.

**Working directory:** `c:\Code Neptune\App_Development\CodeNeptune_Care-sure`

Read `CLAUDE.md` first — it has the project rules (NativeWind, Zustand, Expo Router, exact Figma replication, no new libraries without asking).

---

## Non-negotiable working rules

These came from the user directly. Breaking them wastes their time.

1. **Comments are ONE line.** Never a multi-line block, never a JSDoc paragraph. State *why*, not *what*. The user has corrected this repeatedly.
2. **Never run builds.** No `expo run:android`, `expo start`, `expo prebuild`, `npm run android`. Hand the command over and let the user run it. Diagnostics (`adb`, `tsc`, `eslint`, `jest`, `curl`) are fine.
3. **Commit directly to `main`.** No feature branches, no PRs unless asked.
4. **Single-line commit messages.** No body paragraphs.
5. **Don't do standalone `any`-type cleanup passes.** Tighten types only in files you're already touching.
6. **Keep concerns in separate files**, follow SOLID — screens compose, logic lives in hooks/services.
7. **Do NOT touch `src/components/auth/SignupBonusPopup.tsx`.** It works; it is also modified in the working tree by someone else.
8. **Preserve exact visual appearance.** Never change UI design, test IDs, API payloads, React Query keys, Zustand behaviour, analytics names, or navigation destinations.

---

## Verify after every change

```bash
npx tsc --noEmit -p tsconfig.json     # must be 0 errors
npx eslint <changed paths>
npx jest --silent                     # must stay 42 suites / 200 tests
```

Never report something as working unless these actually ran. Never claim device or iOS verification — **nothing has been run on a device this entire audit.**

---

## The plan

A tracker artifact lists all **87 screens, bottom sheets, modals and states**, built from the designer's Figma list:
https://claude.ai/code/artifact/bbe9ea69-e505-4985-8a74-faee13f423ac

Work it top to bottom. **~18 of 87 audited.**

Order: Auth (done) → Home & discovery → Cart & checkout → Prescription → Patients → Address → Orders → Returns → Wallet → Profile & support → small modals.

For each screen: read every related file, check the bug patterns below, fix only low-risk items, verify, commit.

---

## Bug patterns already proven in this codebase

Look for these first — each was found multiple times.

| Pattern | What to grep |
|---|---|
| **Whole-store Zustand subscription** | `useXStore()` with no selector. All 15 fixed, but new ones appear. |
| **RN Modal mounted while hidden** | Fixed at source in `CardOptionsMenu`, `AlertDialog`, `AlreadyHaveItemsModal`. Any *other* component rendering `<Modal visible={false}>` has the same bug. Gorhom `BottomSheetModal` is portal-based and fine. |
| **Inline `ref={(el) => …}` with a side effect** | Re-invoked every render. Found in `LoginForm` and `OtpForm`. |
| **Component declared inside render** | Creates a new type each pass → React remounts the subtree. Found in `ReturnProductLayout`. |
| **`React.memo` defeated by unstable props** | `useCart()` returns fresh arrows each render. Found in `OrderCard`. |
| **Timer with no cleanup** | Found in `useCartCalculations`, `AddMoneyLayout`, `SplashAnimationScreen`, `OrderTrackingLayout`. |
| **Unnecessary `as any` on routes** | ~79 remain. `tsc` usually proves they're removable — one was hiding a real type hole. |
| **Raw pixel values instead of `exactScale`** | `OrderCard` is the worst offender. Needs device check before changing. |

---

## Committed today (10 commits on `main`)

```
0aa0887  Hoist return refund radio out of render and fix reflect typo
a34eb40  Stop RN modals mounting a native window while hidden
b2cf117  Fix order card memo and stop mounting a modal per order row
22661c7  Remove unsafe route casts from notification navigation
7b182fe  Clear the Add Money back-timer on unmount
5832c62  Replace whole-store zustand subscriptions with field selectors
4f10b1f  Stop mounting one hidden Modal per notification row
1e031a1  Fix coupon APPLIED label wrapping to a clipped second line
3a1bc19  Fix cart timer leak, store subscriptions and guest checkout ordering
c82e1ad  Fix home feed re-renders, banner autoplay effects and hero skeleton
cb9d2dd  Fix login screen perf, double-open legal links and stale API error
```

## Uncommitted right now — verified, needs pushing

1. **Splash** — slow-load bar could flash in mid-fade; timer now cleared on completion
2. **OTP** — stable ref callback, static box styles, removed duplicate Skip, 2 unused imports
3. **Legal links fallback** — `useMobileAppLinks` now falls back to `WEB_BASE_URL` paths
4. **Comment pass** — ~25 comments compressed to one line

Also in the tree but **NOT yours**: `src/components/auth/SignupBonusPopup.tsx`, `.claude/settings.local.json`. Leave both.

---

## Three blockers — backend, not code

Ask the user to chase these. Nothing in the app can fix them.

1. **`prefillOtp` — possible account takeover.** `useLogin` reads `res.data.otp` and pre-fills the OTP screen. If production `/api/v1/customers/auth/request-otp` returns the OTP, anyone can log into any phone number. Verify with a curl against prod.
2. **`maxDiscountPerOrder: 0` — web and mobile do opposite things.** Mobile treats 0 as a hard cap (no credits). Web (`Backend/customer-website/src/lib/utils/cart-utils.ts`) treats 0 as "no cap" (full balance). Same cart, different amount charged.
3. **`/api/v1/push-notifications/test` ignores the request body.** It overwrites `data` and `android`, so `data.type` never arrives and tap-routing can't be tested. Confirmed via logcat: device received `data: {badge: "0"}`.

---

## Environment notes

- **API currently points at QA.** `src/utils/urls.ts` line 3: `const LIVE = false`. `.env.local`'s `EXPO_PUBLIC_API_ENV` is a **dead variable** — nothing reads it.
- **`EXPO_PUBLIC_WEB_BASE_URL_PROD` is unset**, so share links fall back to the QA host even in a production build.
- **Web codebase for parity checks:** `c:\Code Neptune\Backend\customer-website` (Next.js). There is an older stale copy at `App_Development\W\customer-website` — don't use it. Neither is a git repo.
- **Existing parity audit:** `docs/business-logic-parity-audit.md` — written against the stale copy, so re-verify before acting.

---

## Known gaps, deliberately not fixed

- **`NotificationsLayout`** renders up to 50 rows in a `ScrollView` with no virtualisation. Wants `SectionList`. Real change, needs device QA.
- **`OrderCard`** uses raw pixels, and its status badge sits behind a fixed `paddingRight: 110` — a long status like `OUT FOR DELIVERY` may overlap the order ID on a narrow screen.
- **Cart footer total** may clip at <360 dp with the largest system font.
- **8 files over 500 lines:** `LocationBottomSheet` 809, `ReturnProductLayout` 816, `ComparisonBoard` 748, `OrderTrackingLayout` 699, `NotificationsLayout` 692, `AddPatientSheet` 653, `HomeLayout` 600, `SelectPatientLayout` 596.
- **158 lint warnings** project-wide (mostly unused vars and `exhaustive-deps`). The 3 lint *errors* are `react/display-name` in test mocks only — harmless.

---

## Start here

1. Read `CLAUDE.md`.
2. Run the three verify commands to confirm a clean baseline.
3. Ask the user whether to push the four uncommitted items first.
4. Continue the tracker from **Home & discovery** — `SearchPageLayout` (225 lines) is the next unaudited screen.
