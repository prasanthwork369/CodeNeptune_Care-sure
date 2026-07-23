import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Caresure",
  slug: "Caresure",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "caresure",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    bundleIdentifier: "com.codeneptune.caresure",
    supportsTablet: true,
    // Universal Links. Requires an apple-app-site-association file served at
    // https://<domain>/.well-known/ listing this app's Team ID + bundle id.
    // Add the production domain here once the LIVE flip happens.
    associatedDomains: ["applinks:qa-caresure.codeneptune.com"],
  },
  android: {
    package: "com.codeneptune.caresure",
    versionCode: 1,
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/icon.png",
      backgroundColor: "#FFFFFF",
    },
    softwareKeyboardLayoutMode: "resize",
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    // App Links. autoVerify makes Android open these URLs directly in the app
    // (no chooser) — but only once /.well-known/assetlinks.json at the domain
    // lists the RELEASE keystore's SHA-256. Add the prod domain after go-live.
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: "qa-caresure.codeneptune.com" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    permissions: [
      "android.permission.INTERNET",
      "android.permission.SYSTEM_ALERT_WINDOW",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.CAMERA",
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    "expo-sqlite",
    "@react-native-firebase/app",
    "@react-native-firebase/analytics",
    "@react-native-firebase/crashlytics",
    "@react-native-firebase/messaging",
    "@react-native-firebase/perf",
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Caresure to access your photos to upload prescriptions.",
        cameraPermission:
          "Allow Caresure to use your camera to take a photo of your prescription.",
      },
    ],
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 120,
        resizeMode: "contain",
        backgroundColor: "#F4FAF5",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow Caresure to use your location to show nearby pharmacies and deliver to your current location.",
      },
    ],
    "@react-native-community/datetimepicker",
    // NOTE: After any change to this plugin config, run: npx expo prebuild
    [
      "expo-notifications",
      {
        // Android masks the status-bar icon to a single color using its alpha,
        // so this MUST be a transparent white silhouette (not the full-colour
        // icon.png, which renders as a solid square). White CareSure logo on
        // real transparency.
        icon: "./assets/images/notification-icon.png",
        color: "#FFFFFF",
        sounds: [],
        androidMode: "default",
        androidCollapsedTitle: "Caresure",
      },
    ],
    // Resolves the manifest-merger clash between expo-notifications and
    // @react-native-firebase/messaging over default_notification_color.
    "./plugins/withFirebaseNotificationColorFix",
    // Registers notifee's local Maven repo (its native AAR lives in node_modules).
    "./plugins/withNotifeeRepo",
    // Keeps expo-image-picker's crop toolbar readable on light-themed devices.
    "./plugins/withCropScreenColors",
    [
      "react-native-document-scanner-plugin",
      {
        cameraPermission:
          "Allow Caresure to use your camera to scan prescriptions.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    apiBaseUrl:
      process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.caresure.dev",
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? "development",
    eas: {
      projectId: "8af7d922-a6f0-45a5-8c9d-d51ba283e5c2",
    },
  },
});
