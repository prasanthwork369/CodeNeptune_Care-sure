import React from "react";
// Patches RN internals, so it needs the raw module.
// eslint-disable-next-line no-restricted-imports
import * as RN from "react-native";
// Deep import: same technique as patchText.ts — resolves to the real,
// unpatched TextInput component instead of looping back into this file.
import OriginalTextInputImport from "react-native/Libraries/Components/TextInput/TextInput";
// The focus/blur registry (currentlyFocusedInput, focusTextInput, ...) that RN
// and @gorhom/bottom-sheet expect at `TextInput.State`.
// @ts-ignore - internal RN module without bundled type declarations
import TextInputState from "react-native/Libraries/Components/TextInput/TextInputState";

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

// Carry over the original TextInput's static properties onto the wrapper.
// The critical one is `State` (currentlyFocusedInput / focusTextInput /
// blurTextInput): RN internals and libraries like @gorhom/bottom-sheet access
// `TextInput.State.currentlyFocusedInput()`. Without this, that read is
// `undefined.currentlyFocusedInput` and crashes when focusing an input inside
// a bottom sheet.
for (const key of Object.keys(OriginalTextInput)) {
  // @ts-ignore
  if ((PatchedTextInput as any)[key] === undefined) {
    // @ts-ignore
    (PatchedTextInput as any)[key] = (OriginalTextInput as any)[key];
  }
}
// Explicit fallback in case `State` is a non-enumerable static: use the
// original's if present, otherwise the TextInputState module directly.
// @ts-ignore
if ((PatchedTextInput as any).State === undefined) {
  // @ts-ignore
  (PatchedTextInput as any).State =
    (OriginalTextInput as any).State ?? TextInputState;
}

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
