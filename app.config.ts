import type { ConfigContext, ExpoConfig } from "expo/config";

const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? "development";
const rawWebUrl =
  appEnv === "production"
    ? (process.env.EXPO_PUBLIC_WEB_BASE_URL_PROD ?? "https://caresure.com")
    : (process.env.EXPO_PUBLIC_WEB_BASE_URL_QA ??
      "https://qa-caresure.codeneptune.com");

let webHost = "qa-caresure.codeneptune.com";
try {
  webHost = new URL(rawWebUrl).hostname;
} catch {
  // fallback if unparseable
}

// Single source of truth — reused for both `extra.eas.projectId` and the
// EAS Update URL below, so the two can never drift apart.
const easProjectId = "6e53d32b-6a5b-458e-9082-bbc1737ea34c";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Caresure",
  slug: "Caresure",
  owner: "prasanthwork",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "caresure",
  userInterfaceStyle: "automatic",
  // "fingerprint" (not "appVersion") because this app has custom native
  // modules and config plugins — it auto-detects when native code/config
  // actually changed and refuses to serve an OTA update to a binary it's
  // incompatible with, instead of blindly matching on the version string.
  runtimeVersion: {
    policy: "fingerprint",
  },
  updates: {
    url: `https://u.expo.dev/${easProjectId}`,
  },
  // New Architecture is the only architecture as of this RN version (the
  // config key was removed) — this project already opted in, so no behavior
  // change, just no longer a configurable option.
  ios: {
    bundleIdentifier: "com.codeneptune.caresure",
    supportsTablet: true,
    associatedDomains: [`applinks:${webHost}`],
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
    // Edge-to-edge is mandatory as of SDK 55 (no longer configurable) — the
    // explicit opt-in this project already had is now just default behavior.
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: webHost }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    // Only what the app actually needs. CAMERA covers capture, the prescription
    // scanner, and avatars; location powers nearby pharmacies + delivery.
    permissions: ["android.permission.INTERNET", "android.permission.CAMERA"],
    // Strip broad permissions that libraries (e.g. expo-image-picker) inject but
    // we don't need: the photo/PDF pickers use the system Photo Picker / Storage
    // Access Framework (no media-read permission), and SYSTEM_ALERT_WINDOW is unused.
    // Removing READ_MEDIA_IMAGES/READ_EXTERNAL_STORAGE avoids the Play Store
    // "Photos and videos" permission declaration. WRITE_EXTERNAL_STORAGE is kept
    // for PDF downloads on Android 9 and below.
    blockedPermissions: [
      "android.permission.READ_MEDIA_IMAGES",
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.SYSTEM_ALERT_WINDOW",
    ],
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    // Resolves the manifest-merger clash between expo-notifications and
    // @react-native-firebase/messaging over default_notification_color.
    "./plugins/withFirebaseNotificationColorFix",
    // R8 is off by default in the React Native template, which left ~50MB of
    // unshrunk dex — and ART roughly doubles that again on disk at install.
    [
      "expo-build-properties",
      {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          // Intercepts every request in dev builds; we use Flipper-free debugging.
          networkInspector: false,
          extraProguardRules: [
            "# Custom native modules are constructed reflectively via their ReactPackage.",
            "-keep class com.codeneptune.caresure.** { *; }",
            "",
            "# React Native resolves TurboModules, view managers and JNI targets by name.",
            "-keep class com.facebook.react.** { *; }",
            "-keep class com.facebook.jni.** { *; }",
            "-keep class com.facebook.hermes.** { *; }",
            "-keep @com.facebook.proguard.annotations.DoNotStrip class *",
            "-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }",
            "-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod <methods>; }",
            "",
            "# Expo's module registry looks modules up by class name at runtime.",
            "-keep class expo.modules.** { *; }",
            "",
            "# Firebase/GMS reflect over model classes; Crashlytics needs these for readable traces.",
            "-keep class com.google.firebase.** { *; }",
            "-keep class com.google.android.gms.** { *; }",
            "-keepattributes SourceFile,LineNumberTable,Signature,*Annotation*",
            "",
            "# notifee, reanimated worklets, PDF and ML Kit scanner natives.",
            "-keep class app.notifee.** { *; }",
            "-keep class com.swmansion.** { *; }",
            "-keep class com.shockwave.** { *; }",
            "-keep class com.google.mlkit.** { *; }",
            "",
            "-dontwarn okhttp3.**",
            "-dontwarn okio.**",
          ].join("\n"),
        },
      },
    ],
    "expo-asset",
    // Android-only: natively embeds the exact 5 Inter weights patchText.ts maps
    // every Text to, so they're registered with the OS font manager before the
    // JS bundle even runs — removing the runtime useFonts() wait this currently
    // costs on Android. No top-level/`ios` fonts key, so iOS is untouched and
    // keeps rendering system SF Pro exactly as before. Each entry's fontFamily
    // is registered verbatim via ReactFontManager.addCustomFont, so these names
    // reach JS unchanged — patchText.ts's family map needs no change.
    // Runtime gate (useAndroidInterFonts / app/_layout.tsx) is intentionally
    // still in place until this has been verified on a real Android build.
    [
      "expo-font",
      {
        android: {
          fonts: [
            {
              fontFamily: "Inter_400Regular",
              fontDefinitions: [
                { path: "./assets/fonts/Inter_400Regular.ttf", weight: 400 },
              ],
            },
            {
              fontFamily: "Inter_500Medium",
              fontDefinitions: [
                { path: "./assets/fonts/Inter_500Medium.ttf", weight: 500 },
              ],
            },
            {
              fontFamily: "Inter_600SemiBold",
              fontDefinitions: [
                { path: "./assets/fonts/Inter_600SemiBold.ttf", weight: 600 },
              ],
            },
            {
              fontFamily: "Inter_700Bold",
              fontDefinitions: [
                { path: "./assets/fonts/Inter_700Bold.ttf", weight: 700 },
              ],
            },
            {
              fontFamily: "Inter_800ExtraBold",
              fontDefinitions: [
                {
                  path: "./assets/fonts/Inter_800ExtraBold.ttf",
                  weight: 800,
                },
              ],
            },
          ],
        },
      },
    ],
    "expo-image",
    "expo-router",
    "expo-secure-store",
    "expo-sqlite",
    "expo-status-bar",
    "expo-updates",
    "expo-web-browser",
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
    // Registers notifee's local Maven repo (its native AAR lives in node_modules).
    "./plugins/withNotifeeRepo",
    // Keeps expo-image-picker's crop toolbar readable on light-themed devices.
    "./plugins/withCropScreenColors",
    // Copies native/android/ custom sources into the generated android/ project
    // and registers their ReactPackages — survives `expo prebuild --clean`.
    "./plugins/withCustomNativeFiles",
    // Lets Android Studio Profiler attach to release builds without debuggable=true.
    "./plugins/withProfileable",
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
      projectId: easProjectId,
    },
  },
});
