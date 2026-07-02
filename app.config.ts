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
    "@react-native-firebase/crashlytics",
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
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow Caresure to use your location to show nearby pharmacies and deliver to your current location.",
      },
    ],
    "@react-native-community/datetimepicker",
    // NOTE: After any change to this plugin config, run: npx expo prebuild
    [
      "expo-notifications",
      {
        icon: "./assets/images/icon.png",
        color: "#0F7635",
        sounds: [],
        androidMode: "default",
        androidCollapsedTitle: "Caresure",
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
