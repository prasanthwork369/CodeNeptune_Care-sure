# CareSure Production Launch Checklist

Complete pre-production verification for Android, iOS (deferred), and web.

---

# PHASE 1: ANDROID PRODUCTION READY

## Deep Linking (Product Links)
- [ ] **assetlinks.json cert** - Verify fingerprint matches EAS production signing key
- [ ] **EXPO_PUBLIC_WEB_BASE_URL_PROD** - Confirm set in EAS production profile
- [ ] **Android cold start test** - Click product link, app opens to correct product
- [ ] **Android foreground test** - Click link while app open, navigates without restart
- [ ] **Android background test** - Click link while backgrounded, app resumes correctly
- [ ] **Web fallback test** - Click link with app uninstalled, web page opens
- [ ] **Invalid product ID** - Navigate to broken link, shows error (no crash)
- [ ] **Intent filters** - Verify only /medicines, /otc, /fmcg routes claimed

## Authentication
- [ ] **Auth initialization** - Token loaded before deep links processed
- [ ] **Guest access** - Product links work while logged out (no login redirect)
- [ ] **Auth token refresh** - Product loads correctly after token refresh
- [ ] **Session expiry** - Expired token shows login, not product screen
- [ ] **Login flow** - After login, can navigate to product (no loop)

## Network & Offline
- [ ] **Product online** - Loads and displays correctly with network
- [ ] **Product offline** - Shows offline state, retry button works
- [ ] **Socket connection** - Real-time cart/order updates work
- [ ] **Network reconnect** - Cached data shown, fresh fetch on reconnect
- [ ] **Slow network** - Product loads with visible loading state

## Performance
- [ ] **Product load time** - Measured with performance tracing
- [ ] **No duplicate API calls** - Single fetch per product navigation
- [ ] **Startup time** - App launch time within acceptable range
- [ ] **Memory usage** - No leaks during product navigation
- [ ] **Crash reporting** - Errors logged to Crashlytics

## Cart & Checkout
- [ ] **Add to cart from product** - Item added, cart count updates
- [ ] **Variant selection** - Select pack size, add to cart
- [ ] **Existing variant** - If product in cart, variant pre-selected
- [ ] **Cart navigation** - Can navigate to cart from product
- [ ] **Checkout from cart** - Proceeds without error

## Notifications
- [ ] **Product notification** - `caresure://product/{id}` works
- [ ] **Rich campaign notification** - Deep link opens product
- [ ] **Notification action** - Tap notification → product screen
- [ ] **Background notification** - App launches to product
- [ ] **Expired notification** - Old notification links still work

## Error Handling
- [ ] **404 product** - Shows retry state, not crash
- [ ] **Server error** - Shows error state with retry
- [ ] **Malformed URL** - Falls back to home or shows error
- [ ] **Empty product ID** - Handled gracefully
- [ ] **Missing dependencies** - Components render safely

## Security
- [ ] **Login link not deep-linkable** - `/login` protected
- [ ] **OTP link not deep-linkable** - `/otp` protected
- [ ] **Payment link not deep-linkable** - `/payment` protected
- [ ] **No sensitive data in URLs** - User tokens not exposed
- [ ] **Query params ignored** - UTM/tracking params don't affect routing
- [ ] **URL encoding safe** - Special characters handled correctly

---

# PHASE 2: iOS DEFERRED (Post-Launch)

## NOT READY FOR iOS PRODUCTION
All iOS work deferred until Android stabilizes.

### Blocked Issues
- 🔴 apple-app-site-association file missing
- 🔴 Web product links won't open app on iOS
- ⏸️ Custom scheme works but limited

### Target Timeline
- Post-Android launch (Q1 2026+)
- After Android production stabilizes (2-4 weeks)
- Separate iOS production checklist when work begins

### iOS Prep (Non-Blocking)
- [ ] **iOS Team ID obtained** - From Apple Developer account
- [ ] **Xcode project setup** - Associated domains capability ready
- [ ] **Build configuration** - Release build settings verified
- [ ] **Certificate handling** - Production signing cert ready

---

# PHASE 3: WEB & CROSS-PLATFORM

## Web Product Pages
- [ ] **Web product URL format** - Matches app's /medicines/{slug}/{id}
- [ ] **Web page loads** - No 404 or missing page
- [ ] **Web to app link** - If app installed, clicking web link opens app (Android only)
- [ ] **SEO/meta tags** - Product meta tags populated
- [ ] **Open Graph** - Social share shows product image/title

## Environment Configuration
- [ ] **QA domain working** - https://qa-caresure.codeneptune.com
- [ ] **Production domain set** - EXPO_PUBLIC_WEB_BASE_URL_PROD in EAS
- [ ] **API domain correct** - EXPO_PUBLIC_API_BASE_URL_PROD set
- [ ] **No hardcoded localhost** - Dev URLs not in production code
- [ ] **HTTPS enforced** - No HTTP fallback in production

## Sharing & Distribution
- [ ] **WhatsApp share** - Product link shareable via WhatsApp
- [ ] **SMS share** - Product link shareable via SMS
- [ ] **Email share** - Product link works from email
- [ ] **Social media** - Open Graph shows preview correctly
- [ ] **QR codes** - Scan product QR → product page

## Analytics & Tracking
- [ ] **Product view tracked** - Every product screen logs event
- [ ] **Deep link source** - Tracked which link type (web, app, notification)
- [ ] **Conversion tracking** - Add-to-cart tracked after deep link
- [ ] **Error tracking** - Broken links logged to Crashlytics
- [ ] **Performance metrics** - Load time measured and logged

---

# PHASE 4: GENERAL PRODUCTION READINESS

## API & Backend
- [ ] **Product API endpoint** - /api/v1/search/products/{id} working
- [ ] **Error responses** - 404 for missing product, 500 handling
- [ ] **API timeouts** - Set to 15 seconds (production)
- [ ] **Rate limiting** - No requests throttled
- [ ] **CORS** - Product requests allowed from app domain

## Build & Deployment
- [ ] **Release APK built** - `expo prebuild -p android` clean
- [ ] **Release AAB ready** - For Play Store distribution
- [ ] **EAS build logs** - No warnings or errors
- [ ] **Signing cert correct** - Release key, not debug
- [ ] **Version code** - Incremented correctly

## Database & Cache
- [ ] **SQLite cache** - Product cache working
- [ ] **Cache expiry** - Stale cache handled correctly
- [ ] **Offline fallback** - Product shown from cache when offline
- [ ] **Cache clearing** - Logout clears cached data

## Monitoring & Alerts
- [ ] **Crashlytics enabled** - Errors reported to Firebase
- [ ] **Performance monitoring** - Launch/load times tracked
- [ ] **Deep link errors** - Logged and alertable
- [ ] **Product 404s** - Tracked separately (user error vs. real issue)
- [ ] **Alert rules set** - Crash rate, performance thresholds

## Documentation
- [ ] **Deep link behavior documented** - DEEP_LINK_PRODUCTION_STATUS.md created
- [ ] **Known issues listed** - iOS deferred, optional improvements noted
- [ ] **Testing notes** - How to test deep links documented
- [ ] **Rollback plan** - What to do if deep links broken post-launch

## Team Readiness
- [ ] **Team briefed** - On-call team knows deep link issues
- [ ] **Support script** - Common issues and troubleshooting written
- [ ] **Escalation path** - Who to contact if deep links fail
- [ ] **Monitoring dashboard** - Set up for deep link errors
- [ ] **Incident response** - Plan if deep links broken on launch day

---

# PHASE 5: LAUNCH DAY (Android)

## Pre-Launch (24 hours before)
- [ ] **Final deep link test** - All scenarios passed locally
- [ ] **assetlinks.json deployed** - Verified on web server
- [ ] **EAS production build** - Release APK/AAB built successfully
- [ ] **Play Store submission** - Ready to upload
- [ ] **Rollback plan ready** - Know how to revert if needed

## Launch Day
- [ ] **Play Store upload** - APK/AAB uploaded to Google Play
- [ ] **Play Store release** - App published to production track (may take 2-4 hours to roll out)
- [ ] **Smoke tests** - Core features tested (login, product, cart)
- [ ] **Deep link smoke test** - Product link opens app
- [ ] **Monitor Crashlytics** - Watch for crashes after users update

## Post-Launch (First 24 hours)
- [ ] **Error rate monitored** - No sudden crash spike
- [ ] **Deep link success rate** - Check analytics for broken links
- [ ] **User feedback** - Monitor support for deep link issues
- [ ] **Performance baseline** - Product load time normal
- [ ] **Rollback ready** - If critical issue, plan fallback

---

# PHASE 6: iOS LAUNCH (Deferred, Q1 2026+)

This phase starts after Android production stabilizes (2-4 weeks post-launch).

- [ ] **AASA file created** - With correct format
- [ ] **iOS Team ID configured** - In app.config.ts
- [ ] **AASA deployed** - On production domain at /.well-known/apple-app-site-association
- [ ] **iOS build created** - With associated domains capability
- [ ] **iOS TestFlight testing** - Internal testing on real iOS devices
- [ ] **App Store submission** - iOS app uploaded
- [ ] **iOS smoke tests** - Product link opens app
- [ ] **Monitor crashes** - iOS Crashlytics for issues

---

# BLOCKERS BY PHASE

## Before Android Launch 🔴
- assetlinks.json cert fingerprint verification (BLOCKING)
- EXPO_PUBLIC_WEB_BASE_URL_PROD in EAS (BLOCKING)

## Before iOS Launch 🔴
- apple-app-site-association file (BLOCKING)
- iOS Team ID configuration (BLOCKING)
- Associated domains capability in build (BLOCKING)

## Optional Improvements ⏸️
- Product ID format validation
- Custom scheme fallback
- Install App prompt on web

---

# TEST SCENARIOS

### Scenario 1: Cold Start with Deep Link
```
1. App not installed
2. User clicks product link
3. Expected: App installs/updates, opens to product
4. Verify: Product ID in URL, correct product displayed
```

### Scenario 2: App Installed, Foreground
```
1. App open, on home screen
2. User clicks product link from email/web
3. Expected: App navigates to product without restart
4. Verify: No duplicate navigation, smooth transition
```

### Scenario 3: App Installed, Background
```
1. App backgrounded for 30+ seconds
2. User clicks product link
3. Expected: App resumes to product screen
4. Verify: State preserved, no re-initialization
```

### Scenario 4: Product Not Found
```
1. User clicks link: /medicines/aspirin/INVALID-ID
2. App installed
3. Expected: Shows error state with retry button
4. Verify: No crash, error logged to Crashlytics
```

### Scenario 5: No Network
```
1. App open, product cached
2. Disconnect network
3. Click product link (different product)
4. Expected: Shows offline state, can retry
5. Verify: Cached product not shown, error clear
```

### Scenario 6: Slow Network (Simulated)
```
1. Throttle network to 3G
2. Click product link
3. Expected: Loading skeleton visible, eventually loads
4. Verify: No timeout, smooth loading UX
```

### Scenario 7: Web Fallback
```
1. App not installed (uninstall or fresh device)
2. Click: https://qa-caresure.codeneptune.com/medicines/aspirin/CS-0173
3. Expected: Safari opens web product page
4. Verify: Correct product shown on web
```

### Scenario 8: Notification Deep Link
```
1. Receive push notification with product ID
2. Tap notification
3. Expected: App opens to product
4. Verify: Notification correctly formatted, link correct
```

---

# SIGN-OFF CHECKLIST

- [ ] Android deep link verified and tested ✅
- [ ] iOS deferred with documented timeline ⏸️
- [ ] Web fallback working ✅
- [ ] All blocking issues resolved ✅
- [ ] Optional improvements documented ⏸️
- [ ] Team briefed and ready ✅
- [ ] Monitoring set up ✅
- [ ] Rollback plan ready ✅

**Android Production Approved:** [Date: ___________]  
**By:** [Name: ___________]

**iOS Deferred Until:** Q1 2026 (post-Android stabilization)

---

