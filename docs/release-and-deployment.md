# Release & Deployment Guide 🚀

This document describes the compilation, optimization, and release procedures for **CareSure Customer** across Android and iOS using **EAS Build** and **EAS Update**.

---

## 1. EAS Build Profiles (`eas.json`)

CareSure defines four standard EAS build profiles:

| Profile | Channel | Platform Target | Build Artifact | Purpose |
|---|---|---|---|---|
| **`development`** | `development` | Android / iOS | Dev Client App | For local feature development with Metro hot-reloading. |
| **`preview`** | `preview` | Android | Standalone `.apk` | For internal QA testing and physical device verification without a PC. |
| **`internal`** | `internal` | Android / iOS | Signed `.aab` | Staging builds distributed via internal testing tracks. |
| **`production`** | `production` | Android / iOS | Signed `.aab` / `.ipa` | Release candidate for Google Play Store and Apple App Store. |

### Build Commands:
```bash
# Build a preview APK for Android QA:
eas build --profile preview --platform android

# Build production Android App Bundle:
eas build --profile production --platform android

# Build production iOS bundle:
eas build --profile production --platform ios
```

---

## 2. Android Build Optimization & R8 Minification

Release builds enable advanced code and resource shrinking to keep APK sizes minimal and prevent reverse engineering:

### Configured in `app.config.ts`:
- **Minification & Obfuscation**: `enableMinifyInReleaseBuilds: true` (ProGuard / R8).
- **Resource Shrinking**: `enableShrinkResourcesInReleaseBuilds: true` (strips unused images and XML layouts).
- **Heap Allocation Plugin (`plugins/withGradleJvmHeap.js`)**: Increases the Gradle daemon's JVM heap to `-Xmx4096m` to avoid out-of-memory errors during R8 full-mode compilation.

### Critical ProGuard Keep Rules (`app.config.ts`):
- Local native modules: `-keep class com.codeneptune.caresure.** { *; }`
- React Native JNI & Hermes runtime: `-keep class com.facebook.jni.** { *; }`
- Firebase Crashlytics & Analytics: `-keep class com.google.firebase.** { *; }`
- Notifee & Notification RemoteViews: `-keep class app.notifee.** { *; }`
- ML Kit Document Scanner: `-keep class com.google.mlkit.** { *; }`

---

## 3. Over-The-Air (OTA) Updates (`EAS Update`)

CareSure uses **EAS Update** with a strict **fingerprint runtime versioning policy**:

```typescript
// app.config.ts
runtimeVersion: {
  policy: "fingerprint",
}
```

### Why Fingerprint?
A "fingerprint" hashes all native code, config plugins, and dependencies. If you publish an OTA update, the Expo client ensures the update is only applied to binary builds that share the exact same native fingerprint. This completely prevents catastrophic app crashes caused by applying JS updates to outdated native binaries.

### Publishing an Update:
```bash
# Publish JS/asset update to production channel:
eas update --channel production --message "Fix: Cart coupon discount rounding"
```

---

## 4. Pre-Release Checklist

Before releasing a new build to the Google Play Store:

1. [ ] **Lint & Typecheck**: Run `npm run lint` and `npx tsc --noEmit` (Must have 0 warnings/errors).
2. [ ] **Unit Tests**: Run `npm test` (All suites passing).
3. [ ] **Version Bump**: Increment `version` and `android.versionCode` in `app.config.ts`.
4. [ ] **Verify ProGuard Minification**: Build a release candidate and verify on physical low-end Android devices (test for crashes on camera scan or notification arrival).
5. [ ] **Font Scaling Verification**: Verify that `patchText.ts` preserves UI layout integrity.
6. [ ] **Release Notes**: Prepare user-facing changelog for Play Store listing.
