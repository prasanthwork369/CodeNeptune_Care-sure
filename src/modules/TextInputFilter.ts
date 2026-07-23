import { findNodeHandle, NativeModules, Platform, TextInput } from "react-native";

/**
 * Applies a native Android InputFilter to a React Native TextInput reference
 * to block non-digit characters at the OS level before they cause a layout/render flicker.
 */
export const applyDigitsOnlyFilter = (ref: any, maxLength = 0) => {
  if (Platform.OS !== "android" || !ref) return;
  try {
    const tag = findNodeHandle(ref);
    if (tag && NativeModules.TextInputFilter?.applyDigitsOnly) {
      NativeModules.TextInputFilter.applyDigitsOnly(tag, maxLength);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn("[TextInputFilter] Failed to apply digits-only filter:", err);
    }
  }
};
