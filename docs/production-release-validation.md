# Production Release Validation (Play Store)

**Date:** 2026-07-27
**Scope:** Verification-only checklist for the CareSure Android production build. No code changes here — this records the current state and what must be true before uploading to Play.

---

## 🔴 Critical blockers — MUST fix before the production build

### 1. ~~Production build currently connects to QA~~ — FIXED 2026-07-30

The manual `const LIVE = false` flag is gone. `src/utils/urls.ts` now resolves from
`EXPO_PUBLIC_APP_ENV` (same switch `app.config.ts` already used), so API and web URLs
can no longer disagree with the EAS profile, and the production profile in `eas.json`
is now sufficient to point the app at prod.

To test against prod locally, set `EXPO_PUBLIC_APP_ENV=production` in `.env.local` — do
not edit source.

**This makes blocker #2 fail loudly instead of silently.** A production build with the
prod URL env vars missing (or not `https://`) now **throws at startup** rather than
falling back to QA. That is deliberate, but it means #2 is now a hard launch dependency.

### 2. Production URL env vars must be available to the EAS build

`urls.ts` **throws at startup** if the base URL is undefined:

```ts
if (!resolvedBaseUrl) throw new Error("Missing API base URL …");
```

`eas.json` → `build.production.env` only sets `EXPO_PUBLIC_APP_ENV`. The URL vars
(`EXPO_PUBLIC_API_BASE_URL_PROD`, `EXPO_PUBLIC_WEB_BASE_URL_PROD`, and the QA pair)
are **not** in `eas.json` and are **not** committed (they live in `.env.local`).

**Action:** define them as **EAS environment variables / secrets** for the production profile (or add to `eas.json` `build.production.env`). Confirm a production build actually inlines `EXPO_PUBLIC_API_BASE_URL_PROD` and it is a valid HTTPS prod URL.

---

## ✅ Verified good (this session)

### Environment (EAS profiles) — `eas.json`

| Profile     | `EXPO_PUBLIC_APP_ENV` | Android output                            |
| ----------- | --------------------- | ----------------------------------------- |
| development | `development`         | dev client                                |
| preview     | `qa`                  | apk (internal)                            |
| production  | `production`          | **app-bundle** (.aab) ✅ correct for Play |

### Merged manifest (release) — verified via `processReleaseMainManifest`

- Broad media/overlay permissions **stripped** from the shipped app: `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE`, `SYSTEM_ALERT_WINDOW` (via `android.blockedPermissions`).
- Kept: `INTERNET`, `CAMERA`, `WRITE_EXTERNAL_STORAGE` (downloads on Android ≤9), `ACCESS_FINE/COARSE_LOCATION`.
- `usesCleartextTraffic="true"` is present only in the **debug** manifest (`android/app/src/debug/`), not release — good.

### Native config

- `google-services.json` package `com.codeneptune.caresure` **matches** `app.config.ts` `android.package` ✅ (project `codeneptune-66e72`).
- `firebase.json`: `crashlytics_debug_enabled: false`, auto-collection on for crashlytics/perf/analytics — correct for production.
- Custom native modules (TextInputFilter, PhoneNumberHint, ProductOfferNotification) copied by `withCustomNativeFiles` and their gradle deps (`play-services-auth`) injected — build verified `assembleDebug` SUCCESSFUL.

---

## ☑️ Pre-submit checklist (run before uploading the .aab)

**Environment / endpoints**

- [x] API points at PROD, not QA — now driven by `EXPO_PUBLIC_APP_ENV` (#1 implemented).
- [ ] EAS production profile has `EXPO_PUBLIC_API_BASE_URL_PROD` + `EXPO_PUBLIC_WEB_BASE_URL_PROD` set (valid HTTPS). **The app now crashes on launch without these.**
- [ ] Smoke-test the production build hits the prod backend (login/OTP against prod).

**Versioning** (`app.config.ts`)

- [ ] `version` / `versionCode` — currently `1.0.0` / `1` (correct for first upload; **bump `versionCode` for every subsequent upload**).

**Signing**

- [ ] EAS holds the **production upload keystore** (managed credentials) — same key across releases.
- [ ] App's SHA-256 registered in **Firebase** (phone auth / App Links) and in **`assetlinks.json`** (Android App Links autoverify for `https://<web host>`).

**Native / services**

- [ ] Production `google-services.json` in place (current file is project `codeneptune-66e72` — confirm it's the prod Firebase project).
- [ ] Push notifications delivered on a production build (FCM registration + tap deep-link).
- [ ] Crashlytics reporting on the production build (native — verify a test crash appears).

**Permissions (Play Console)**

- [ ] No "Photos and videos" declaration required — broad media permissions removed ✅.
- [ ] Data safety form matches actual data use.

**Manual smoke test on a real device (release build)**

- [ ] Login · OTP · offline startup (session preserved) · logout (clean state)
- [ ] Guest cart merge (partial-failure keeps items)
- [ ] Checkout · order creation (total = calculated) · idempotency (retry ≠ duplicate, once backend honors it)
- [ ] Prescription upload (gallery + camera + PDF) on **Android 10–12 and 13+** ← permissions change
- [ ] PDF / invoice download to Downloads

---

## Still requires backend / external

- **Order idempotency** — backend must dedupe on `Idempotency-Key` (see the idempotency contract).
- **Order rating/review** — no endpoint (feature gap, not a release blocker).

## Notes

- No code was changed for this validation item (#9). Blockers #1/#2 above are the deferred env-resolution work (Phase-1 #1), intentionally skipped this cycle — they **must** be resolved at build time.
