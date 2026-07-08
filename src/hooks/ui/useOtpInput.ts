import { useEffect, useRef, useState } from "react";
import { Keyboard, TextInput } from "react-native";

const OTP_LENGTH = 6;

/**
 * Reusable OTP box-input logic — the same hidden-TextInput-behind-6-boxes
 * behaviour used on the login screen, but with NO auth/SMS/navigation coupling
 * so any screen can reuse it (e.g. email verification).
 *
 * It owns the typed digits, the in-place-edit selection, and the active box,
 * and calls `onComplete(code)` once 6 digits are entered by normal typing.
 * The login flow keeps its own richer useOtp (SMS autofill, cart merge); this
 * is deliberately the smaller, shared piece.
 */
export const useOtpInput = (onComplete: (code: string) => void) => {
  const inputRef = useRef<TextInput | null>(null);
  const [otp, setOtp] = useState("");
  const [selection, setSelection] = useState<
    { start: number; end: number } | undefined
  >(undefined);

  // Focus the hidden input shortly after mount so the keyboard opens.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Keep the native selection in sync so a tapped box edits in place.
  useEffect(() => {
    if (!selection) return;
    requestAnimationFrame(() =>
      inputRef.current?.setNativeProps({ selection }),
    );
  }, [selection]);

  // Clears both React state and the native buffer — setting value to ""
  // alone leaves Android's TextInput holding the old text.
  const reset = () => {
    setOtp("");
    setSelection({ start: 0, end: 0 });
    requestAnimationFrame(() => {
      inputRef.current?.clear();
      inputRef.current?.setNativeProps({
        text: "",
        selection: { start: 0, end: 0 },
      });
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Tapping a filled box selects that one digit (replace in place); tapping
  // an empty box parks the cursor at the first empty slot.
  const handleBoxPress = (index: number) => {
    if (index < otp.length) {
      setSelection({ start: index, end: index + 1 });
    } else {
      setSelection({ start: otp.length, end: otp.length });
    }
    const input = inputRef?.current;
    if (!input) return;
    if (Keyboard.isVisible()) {
      input.focus();
    } else {
      input.blur();
      requestAnimationFrame(() => input.focus());
    }
  };

  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    const editing = selection;
    const wasDeletion = digits.length < otp.length;
    setOtp(digits);

    if (editing) {
      const next = wasDeletion
        ? Math.min(editing.start, digits.length)
        : editing.start + 1;
      setSelection(
        next < OTP_LENGTH
          ? { start: next, end: wasDeletion ? next : next + 1 }
          : undefined,
      );
    } else {
      setSelection(
        digits.length < OTP_LENGTH
          ? { start: digits.length, end: digits.length }
          : undefined,
      );
    }

    // Auto-submit only when freshly completed by normal typing.
    if (digits.length === OTP_LENGTH && !editing) {
      inputRef.current?.blur();
      onComplete(digits);
    }
  };

  const activeIndex = selection
    ? Math.min(selection.start, OTP_LENGTH - 1)
    : Math.min(otp.length, OTP_LENGTH - 1);

  return {
    otp,
    selection,
    activeIndex,
    inputRef,
    handleBoxPress,
    handleOtpChange,
    reset,
  };
};
