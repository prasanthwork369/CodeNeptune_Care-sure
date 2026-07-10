import { BottomSheetTextInput as GorhomBottomSheetTextInput } from "@gorhom/bottom-sheet";
import React from "react";

type BottomSheetTextInputProps = React.ComponentProps<
  typeof GorhomBottomSheetTextInput
>;

/**
 * App-wide BottomSheetTextInput.
 *
 * The raw component from @gorhom/bottom-sheet wraps RN's TextInput but is
 * imported straight from the library, so it bypasses our global RN.TextInput
 * patch (patchTextInput.ts) — meaning on a device with a large OS font setting
 * its text renders oversized. This thin wrapper sets `allowFontScaling={false}`
 * once so every bottom-sheet input inherits it.
 *
 * Import BottomSheetTextInput from HERE, not from @gorhom/bottom-sheet. A
 * specific instance can still override by passing `allowFontScaling`.
 */
export const BottomSheetTextInput = React.forwardRef<
  React.ElementRef<typeof GorhomBottomSheetTextInput>,
  BottomSheetTextInputProps
>((props, ref) => (
  <GorhomBottomSheetTextInput allowFontScaling={false} {...props} ref={ref} />
));

BottomSheetTextInput.displayName = "BottomSheetTextInput";
