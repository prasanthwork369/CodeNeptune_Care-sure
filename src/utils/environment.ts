import Constants, { ExecutionEnvironment } from "expo-constants";

// Expo Go doesn't support custom native modules (react-native-pdf,
// react-native-blob-util, react-native-otp-verify, etc.). `appOwnership` is
// deprecated and unreliably reports `null` (instead of "expo") inside recent
// Expo Go clients, which silently disabled every isExpoGo guard in the app.
// `executionEnvironment` is Expo's current recommended check, and since this
// project always ships its own native code (native/android/), any non-Expo-Go
// run is "bare"/"standalone" here, never "storeClient".
export const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
