import React from "react";
// Uses the same Android Inter and iOS SF Pro rules as Text.
// eslint-disable-next-line no-restricted-imports
import * as RN from "react-native";
// Metro lets this patch import the original component without recursing.
import OriginalTextInputImport from "react-native/Libraries/Components/TextInput/TextInput";
// Fallback for the TextInput.State static used by @gorhom/bottom-sheet.
// @ts-ignore - internal RN module without bundled type declarations
import TextInputState from "react-native/Libraries/Components/TextInput/TextInputState";

import { applyAsciiOnlyFilter } from "../modules/TextInputFilter";
import { sanitizeStyle } from "./patchText";

const OriginalTextInput =
  OriginalTextInputImport as unknown as typeof RN.TextInput;

const PatchedTextInput = React.forwardRef<RN.TextInput, RN.TextInputProps>(
  (props, ref) => {
    const sanitizedStyle = sanitizeStyle(props.style);

    // English-only input, applied natively so the keyboard cannot defeat it. Numeric fields
    // add their own digits-only filter afterwards, which supersedes this one.
    const setRef = React.useCallback(
      (node: RN.TextInput | null) => {
        applyAsciiOnlyFilter(node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    return React.createElement(OriginalTextInput, {
      ...props,
      ref: setRef,
      allowFontScaling: props.allowFontScaling ?? false,
      keyboardType: props.keyboardType ?? "ascii-capable",
      // Off on both platforms: autocorrect fights English-only entry and can rewrite what was typed.
      // spellCheck is an iOS-only prop; React Native ignores it on Android.
      autoCorrect: props.autoCorrect ?? false,
      spellCheck: props.spellCheck ?? false,
      style: [{ includeFontPadding: false }, sanitizedStyle],
    });
  },
);

// @ts-ignore
PatchedTextInput.displayName = "TextInput";

// Preserve original statics for React Native and library compatibility.
const patchedStatics = PatchedTextInput as unknown as Record<string, unknown>;
const originalStatics = OriginalTextInput as unknown as Record<string, unknown>;
for (const key of Object.keys(OriginalTextInput)) {
  if (patchedStatics[key] === undefined) {
    patchedStatics[key] = originalStatics[key];
  }
}

// State may be non-enumerable, so preserve it explicitly.
if (patchedStatics.State === undefined) {
  patchedStatics.State = originalStatics.State ?? TextInputState;
}

try {
  Object.defineProperty(RN, "TextInput", {
    get() {
      return PatchedTextInput;
    },
    configurable: true,
    enumerable: true,
  });
} catch {
  try {
    // @ts-ignore
    RN.TextInput = PatchedTextInput;
  } catch (err) {
    if (__DEV__)
      console.error(
        "Failed to globally patch react-native TextInput component:",
        err,
      );
  }
}

// @ts-ignore
PatchedTextInput.default = PatchedTextInput;
// @ts-ignore
module.exports = PatchedTextInput;
export default PatchedTextInput;
