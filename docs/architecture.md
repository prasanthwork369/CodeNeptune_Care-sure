# System Architecture & Lifecycle Guide 🏛️

This document describes the foundational runtime architecture, entry lifecycle, provider topology, and app gating mechanisms in **CareSure Customer**.

---

## 1. High-Level Architecture Overview

CareSure is architected around a layered, reactive design that isolates UI components from low-level networking, state storage, and device drivers:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│    app/ (Expo Router Routes) + src/components/ (Sections)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Domain & Business Layer                  │
│   src/features/ + src/hooks/ (Queries, Mutations, UI hooks)  │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
┌──────────────▼──────────────┐ ┌──────────────▼──────────────┐
│       State Management      │ │      Data & API Services     │
│   src/store/ (Zustand)      │ │  src/api/ & src/services/   │
│  AsyncStorage / SecureStore │ │  React Query Cache & SQLite │
└──────────────┬──────────────┘ └──────────────┬──────────────┘
               │                               │
┌──────────────▼───────────────────────────────▼──────────────┐
│                  Native & Platform Layer                     │
│    Expo SDK + Local Expo Modules (/modules/) + Plugins      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Boot Sequence & Entry Lifecycle

The application initialization sequence is split across three key boundaries:

### Step 1: Root Entry (`index.js`)
Before the UI router boots, Android headless background tasks must be registered so that incoming push messages from Firebase FCM or Notifee can execute even when the application is completely killed:

```javascript
// index.js
import "./src/services/firebase/messaging/backgroundHandler";
import "./src/services/notifications/notifeeBackgroundHandler";
import "expo-router/entry";
```

### Step 2: Global Service Initialization (`app/_layout.tsx`)
At module load time, non-React infrastructure is initialized immediately:
- `initDb()`: Initializes the local SQLite database (`src/lib/sqlite/db.ts`) and sets up key-value cache tables.
- `initCrashReporting()`: Binds global unhandled promise rejection handlers to Firebase Crashlytics.
- `patchText.ts` & `patchTextInput.ts`: Locks `allowFontScaling: false` to enforce Figma typography metrics across varying OS font sizes.

### Step 3: Provider Hierarchy (`app/_layout.tsx`)
The React component tree wraps the entire routing stack with essential context providers:

```text
GestureHandlerRootView (Gesture system)
 └─ SafeAreaProvider (Safe area insets)
     └─ KeyboardProvider (react-native-keyboard-controller)
         └─ QueryClientProvider (React Query client)
             └─ BottomSheetModalProvider (@gorhom/bottom-sheet)
                 └─ AppGate (Version & Maintenance Guard)
                     ├─ CartSyncProvider (WebSocket live cart listener)
                     ├─ PushNotificationProvider (FCM token sync)
                     ├─ Stack (Expo Router navigation stack)
                     ├─ NetworkToast (Global offline banner)
                     ├─ SoftUpdateModal / UpdateReadyBanner
                     ├─ GlobalAlertDialog & Toast
                     └─ SignupBonusPopup
```

---

## 3. App Gate Subsystem (`useAppGate`)

The `AppGate` component guards the application against running unsupported versions or continuing when the backend is under maintenance:

```text
                      useSettings()
                           ↓
             Is Maintenance Mode Active?
              ├── YES ──> Render AppGateScreen ("Maintenance Mode")
              │
             Is Current Version < minSupportedVersion?
              ├── YES ──> Render AppGateScreen ("Update Required")
              │           Trigger InAppUpdate (Immediate Play Store flow)
              │
             Is Current Version < latestVersion?
              ├── YES ──> Allow entry + Show dismissible SoftUpdateModal
              │
              └── NO  ──> Allow Normal Application Entry
```

### Key Design Principles:
1. **Fail-Open Policy**: If the network request fails, settings fail to parse, or the device is offline, the gate remains open. It never locks users out due to a transient network error.
2. **Foreground Recheck Throttle**: Rechecks backend version policies when the app is foregrounded, throttled to at most once every 60 seconds (`RECHECK_THROTTLE_MS = 60_000`).
3. **Developer Gate Override**: In development (`__DEV__`), developers can toggle between normal, maintenance, and update preview screens via `DevPreviewToggler`.

---

## 4. Real-Time Infrastructure Providers

Mounted inside `_layout.tsx`, these headless background providers synchronize client state without rendering visual DOM:

### 1. `CartSyncProvider` (`useCartSocketSync`)
- Opens a lightweight WebSocket connection with the CareSure backend.
- Listens for server-side cart changes (e.g. item price change, prescription rejection, or out-of-stock notification).
- Automatically invalidates the React Query cart cache (`queryKeys.cart()`), prompting a silent UI refresh.

### 2. `PushNotificationProvider` (`usePushNotifications`)
- Requests notification permissions on first launch.
- Registers the device FCM push token with the CareSure backend user profile.
- Listens for foreground notifications and displays rich banners via Notifee.

### 3. Navigation State Restoration (`useLastRouteStore`)
- Tracks current route transitions via `usePathname()` and `useGlobalSearchParams()`.
- Persists safe screen paths to `AsyncStorage`.
- On cold launch, restores deep screens (e.g. cart or product) if the session was recently active.

---

## 5. Crash Reporting & Performance Telemetry

- **Crashlytics**: Caught and uncaught errors are recorded via `src/services/firebase/crashReporting.ts`. Non-fatal errors are logged with device metadata (`deviceInfo.ts`).
- **Performance Traces**: Key transaction traces (`PERF_TRACES`) measure app startup duration, search query latency, and checkout completion time using `@react-native-firebase/perf`.
- **ProGuard / R8 Rules**: Configured in `app.config.ts` to keep native Firebase, Hermes JNI, and Notifee classes during release minification.
