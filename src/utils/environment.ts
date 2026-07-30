import Constants from "expo-constants";

// Expo Go doesn't support custom native modules (react-native-pdf,
// react-native-blob-util, react-native-otp-verify, etc.)
export const isExpoGo = Constants.appOwnership === "expo";
