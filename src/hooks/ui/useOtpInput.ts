import { useEffect, useRef, useState } from "react";
import { Keyboard, TextInput } from "react-native";

const OTP_LENGTH = 6;

const emptySlots = () => Array<string>(OTP_LENGTH).fill("");

// Index of the first differing char — finds the digit the keyboard just inserted.
const firstDiff = (a: string, b: string) => {
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  return i;
};

/**
 * Reusable OTP box-input logic — the same hidden-TextInput-behind-6-boxes
 * behaviour used on the login screen, but with NO auth/SMS/navigation coupling
 * so any screen can reuse it (e.g. email verification).
 *
 * It owns the per-box digits and the active box, and calls `onComplete(code)`
 * once 6 digits are entered by normal typing. The login flow keeps its own
 * richer useOtp (SMS autofill, cart merge); this is the smaller, shared piece.
 */
export const useOtpInput = (onComplete: (code: string) => void) => {
  const inputRef = useRef<TextInput | null>(null);
  // One entry per box ("" = empty) so a cleared box leaves a gap.
  const [slots, setSlots] = useState<string[]>(emptySlots);
  // Box the next keystroke edits.
  const [activeSlot, setActiveSlot] = useState(0);
  // A tapped box means the user is correcting — don't auto-submit then.
  const isEditingRef = useRef(false);

  // Input mirrors only filled digits; its caret is ignored so edits land on activeSlot.
  const inputValue = slots.filter(Boolean).join("");
  const code = slots.join("");

  // Focus the hidden input shortly after mount so the keyboard opens.
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Clears React state and the native buffer, which otherwise keeps the old text.
  const reset = () => {
    setSlots(emptySlots());
    setActiveSlot(0);
    isEditingRef.current = false;
    requestAnimationFrame(() => inputRef.current?.clear());
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleBoxPress = (index: number) => {
    isEditingRef.current = true;
    setActiveSlot(index);
    const input = inputRef?.current;
    if (!input) return;
    if (Keyboard.isVisible()) {
      input.focus();
    } else {
      input.blur();
      requestAnimationFrame(() => input.focus());
    }
  };

  /** Input text is only a signal: longer = typed, shorter = backspace; edits land on activeSlot. */
  const handleOtpChange = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const prev = inputValue;
    const next = [...slots];

    // A whole code at once (paste / autofill) fills every box.
    if (digits.length === OTP_LENGTH && prev.length === 0) {
      setSlots(digits.split(""));
      setActiveSlot(OTP_LENGTH - 1);
      if (!isEditingRef.current) {
        inputRef.current?.blur();
        onComplete(digits);
      }
      return;
    }

    if (digits.length < prev.length) {
      // Backspace clears the active box, leaving the gap.
      let slot = activeSlot;
      if (!next[slot]) {
        // Already empty — fall back to the nearest filled box before it.
        let prior = slot - 1;
        while (prior >= 0 && !next[prior]) prior--;
        if (prior < 0) return;
        slot = prior;
      }
      next[slot] = "";
      setSlots(next);
      setActiveSlot(slot);
      return;
    }

    if (digits.length > prev.length) {
      // A full code only changes after a tap, so stray keys can't corrupt it.
      if (!isEditingRef.current && next.every((d) => d !== "")) return;

      const at = firstDiff(prev, digits);
      const added = digits.slice(at, at + (digits.length - prev.length));
      let slot = activeSlot;
      for (const digit of added) {
        if (slot >= OTP_LENGTH) break;
        next[slot] = digit;
        slot += 1;
      }
      setSlots(next);
      setActiveSlot(Math.min(slot, OTP_LENGTH - 1));

      // Auto-submit only when freshly completed by typing, not while correcting.
      if (next.every((d) => d !== "") && !isEditingRef.current) {
        inputRef.current?.blur();
        onComplete(next.join(""));
      }
    }
  };

  return {
    slots,
    inputValue,
    code,
    activeIndex: Math.min(activeSlot, OTP_LENGTH - 1),
    inputRef,
    handleBoxPress,
    handleOtpChange,
    reset,
  };
};
