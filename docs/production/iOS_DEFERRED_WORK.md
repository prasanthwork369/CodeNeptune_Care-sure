# iOS Production Work (Deferred to Q1 2026)

Complete scope, timeline, and requirements for iOS launch after Android production stabilizes.

---

# OVERVIEW

## Status: 🔴 NOT READY FOR CURRENT PRODUCTION LAUNCH

### Blocker Issue
Web product links (`https://qa-caresure.codeneptune.com/medicines/...`) will **not** open the app on iOS. They open in Safari instead.

### Root Cause
Missing `apple-app-site-association` (AASA) file for Universal Links verification.

### Impact
iOS users cannot access app from web product links (email, web, social share, etc.). Custom scheme `caresure://` still works but is only used in notifications.

### Workaround
- ✅ In-app notification taps work (custom scheme)
- ✅ Custom scheme links work if user taps from mail/messages
- ❌ Web product links open in Safari (broken)

### Decision
**Defer iOS work to Q1 2026** — after Android production launches and stabilizes (2-4 weeks).

---

# REQUIREMENTS FOR iOS PRODUCTION

## 1. apple-app-site-association File

### What Is AASA?
- JSON file served by web server at `/.well-known/apple-app-site-association`
- Tells iOS that specific domains can open the app (Universal Links)
- iOS validates the file and trusts the domain

### Current State
- ❌ File does NOT exist on server
- ❌ Domain not verified for universal links
- ✅ `app.config.ts` declares associated domains (but without AASA, it's ignored)

### Required File

**Create:** `public/.well-known/apple-app-site-association`

**Content:**
```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.codeneptune.caresure",
        "paths": ["/medicines/*", "/otc/*", "/fmcg/*"]
      }
    ]
  }
}
```

**Replace `TEAM_ID`** with actual Apple Team ID from Apple Developer account.

### Deployment
1. Create file locally
2. Add to `public/.well-known/assetlinks.json` directory (already has Android version)
3. Deploy to production web server
4. Verify: `curl https://qa-caresure.codeneptune.com/.well-known/apple-app-site-association`

### Verification
- ✅ File returns 200 status
- ✅ Content is valid JSON
- ✅ Paths list matches app routes

---

## 2. iOS Team ID Configuration

### Current State
- ❌ Team ID not in `app.config.ts`
- ❌ Will use default Apple Developer Team ID (may not match)

### Required Action

**Update:** `app.config.ts` (iOS section, around line 41-45)

**Add:**
```typescript
ios: {
  bundleIdentifier: "com.codeneptune.caresure",
  supportsTablet: true,
  associatedDomains: [`applinks:${webHost}`],
  // ADD:
  team: "TEAM_ID",  // Apple Developer Team ID
},
```

### Obtaining Team ID
1. Log into [Apple Developer Account](https://developer.apple.com/account)
2. Go to Membership section
3. Find "Team ID" (usually 10-character code like `ABC1234567`)
4. Add to `app.config.ts`

---

## 3. Build Configuration (Associated Domains Capability)

### Current State
- ✅ `app.config.ts` declares associated domains
- ❌ Xcode may need explicit capability configuration

### Required Actions
1. Regenerate iOS build with `expo prebuild`
2. Open generated `ios/Caresure.xcworkspace` in Xcode
3. Select project → Signing & Capabilities
4. Add capability: "Associated Domains"
5. Verify: `applinks:${domain}` matches config
6. Commit changes (if Xcode-generated files tracked)

### Note
Expo should handle this automatically if `app.config.ts` is correct. Manual Xcode changes only if prebuild skips it.

---

## 4. Domain Verification Process

### What iOS Does
1. App installed
2. iOS sees `applinks:qa-caresure.codeneptune.com` in associated domains
3. Fetches `https://qa-caresure.codeneptune.com/.well-known/apple-app-site-association`
4. Validates JSON signature (no signature required in simple mode)
5. If domain in AASA file's appID, trusts all paths listed

### Verification Timing
- ✅ Instant (on app launch or domain change)
- ✅ Cached by iOS
- ⚠️ Can take 2-3 app launches for full verification

### Testing Verification
1. Install app from TestFlight
2. Open Settings > Developer Settings (if available)
3. Look for "Associated Domains" debugging info
4. Or: Click a universal link in Mail or Notes → should open app, not Safari

---

# TIMELINE: Q1 2026 (Post-Android Launch)

## Phase 1: Preparation (Week 1 after Android launch)
- [ ] **Android production stable** - No critical deep link issues reported (48+ hours)
- [ ] **Get Apple Team ID** - From Apple Developer account
- [ ] **Prepare AASA file** - Create JSON, test format locally
- [ ] **Update app.config.ts** - Add Team ID
- [ ] **Code review** - Verify changes

## Phase 2: Testing (Week 2)
- [ ] **Rebuild iOS** - `expo prebuild -p ios` with Team ID
- [ ] **Create TestFlight build** - EAS build for iOS
- [ ] **Internal testing** - 2-3 devices minimum
- [ ] **Test scenarios:**
  - [ ] Cold start with universal link
  - [ ] Foreground navigation
  - [ ] Background app resume
  - [ ] Invalid product ID
  - [ ] Web fallback (if domain different)

## Phase 3: Submission (Week 3)
- [ ] **Deploy AASA file** - To production domain
- [ ] **App Store submission** - Upload to App Store Connect
- [ ] **App Store review** - Usually 24-48 hours
- [ ] **Release** - Phased rollout or immediate

## Phase 4: Post-Launch (Week 4+)
- [ ] **Monitor crashes** - Crashlytics for iOS issues
- [ ] **Test universal links** - Real devices after app in App Store
- [ ] **Support tickets** - Watch for iOS-specific issues
- [ ] **Optional improvements** - App Store fallback for custom scheme

---

# TEST SCENARIOS (iOS)

### Scenario 1: Cold Start with Universal Link
```
1. Fresh iOS device (or app uninstalled)
2. Click: https://qa-caresure.codesure.codeneptune.com/medicines/aspirin/CS-0173
3. Expected: App installs/updates, opens to product
4. Verify: Product ID in URL, correct product displayed
5. Fails if: AASA file missing or domain not in appID
```

### Scenario 2: App Installed, Tap Link in Mail
```
1. App installed from App Store
2. Mail app open with product link
3. Long-press link → "Open in CareSure" option
4. Expected: App opens to product
5. Fails if: Associated domains not set up
```

### Scenario 3: Foreground Navigation
```
1. App open, on home screen
2. Click product link (from Notes, Safari, etc.)
3. Expected: App navigates to product without restart
4. Verify: No duplicate navigation, smooth transition
```

### Scenario 4: Link in Browser
```
1. Safari browser open with web product link
2. Click link
3. Expected: App opens (or "Open in CareSure" prompt)
4. Fails if: AASA not deployed or domain mismatch
```

### Scenario 5: Web Fallback (If Needed)
```
1. App not installed
2. Click product link
3. Expected: Safari opens web product page
4. Verify: Correct product shown on web
```

---

# DEPENDENCIES

### Must Be Done First
1. ✅ Android production launch (this allows parallel iOS prep)
2. ✅ Android stabilization (2-4 weeks, watch for critical issues)

### Must Be Available
- [ ] Apple Developer account with Team ID access
- [ ] iOS build environment (Xcode, provisioning profiles)
- [ ] Ability to deploy files to `public/.well-known/` on web server
- [ ] TestFlight access for internal testing

### No Dependencies On
- ❌ Android changes (iOS setup is independent)
- ❌ Backend changes (AASA is static file)
- ❌ App logic changes (deep link handler already works)

---

# KNOWN LIMITATIONS

### iOS Cannot Override Default Browser
- iOS enforces Safari as default for `https://` links
- App can claim via Universal Links, but user can still choose Safari
- ✅ Resolved: Once AASA deployed, iOS smart enough to open app

### Domain Must Have AASA
- Each domain claiming universal links must have AASA file
- ❌ `https://caresure.com` without AASA won't work
- ✅ QA domain will work once file deployed

### AASA Validation is Strict
- Invalid JSON → universal links fail silently
- Mismatched Team ID → links won't open app
- Test with: `curl https://domain/.well-known/apple-app-site-association`

---

# ROLLBACK PLAN

If iOS universal links broken after launch:

1. **Remove AASA file** - Delete from web server
2. **Revert app.config.ts** - Remove Team ID (if added)
3. **Rebuild** - `expo prebuild -p ios`
4. **Resubmit to App Store**
5. **Fallback behavior** - Custom scheme still works, web links open Safari (acceptable)

**Recovery time:** 1-2 hours (without App Store review)

---

# SUCCESS CRITERIA

✅ **iOS Deep Link Launch Complete When:**

- [ ] AASA file deployed and accessible
- [ ] App installed from App Store
- [ ] User clicks web product link
- [ ] Link opens in app (not Safari)
- [ ] Correct product displayed
- [ ] No crashes in Crashlytics
- [ ] Custom scheme still works

---

# EFFORT ESTIMATE

| Task | Estimate | Notes |
|------|----------|-------|
| AASA file creation | 30 min | One-time JSON file |
| Team ID setup in config | 15 min | One line in app.config.ts |
| Rebuild iOS | 30 min | `expo prebuild -p ios` |
| TestFlight build | 15 min | EAS build |
| Internal testing | 2 hours | 2-3 test devices |
| App Store submission | 1 hour | Upload + metadata |
| App Store review | 24-48 hours | Apple's process |
| Post-launch monitoring | 1 day | Watch for issues |

**Total Dev Effort:** ~4 hours  
**Total Calendar Time:** ~2 weeks (incl. App Store review)

---

# CONTACT & ESCALATION

**iOS Work Owner:** [To be assigned after Android launch]

**Decision Point:** 2 weeks after Android production (review stability)

**Escalation:** If Android critical issues found, defer iOS further

---

# FINAL NOTE

This work is **completely independent** from Android production. It can proceed in parallel with Android post-launch monitoring, but is explicitly **deferred** to allow team to focus on Android stability first.

