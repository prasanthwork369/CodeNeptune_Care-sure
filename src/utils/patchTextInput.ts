import React from "react";
import * as RN from "react-native";
// Deep import: same technique as patchText.ts — resolves to the real,
// unpatched TextInput component instead of looping back into this file.
import OriginalTextInputImport from "react-native/Libraries/Components/TextInput/TextInput";

import { sanitizeStyle } from "./patchText";

const OriginalTextInput =
  OriginalTextInputImport as unknown as typeof RN.TextInput;

/**
 * TextInput.defaultProps does not work on this RN/React version (defaultProps
 * support for function/forwardRef components was removed) — so this has to be
 * injected as a render-time prop instead, mirroring patchText.ts's pattern.
 *
 * Matches patchText.ts: the OS accessibility text-size setting is ignored
 * entirely by default so it can't affect layout/spacing at all — text always
 * renders at the exact Figma-designed size via moderateScale()/exactScale().
 */
const PatchedTextInput = React.forwardRef<RN.TextInput, RN.TextInputProps>(
  (props, ref) => {
    const sanitizedStyle = sanitizeStyle(props.style);
    return React.createElement(OriginalTextInput, {
      ...props,
      ref,
      allowFontScaling:
        props.allowFontScaling !== undefined ? props.allowFontScaling : false,
      style: [
        { fontFamily: undefined, includeFontPadding: false }, // Default reset
        sanitizedStyle,
      ],
    });
  },
);

// @ts-ignore
PatchedTextInput.displayName = "TextInput";

try {
  Object.defineProperty(RN, "TextInput", {
    get() {
      return PatchedTextInput;
    },
    configurable: true,
    enumerable: true,
  });
} catch (e) {
  try {
    // @ts-ignore
    RN.TextInput = PatchedTextInput;
  } catch (err) {
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
