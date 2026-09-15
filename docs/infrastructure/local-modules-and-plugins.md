# Local Native Modules & Config Plugins Architecture 🔌

This document details the local Android **Expo Native Modules** located in `modules/` and the custom **Expo Config Plugins** located in `plugins/`.

---

## 1. Local Native Expo Modules (`modules/`)

CareSure implements custom native Android capabilities as local Expo Modules using Kotlin and `expo-module.config.json`. Their TypeScript bridge wrappers live in `src/modules/`.

```text
modules/
├── in-app-update/                  # Google Play In-App Updates
│   ├── android/src/main/java/.../InAppUpdateModule.kt
│   └── expo-module.config.json
├── native-notifications/           # Custom RemoteViews layout notifications
│   ├── android/src/main/java/.../NativeNotificationsModule.kt
│   └── expo-module.config.json
├── phone-number-hint/              # Google Play Services SIM autofill picker
│   ├── android/src/main/java/.../PhoneNumberHintModule.kt
│   └── expo-module.config.json
└── text-input-filter/              # Native Android uppercase / alphanumeric filters
    ├── android/src/main/java/.../TextInputFilterModule.kt
    └── expo-module.config.json
```

### 1. `in-app-update` (`src/modules/InAppUpdate.ts`)
- Bridges the Google Play Core In-App Update API.
- Supports **Immediate Updates** (mandatory updates for versions below `minSupportedVersion`) where the OS displays a full-screen Play Store download modal.
- Supports **Flexible Updates** (background download with an in-app "Restart to Update" snackbar).

### 2. `phone-number-hint` (`src/modules/PhoneNumberHint.ts`)
- Interfaces with Google Identity Services' `Identity.getSignInClient(activity).getPhoneNumberHintIntent()`.
- Presents a native Android bottom sheet containing the device's verified SIM numbers on the login screen, eliminating manual phone entry.

### 3. `native-notifications` (`src/modules/ProductOfferNotification.ts`, `RichCampaignNotification.ts`)
- Uses Android `RemoteViews` to construct custom XML notification layouts with rich graphics, strike-through prices, and dual action buttons.

### 4. `text-input-filter` (`src/modules/TextInputFilter.ts`)
- Implements Android `InputFilter` at the native view level to strictly enforce uppercase formatting on coupon code and referral code inputs without React state re-render lag.

---

## 2. Custom Expo Config Plugins (`plugins/`)

Config plugins execute at compile/prebuild time during `npx expo prebuild`. They modify Android Gradle files, manifests, and native resources before compilation:

| Plugin File | Modified Target | Purpose |
|---|---|---|
| **`withCropScreenColors.js`** | `android/app/src/main/res/values/styles.xml` | Fixes an `expo-image-picker` issue where the crop toolbar buttons became invisible against white system bars on light theme devices. |
| **`withFirebaseNotificationColorFix.js`** | `android/app/src/main/AndroidManifest.xml` | Resolves icon and color attribute collisions between Firebase Cloud Messaging and `expo-notifications`. |
| **`withGradleJvmHeap.js`** | `android/gradle.properties` | Injects `org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m` to prevent Gradle daemon Out-Of-Memory (OOM) failures during R8 release minification. |
| **`withNotifeeRepo.js`** | `android/build.gradle` | Injects Notifee's local Maven repository path into Android root repository definitions. |
| **`withProfileable.js`** | `android/app/src/main/AndroidManifest.xml` | Injects `<profileable android:shell="true" />` into application tags, allowing developers to profile release builds in Android Studio Profiler without disabling ProGuard. |

---

## 3. Prebuild Rule: Never Edit `android/` Directly

The `android/` directory is gitignored and is wiped/regenerated whenever `npx expo prebuild` is executed. Any native Kotlin changes, AndroidManifest adjustments, or Gradle configurations **must** be implemented via `modules/` or `plugins/`.
