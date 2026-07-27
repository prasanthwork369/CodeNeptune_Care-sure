# Production Release Validation (Play Store)

**Date:** 2026-07-27
**Scope:** Verification-only checklist for the CareSure Android production build. No code changes here — this records the current state and what must be true before uploading to Play.

---

## 🔴 Critical blockers — MUST fix before the production build

### 1. Production build currently connects to **QA**
`src/utils/urls.ts` resolves the API base URL from a manual flag, **not** from `EXPO_PUBLIC_APP_ENV`:

```ts
const LIVE = false;                               // urls.ts:3
const resolvedBaseUrl = LIVE ? PROD_URL : QA_URL; // urls.ts:7  → always QA
```

So even though `eas.json` sets `EXPO_PUBLIC_APP_ENV=production` for the production profile, the **API still points at QA** because `urls.ts` ignores that env var. (The *web* URL in `app.config.ts` does honor `EXPO_PUBLIC_APP_ENV`, so API and web can disagree.)

**Action (one of):**
- Quick: set `const LIVE = true;` in `urls.ts` immediately before the production build, **or**
- Proper (Phase-1 item #1, deferred): make `urls.ts` resolve from `EXPO_PUBLIC_APP_ENV` and hard-fail the production build if prod URLs are missing.

> ⚠️ Do not ship a production bundle with `LIVE = false` — customers would hit QA.

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
| Profile | `EXPO_PUBLIC_APP_ENV` | Android output |
|---|---|---|
| development | `development` | dev client |
| preview | `qa` | apk (internal) |
| production | `production` | **app-bundle** (.aab) ✅ correct for Play |

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
- [ ] `urls.ts` `LIVE = true` (or #1 implemented) — API points at PROD, not QA.
- [ ] EAS production profile has `EXPO_PUBLIC_API_BASE_URL_PROD` + `EXPO_PUBLIC_WEB_BASE_URL_PROD` set (valid HTTPS).
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
