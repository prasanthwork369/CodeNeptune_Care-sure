# CareSure Customer — Mobile Application 🏥📱

> Production-grade online pharmacy mobile application for browsing medicines, managing prescriptions, and getting healthcare products delivered to your door. Built with **React Native**, **Expo**, **TypeScript**, **NativeWind**, **Zustand**, and **React Query**.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack & Key Libraries](#tech-stack--key-libraries)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Getting Started & Installation](#getting-started--installation)
- [Environment Configuration](#environment-configuration)
- [Development Workflow](#development-workflow)
- [Running on Android & iOS](#running-on-android--ios)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Builds & Release Pipeline](#builds--release-pipeline)
- [Documentation Index](#documentation-index)

---

## Overview

**CareSure Customer** is an end-to-end customer-facing pharmacy application designed to deliver a fast, reliable, and offline-resilient healthcare shopping experience. The app connects directly to the CareSure backend API, providing intelligent product search, generic medicine substitutions, native prescription document scanning, real-time cart synchronization, address management with automatic geolocation, and loyalty rewards (CareSure Coins).

---

## Key Features

- 🔍 **Medicine & OTC Catalogue**: Browse by categories, subcategories, or search with instant debounce and auto-suggestions.
- 💊 **Generic Alternatives & Substitutes**: Compare branded medications with lower-cost generic equivalents.
- 📸 **Prescription Scanner & Upload**: Native document edge-detection scanner (`react-native-document-scanner-plugin`), camera/gallery upload, PDF viewing, and draft management.
- 🛒 **Real-Time Cart & Live Sync**: Add-to-cart with stock verification, real-time WebSocket cart updates (`useCartSocketSync`), and guest cart migration.
- 🎟️ **Coupons & CareSure Coins**: Apply dynamic discount codes and redeem loyalty coins against order totals.
- 📍 **Location & Delivery Serviceability**: Geolocation-based address lookup (`expo-location`), reverse geocoding, and pincode serviceability verification.
- 📦 **Order Tracking**: Real-time order lifecycle tracking, order history, invoice download, and return requests.
- 🔔 **Rich & Dynamic Notifications**: Hybrid push messaging combining Firebase Cloud Messaging (FCM), Notifee, and custom native Android notification templates.
- 📴 **Offline-First Resilience**: 6-layer offline handling, proactive request blocking when unreachable, global `NetworkToast` status banner, and SQLite local caching.
- 🚀 **In-App & OTA Updates**: Google Play In-App Updates (Flexible & Immediate) paired with EAS Update fingerprint runtime policies.

---

## Tech Stack & Key Libraries

| Category | Technologies |
|---|---|
| **Core Framework** | [Expo](https://expo.dev) `~57.0.15` (Prebuild / Dev Client workflow), [React Native](https://reactnative.dev) `0.86.2`, [React](https://react.dev) `19.2.3` |
| **Language & Tooling** | [TypeScript](https://www.typescriptlang.org) `~6.0.3` (Strict mode), Node.js `20+` |
| **Routing & Navigation** | [Expo Router](https://docs.expo.dev/router/introduction/) `~57.0.15` (File-based navigation with typed routes) |
| **Styling & UI** | [NativeWind](https://www.nativewind.dev/) `^4.2.3` (Tailwind CSS v3.4), `@gorhom/bottom-sheet`, `@shopify/flash-list` |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) `^5.0.12` (Persistent with AsyncStorage and SecureStore) |
| **Data Fetching & Cache** | [@tanstack/react-query](https://tanstack.com/query/latest) `^5.100.5`, [Axios](https://axios-http.com/) `^1.15.0`, [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/) |
| **Hardware & Native** | `react-native-document-scanner-plugin`, `react-native-pdf`, `expo-location`, `expo-image-picker`, `expo-haptics`, `expo-secure-store` |
| **Push Notifications** | `@react-native-firebase/messaging`, `@notifee/react-native`, Custom Android Native RemoteViews modules |
| **Monitoring & Telemetry**| `@react-native-firebase/crashlytics`, `@react-native-firebase/perf`, `@react-native-firebase/analytics` |
| **Testing** | [Jest](https://jestjs.io/) `^29.7.0`, `@testing-library/react-native` `^13.3.3`, [Maestro](https://maestro.mobile.dev/) for E2E flows |

---

## Project Architecture

The project follows a clean separation between **routing** (`app/`), **domain logic** (`src/features/`), **shared infrastructure** (`src/lib/`, `src/services/`, `src/store/`), and **native modules** (`modules/`, `plugins/`):

```text
Care-sure_Customer/
├── app/                          # Expo Router routes & layout definitions only
│   ├── (auth)/                   # Authentication flows (Login, OTP)
│   ├── (catalog)/                # Category browsing and product listings
│   ├── (commerce)/               # Cart, Coupons, and Order confirmation
│   ├── (prescription)/           # Upload, scanner, PDF preview, patient selection
│   ├── (tabs)/                   # Bottom tab navigator (Home, Categories, Upload, Profile)
│   ├── _layout.tsx               # Root provider stack, AppGate, and crash monitoring
│   └── +native-intent.ts         # Deep link URL normalizer & rewrite engine
├── src/
│   ├── api/                      # Raw HTTP API clients, endpoints, and error normalization
│   ├── components/               # Reusable UI components grouped strictly by feature
│   ├── constants/                # Centralized assets, images, typography, and status codes
│   ├── features/                 # Self-contained business feature modules
│   ├── hooks/                    # Feature queries, mutations, and UI hooks
│   ├── lib/                      # Infrastructure (react-query client, sqlite, secure storage)
│   ├── modules/                  # TypeScript bridge interfaces for local Expo modules
│   ├── services/                 # Complex business services (notifications, sync, analytics)
│   ├── store/                    # Zustand client state stores (auth, cart, checkout, location)
│   ├── theme/                    # Design tokens, color palette, transitions
│   ├── types/                    # Shared TypeScript interfaces
│   └── utils/                    # Pure helpers, formatters, and offline-handling primitives
├── modules/                      # Local native Expo Modules (Kotlin implementations for Android)
├── plugins/                      # Custom Expo config plugins executed during prebuild
├── .maestro/                     # Maestro E2E test flows
└── docs/                         # Comprehensive project documentation
```

---

## Prerequisites

Before setting up the project, ensure your workstation has:

- **Node.js**: `v20.x` or higher (LTS recommended)
- **npm**: `v10.x` or higher
- **Java Development Kit (JDK)**: JDK 17 (Required for Android build compatibility)
- **Android Studio**: Android SDK, Platform Tools (adb), and Android Build Tools installed
- **Xcode** *(macOS only)*: Required for iOS simulator and device builds
- **EAS CLI** *(Optional, for cloud builds)*: `npm install -g eas-cli`

---

## Getting Started & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/prasanthwork369/CodeNeptune_Care-sure.git
   cd CodeNeptune_Care-sure
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy the example environment template to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(See [Environment Configuration](#environment-configuration) below for details).*

---

## Environment Configuration

The app uses `EXPO_PUBLIC_*` environment variables loaded by Expo. Configure your `.env.local`:

```bash
# Target environment: "development" | "qa" | "production"
EXPO_PUBLIC_APP_ENV=development

# Backend API base URLs
EXPO_PUBLIC_API_BASE_URL_QA=https://qa-api.caresure.codeneptune.com
EXPO_PUBLIC_API_BASE_URL_PROD=https://api.caresure.com

# Web store origin used for App Links / Universal Links
EXPO_PUBLIC_WEB_BASE_URL_QA=https://qa-caresure.codeneptune.com
EXPO_PUBLIC_WEB_BASE_URL_PROD=https://caresure.com
```

For complete details on environment behavior and backend dynamic settings overrides, read [`docs/environment.md`](docs/environment.md).

---

## Development Workflow

### Starting Metro Bundler
```bash
npm start
# or clear Metro cache if experiencing bundle issues:
npx expo start -c
```

### Running on Android
This project contains custom native modules and plugins, requiring an **Expo Dev Client** build (not standard Expo Go):
```bash
npm run android
```
*This command runs `expo prebuild -p android` and compiles the app to your connected device/emulator via Gradle.*

### Running on iOS *(macOS only)*
```bash
npm run ios
```

---

## Testing & Quality Assurance

Automated checks run on every pull request via GitHub Actions (`.github/workflows/ci.yml`):

```bash
# Run unit & component tests via Jest
npm test

# Run tests in interactive watch mode
npm run test:watch

# Generate code coverage report
npm run test:coverage

# Run ESLint validation
npm run lint

# Run TypeScript strict type-checking
npx tsc --noEmit
```

For end-to-end testing with Maestro, see [`docs/testing-guide.md`](docs/testing-guide.md).

---

## Builds & Release Pipeline

The app uses **EAS Build** with configured build profiles in `eas.json`:

```bash
# Build internal preview APK for testing on physical devices:
eas build --profile preview --platform android

# Build production Android App Bundle (AAB) for Google Play:
eas build --profile production --platform android

# Publish Over-The-Air (OTA) runtime update via EAS Update:
eas update --channel production --message "Fix: checkout billing discount precision"
```

For detailed release procedures, ProGuard keep rules, and versioning policies, consult [`docs/release-and-deployment.md`](docs/release-and-deployment.md).

---

## Documentation Index

Explore the full documentation suite in the [`docs/`](docs/) directory:

- 🎓 **[Junior Developer KT Guide](docs/junior-developer-kt.md)** — Step-by-step onboarding, flow walkthroughs, and 14-day learning roadmap.
- 🏗️ **[System Architecture](docs/architecture.md)** — Boot lifecycle, providers, AppGate, and crash telemetry.
- 🗺️ **[Navigation & Deep Links](docs/navigation-and-routes.md)** — Expo Router structure, App Links, and `+native-intent.ts`.
- 🗄️ **[State Management & Data Layer](docs/state-and-data.md)** — All 18 Zustand stores, React Query patterns, and SQLite cache.
- ⚙️ **[Environment & Dynamic Settings](docs/environment.md)** — Build environments, `.env.local`, and backend kill switches.
- 🧪 **[Testing & QA Guide](docs/testing-guide.md)** — Jest mocks, React Native Testing Library, and Maestro E2E flows.
- 🚀 **[Release & Deployment SOP](docs/release-and-deployment.md)** — EAS profiles, ProGuard/R8 rules, and OTA updates.

### Feature Specifications
- 🔐 **[Authentication Flow](docs/features/auth-flow.md)** — Phone input hint, OTP auto-read, token storage, and session refresh.
- 📄 **[Prescription Flow](docs/features/prescription-flow.md)** — Native document scanner, draft management, PDF rendering, upload.
- 🛍️ **[Commerce & Checkout](docs/features/commerce-checkout.md)** — Cart state, WebSocket sync, billing engine, coupons, checkout.
- 📍 **[Location & Serviceability](docs/features/location-serviceability.md)** — Reverse geocoding, pincode verification, address book.

### Infrastructure & Native
- 📴 **[Offline Architecture & Sync](docs/infrastructure/offline-and-sync.md)** — 6-layer offline handling, `NetworkToast`, and sync queue.
- 🔔 **[Push Notifications](docs/infrastructure/notifications.md)** — FCM + Notifee hybrid setup, native RemoteViews templates.
- 🔌 **[Local Native Modules & Plugins](docs/infrastructure/local-modules-and-plugins.md)** — Local Kotlin Expo modules and Config Plugins.
