# Deep Link Production Status

## Overview
Complete deep link readiness assessment: Android (pending verification), iOS (blocked), and web fallback (ready).

---

# ANDROID PRODUCTION STATUS

## ✅ Ready for Production (Verified)

### Intent Filters & App Links
- ✅ autoVerify=true configured
- ✅ HTTPS scheme enforced
- ✅ Path prefixes scoped to product paths only (/medicines, /otc, /fmcg)
- ✅ Categories: BROWSABLE + DEFAULT
- ✅ Host dynamic from environment

### Native Intent Handler
- ✅ URL rewriting secure (no path traversal)
- ✅ URL decoding/re-encoding correct
- ✅ Query strings/fragments handled safely
- ✅ Malformed URLs fall back gracefully
- ✅ Type validation prevents unintended routes

### Product Screen
- ✅ Error handling for invalid product IDs
- ✅ Offline state detection
- ✅ Retry mechanism
- ✅ No auth blocker (can view as guest)

### Navigation
- ✅ No duplicate navigation handlers
- ✅ Safe during app initialization
- ✅ Works while app running/backgrounded/cold start

### Security
- ✅ Sensitive routes protected (login/otp/payment not deep-linkable)
- ✅ Query parameters safely ignored
- ✅ No sensitive data in URLs
- ✅ No localhost/dev URLs in code

---

## 🔴 Blocking Issues - MUST FIX

### Issue 1: Signing Certificate Fingerprint Verification
**Status:** UNVERIFIED - PRODUCTION BLOCKER

**Current State:**
- assetlinks.json contains: `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`
- Unknown if this is debug, QA, or production release key
- No signing key file in repo to verify against

**What Breaks If Wrong:**
- Android App Links verification fails
- Users click product links → browser instead of app ❌
- No fallback to show "Open in App" error

**Required Action:**
1. Get production release signing cert SHA256 from EAS
2. Compare with current assetlinks.json value
3. If match: Document verification ✅
4. If mismatch: Update assetlinks.json + redeploy to web server

**Evidence to Check:**
```bash
# After building release APK/AAB with EAS:
keytool -printcert -jarfile app-release.apk | grep SHA256
# or from EAS dashboard / EAS credentials
```

**File:** `assetlinks.json` (lines 7-9)

**Estimated Effort:** 30 minutes (get cert, verify, update, redeploy)

---

### Issue 2: Production Environment Variable Not Set
**Status:** RISK - WILL BREAK ON PRODUCTION BUILD

**Current State:**
- app.config.ts resolves domain from env var `EXPO_PUBLIC_WEB_BASE_URL_PROD`
- If unset: fallback to `https://caresure.com`
- eas.json production profile does NOT explicitly set this env var
- assetlinks.json is static (claims qa-caresure.codeneptune.com)

**What Breaks If Unset:**
1. Production build uses intent filters for `caresure.com`
2. assetlinks.json still claims `qa-caresure.codeneptune.com`
3. Domain mismatch → App Links verification fails
4. Users click links → browser instead of app ❌

**Required Action:**
1. Confirm `EXPO_PUBLIC_WEB_BASE_URL_PROD` is set in EAS production build env
2. If not set: Add to eas.json production profile
3. If production domain differs from current: Update assetlinks.json + redeploy

**Files to Check:**
- `eas.json` (production profile, line 25-35)
- Env vars in EAS dashboard / CI/CD

**Estimated Effort:** 15 minutes

---

## ⚠️ Recommended Improvements (Post-Launch OK)

### Optional: Add Product ID Format Validation
- Invalid IDs currently pass through → backend returns 404 → error screen
- Workaround is safe but could be faster
- **File:** `app/+native-intent.ts` line 21
- **Change:** Validate ID before rewriting
- **Impact:** Fail-fast for obviously invalid IDs
- **Priority:** Low (already safe)

### Optional: Custom Scheme Fallback
- `caresure://` links fail silently if app not installed
- Could redirect to Play Store instead
- **File:** `app/+native-intent.ts` (new handler)
- **Impact:** Better UX for notification links sent via email
- **Priority:** Low (web links already have fallback)

---

## Android Test Checklist Before Launch

- [ ] **Cold Start:** Click product link → App opens to correct product
- [ ] **Installed, Foreground:** Click link while app open → Navigates without restart
- [ ] **Installed, Background:** Click link while backgrounded → App resumes to product
- [ ] **Not Installed, QA Domain:** Click `https://qa-caresure.codeneptune.com/medicines/*/...` → Opens web page
- [ ] **Not Installed, Production Domain:** Click `https://caresure.com/medicines/*/...` → Opens web page (if using production domain)
- [ ] **Invalid Product ID:** Click `https://qa-caresure.codeneptune.com/medicines/aspirin/INVALID-ID` → Shows error screen, no crash
- [ ] **Empty ID:** Click `https://qa-caresure.codeneptune.com/medicines/aspirin/` → Falls back to web or shows error
- [ ] **Cert Fingerprint:** Verify assetlinks.json cert matches EAS production signing key

---

# iOS PRODUCTION STATUS

## 🔴 COMPLETELY BLOCKED - iOS NOT Ready

### Missing: apple-app-site-association File
**Status:** BLOCKER - iOS users cannot open web product links

**Current State:**
- `app.config.ts` declares `associatedDomains: ['applinks:${webHost}']` ✅
- No `apple-app-site-association` file on web server ❌
- iOS cannot verify domain trust
- Web product links open in Safari, not app ❌

**What Breaks:**
- User clicks `https://qa-caresure.codeneptune.com/medicines/aspirin/CS-0173`
- iOS App doesn't recognize it as universal link
- Opens in Safari instead of app
- Users see web, never get app experience ❌

**Custom Scheme Workaround (Partial):**
- `caresure://` links still work (custom scheme doesn't need verification)
- But notifications are only way to send custom scheme links
- Web product links (shared, email, etc.) won't work ❌

**Required Action:**
1. Create `/public/.well-known/apple-app-site-association` file
2. Configure Apple Team ID
3. Deploy to production domain
4. Add app capability in Xcode (build-time only)
5. Test on iOS device

**Related Issue:** Separate iOS work item — DO NOT ATTEMPT NOW

**Files to Create:**
- `public/.well-known/apple-app-site-association` (new)

**Estimated Effort:** 2-3 hours (setup, build, test)

---

## ⏸️ iOS Work Deferred
**Target:** Post-Android production (Q1 2026 or after Android launch stabilizes)

---

# WEB FALLBACK STATUS

## ✅ Production Ready

### Web Product URL Format
- ✅ `{WEB_BASE_URL}/{productType}/{slug}/{productId}`
- ✅ Matches app's expected path structure
- ✅ Generated correctly via `productWebUrl()` in `src/constants/urls.ts`

### Environment Configuration
- ✅ QA: `https://qa-caresure.codeneptune.com` (working)
- ⚠️ Production: Depends on env var being set in EAS

### Fallback Behavior
- ✅ App not installed → browser opens web page
- ✅ No localhost or dev URLs in production code
- ✅ All URLs from environment variables

### Sharing
- ✅ Product share link includes web URL
- ✅ Used in WhatsApp, SMS, etc.
- ✅ Format correct

---

# CUSTOM SCHEME STATUS

## ✅ Android - Installed App Works
- ✅ `caresure://product/{id}` opens product in app
- ✅ Used by notifications
- ✅ Works cold start / foreground / background

## ❌ Android - Not Installed Fails
- ❌ `caresure://` links fail silently
- ❌ No "Open in Play Store" fallback
- ⏸️ Can be added post-launch

## ⏸️ iOS - Custom Scheme Works But Limited
- ✅ `caresure://` custom scheme works
- ❌ No App Store fallback (separate iOS issue)
- ⏸️ Deferred with full iOS work

---

# SUMMARY: WHAT'S BLOCKING ANDROID PRODUCTION

| Issue | Type | Blocker? | Fix Time |
|-------|------|----------|----------|
| assetlinks.json cert verification | Verification | 🔴 YES | 30 min |
| Production env var set in EAS | Config | 🔴 YES | 15 min |
| ID format validation | Optional | ⏸️ No | 15 min |
| Custom scheme fallback | Optional | ⏸️ No | 30 min |

---

# SUMMARY: iOS Entirely Deferred

| Component | Status | Target |
|-----------|--------|--------|
| Universal Links (AASA file) | 🔴 MISSING | Post-Android (Q1 2026+) |
| Web product links on iOS | 🔴 BROKEN | Deferred |
| `caresure://` custom scheme | ✅ WORKS | Current (low value) |
| App Store fallback | 🔴 MISSING | Deferred |

---

