# Environment & Configuration Guide ⚙️

This document describes environment variable setup, build-time configurations in `app.config.ts`, and runtime configuration overrides served by the CareSure backend.

---

## 1. Environment Variable Files

CareSure uses standard Expo public environment variables prefixed with `EXPO_PUBLIC_`:

| File | Status | Description |
|---|---|---|
| **`.env.example`** | Tracked in Git | Template containing all required variable names and default QA URLs. |
| **`.env.local`** | Gitignored | Local developer configuration containing actual target URLs and secrets. |

### Configuration Variables
```bash
# Target environment: "development" | "qa" | "production"
EXPO_PUBLIC_APP_ENV=development

# Backend API base endpoints
EXPO_PUBLIC_API_BASE_URL_QA=https://qa-api.caresure.codeneptune.com
EXPO_PUBLIC_API_BASE_URL_PROD=https://api.caresure.com

# Web store origin used for App Links / Universal Links
EXPO_PUBLIC_WEB_BASE_URL_QA=https://qa-caresure.codeneptune.com
EXPO_PUBLIC_WEB_BASE_URL_PROD=https://caresure.com
```

---

## 2. Dynamic Build Configuration (`app.config.ts`)

Expo loads `app.config.ts` dynamically at bundle and prebuild time. It evaluates `EXPO_PUBLIC_APP_ENV` to set build metadata:

1. **Web Host Extraction**: Automatically extracts the domain from the active web base URL and registers it in `ios.associatedDomains` and `android.intentFilters` for Universal Links / App Links.
2. **EAS Project ID**: Fixed to `6e53d32b-6a5b-458e-9082-bbc1737ea34c` to prevent build drift across developer machines.
3. **Runtime Version Policy**: Configured as `{ policy: "fingerprint" }` to prevent incompatible OTA updates when native modules or plugins change.
4. **Extra Constants**: Exposes `extra.apiBaseUrl` and `extra.appEnv` through `expo-constants`.

---

## 3. Runtime Backend Settings Overrides (`useSettings`)

The application queries `/api/v1/settings/customer-website` on launch. These remote settings dynamically control mobile app behavior without requiring app store updates:

### App Version & Maintenance Policy
```json
{
  "minSupportedVersion": "1.0.0",
  "latestVersion": "1.2.0",
  "maintenanceMode": false,
  "maintenanceMessage": "We are upgrading our servers. Please check back at 3 PM."
}
```
- If installed version `< minSupportedVersion`: App is immediately blocked via `AppGateScreen` and prompts for an in-app update.
- If installed version `< latestVersion`: App displays a dismissible `SoftUpdateModal`.
- If `maintenanceMode === true`: App is blocked with the maintenance message.

### Dynamic Feature Kill-Switches
The backend can selectively disable features during high traffic or server maintenance:
```json
{
  "features": {
    "substitutesEnabled": true,
    "couponsEnabled": true,
    "prescriptionUploadEnabled": true,
    "walletTopUpEnabled": true,
    "whatsappOrderEnabled": true,
    "callOrderEnabled": true
  }
}
```
> ⚠️ **Fail-Safe Design**: All feature flags default to `true` locally. If the settings call fails or is missing a field, features remain enabled to avoid disrupting user experience.
