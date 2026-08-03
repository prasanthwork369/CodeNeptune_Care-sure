import React from "react";
import {
  findNodeHandle,
  NativeModules,
  Platform,
  TextInput,
} from "react-native";

/**
 * Applies a native Android InputFilter to a React Native TextInput reference
 * to block non-digit characters at the OS level before they cause a layout/render flicker.
 */
/**
 * Restricts a TextInput to ASCII at the OS level. Stripping in `onChangeText` cannot work:
 * when the stripped text equals the previous value React sends no native update, so the
 * rejected character stays in the native buffer and the field stops responding.
 */
export const applyAsciiOnlyFilter = (ref: React.ComponentRef<typeof TextInput> | null) => {
  if (Platform.OS !== "android" || !ref) return;
  try {
    const tag = findNodeHandle(ref);
    if (tag && NativeModules.TextInputFilter?.applyAsciiOnly) {
      NativeModules.TextInputFilter.applyAsciiOnly(tag);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn("[TextInputFilter] Failed to apply ascii-only filter:", err);
    }
  }
};

export const applyDigitsOnlyFilter = (
  ref: React.ComponentRef<typeof TextInput> | null,
  maxLength = 0,
) => {
  if (Platform.OS !== "android" || !ref) return;
  try {
    const tag = findNodeHandle(ref);
    if (tag && NativeModules.TextInputFilter?.applyDigitsOnly) {
      NativeModules.TextInputFilter.applyDigitsOnly(tag, maxLength);
    }
  } catch (err) {
    if (__DEV__) {
      console.warn(
        "[TextInputFilter] Failed to apply digits-only filter:",
        err,
      );
    }
  }
};
