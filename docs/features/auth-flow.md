# Authentication & Session Architecture 🔐

This document describes the phone-number and OTP verification system, automatic SMS OTP extraction, token management, session recovery, and cart migration in **CareSure Customer**.

---

## 1. Authentication Architecture Overview

CareSure employs a token-based authentication mechanism optimized for mobile users:

```text
User opens Login Screen (/app/(auth)/login.tsx)
          │
          ├─► PhoneNumberHint (Native module prompts Google SIM selection)
          │
User submits 10-digit phone number
          │
          ▼
POST /api/v1/auth/request-otp (authApi.requestOtp)
          │
          ▼
User lands on Verify OTP Screen (/app/(auth)/verify-otp.tsx)
          │
          ├─► Android: react-native-otp-verify auto-reads incoming SMS hash
          │
User submits 6-digit OTP code
          │
          ▼
POST /api/v1/auth/verify-otp (authApi.verifyOtp)
          │
          ├── On Success:
          │     1. Store accessToken in SecureStore / AsyncStorage
          │     2. Set user profile in authStore
          │     3. Merge local guest cart into user account (mergeGuestCartItems)
          │     4. Check for pending notification deep links
          │     5. Navigate to Home / Target Screen
          │
          └── On Failure:
                Display error feedback, allow resend after 30s cooldown
```

---

## 2. Key Components & Native Modules

### 1. `PhoneNumberHint` (`modules/phone-number-hint`)
A local Expo native module that interfaces with Google Play Services' Phone Number Hint API. On Android devices, when the login screen mounts, the OS presents a bottom sheet enabling the user to tap their active SIM phone number rather than typing it manually.

### 2. Automatic SMS OTP Retrieval (`react-native-otp-verify`)
On Android devices, the `useOtp` hook initializes `useOtpVerify`:
- Listens for SMS messages containing the app's unique SMS Retriever hash code.
- Automatically parses the 6-digit verification code.
- Fills the OTP inputs and triggers submission without requiring user copy-pasting or SMS permissions.

### 3. Guest Cart Migration (`mergeGuestCartItems`)
If an unauthenticated user adds medicines to their cart and subsequently logs in during checkout:
- `cartStore` items stored in local `AsyncStorage` are gathered.
- `mergeGuestCartItems` sends these items to the backend cart sync endpoint.
- Local guest items are merged into the persistent user cart so no items are lost.

---

## 3. Session Persistence & Token Storage (`src/lib/storage.ts`)

- **Primary Storage**: `expo-secure-store` encrypts authentication tokens using hardware-backed keystores (Android Keystore / iOS Keychain).
- **Fallback Storage**: In environments where hardware keystores are unavailable, tokens fall back gracefully to `AsyncStorage`.
- **Session Restoration**: When the app boots, `authStore.initialize()` reads stored credentials from `tokenStorage.get()`, sets the HTTP `apiClient` Bearer token, and loads the cached user profile synchronously from SQLite (`apiCache.get("customer_profile")`) for instant first paint before background validation.

---

## 4. 401 Unauthorized & Session Expiry (`src/api/client.ts`)

The Axios HTTP client binds a global unauthorized handler:
```typescript
setUnauthorizedHandler(() => {
  // 1. Clears JWT token from SecureStore
  // 2. Resets authStore
  // 3. Wipes SQLite cache to prevent account leakage (apiCache.clear())
  // 4. Redirects navigation to login screen
  router.replace("/(auth)/login");
});
```
