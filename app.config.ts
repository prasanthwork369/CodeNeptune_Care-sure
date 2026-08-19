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

// Single EAS Project ID source of truth to prevent configuration drift
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
  // Use fingerprint policy to prevent incompatible OTA updates on custom native/plugin changes
  runtimeVersion: {
    policy: "fingerprint",
  },
  updates: {
    url: `https://u.expo.dev/${easProjectId}`,
  },
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
    predictiveBackGestureEnabled: false,
    intentFilters: [
      {
        action: "VIEW",
        autoVerify: true,
        data: [{ scheme: "https", host: webHost }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    // Required camera permission for prescription scans and avatars
    permissions: ["android.permission.INTERNET", "android.permission.CAMERA"],
    // Strip unused permissions injected by libraries to avoid Play Store permission declarations
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
    // Resolve notification color clash between expo-notifications and firebase
    "./plugins/withFirebaseNotificationColorFix",
    // Increase JVM heap size to prevent OOM during R8 build minification
    "./plugins/withGradleJvmHeap",
    [
      "expo-build-properties",
      {
        android: {
          enableMinifyInReleaseBuilds: true,
          enableShrinkResourcesInReleaseBuilds: true,
          networkInspector: false,
          extraProguardRules: [
            "# Keep custom native modules",
            "-keep class com.codeneptune.caresure.** { *; }",
            "",
            "# Keep React Native native JNI classes",
            "-keep class com.facebook.react.** { *; }",
            "-keep class com.facebook.jni.** { *; }",
            "-keep class com.facebook.hermes.** { *; }",
            "-keep @com.facebook.proguard.annotations.DoNotStrip class *",
            "-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }",
            "-keepclassmembers class * { @com.facebook.react.bridge.ReactMethod <methods>; }",
            "",
            "# Keep Expo modules",
            "-keep class expo.modules.** { *; }",
            "",
            "# Keep Firebase and Play Services classes for Crashlytics tracking",
            "-keep class com.google.firebase.** { *; }",
            "-keep class com.google.android.gms.** { *; }",
            "-keepattributes SourceFile,LineNumberTable,Signature,*Annotation*",
            "",
            "# Keep Notifee, Reanimated, PDF, and ML Kit scanner native classes",
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
    // Embed custom Inter fonts natively on Android to avoid runtime font loading delay
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
    // NOTE: Run npx expo prebuild after editing plugin configurations
    [
      "expo-notifications",
      {
        // Android notification icon must be a transparent white silhouette
        icon: "./assets/images/notification-icon.png",
        color: "#FFFFFF",
        sounds: [],
        androidMode: "default",
        androidCollapsedTitle: "Caresure",
      },
    ],
    "./plugins/withNotifeeRepo",
    // Fix expo-image-picker crop toolbar visibility on light themes
    "./plugins/withCropScreenColors",
    // Enable Android Studio profiling in release builds
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
