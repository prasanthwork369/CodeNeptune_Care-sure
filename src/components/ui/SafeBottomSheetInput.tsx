import { BottomSheetTextInput } from "@/src/components/ui/BottomSheetTextInput";
import React, { useEffect, useRef, useState } from "react";

/**
 * A BottomSheetTextInput that holds its text in LOCAL state so typing stays
 * smooth inside a bottom sheet. A fully-controlled `value={parentState}` forces
 * a parent re-render on every keystroke, which makes the input jump/jerk (and
 * can drop characters) inside @gorhom sheets. Here the parent `value` only
 * overrides the local text when it changes externally (e.g. a form reset).
 *
 * Same pattern as AddPatientSheet's SafeInput, extracted for reuse.
 */
export const SafeBottomSheetInput = React.forwardRef<
  React.ElementRef<typeof BottomSheetTextInput>,
  React.ComponentProps<typeof BottomSheetTextInput>
>(({ value, onChangeText, ...props }, ref) => {
  const [text, setText] = useState(value ?? "");
  const lastNotifiedValue = useRef(value);

  useEffect(() => {
    if (value !== lastNotifiedValue.current) {
      setText(value ?? "");
      lastNotifiedValue.current = value;
    }
  }, [value]);

  return (
    <BottomSheetTextInput
      {...props}
      ref={ref}
      value={text}
      onChangeText={(t) => {
        setText(t);
        lastNotifiedValue.current = t;
        onChangeText?.(t);
      }}
    />
  );
});

SafeBottomSheetInput.displayName = "SafeBottomSheetInput";
