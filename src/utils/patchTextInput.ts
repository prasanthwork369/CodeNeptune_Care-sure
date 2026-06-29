import React from "react";
import * as RN from "react-native";
// Deep import: same technique as patchText.ts — resolves to the real,
// unpatched TextInput component instead of looping back into this file.
import OriginalTextInputImport from "react-native/Libraries/Components/TextInput/TextInput";

const OriginalTextInput =
  OriginalTextInputImport as unknown as typeof RN.TextInput;

/**
 * TextInput.defaultProps does not work on this RN/React version (defaultProps
 * support for function/forwardRef components was removed) — so this has to be
 * injected as a render-time prop instead, mirroring patchText.ts's pattern.
 *
 * Respects the OS accessibility text-size setting (unless a specific
 * TextInput opts out), capped so it can't stack unbounded on top of the
 * app's own per-device moderateScale()/exactScale() sizing.
 */
const PatchedTextInput = React.forwardRef<RN.TextInput, RN.TextInputProps>(
  (props, ref) => {
    return React.createElement(OriginalTextInput, {
      ...props,
      ref,
      allowFontScaling:
        props.allowFontScaling !== undefined ? props.allowFontScaling : true,
      maxFontSizeMultiplier:
        props.maxFontSizeMultiplier !== undefined
          ? props.maxFontSizeMultiplier
          : 1,
    });
  },
);

// @ts-ignore
PatchedTextInput.displayName = "TextInput";
// @ts-ignore
PatchedTextInput.isPatched = true;

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
