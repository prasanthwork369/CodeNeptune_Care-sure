import { create } from "zustand";

type ToastType = "success" | "warning" | "error";
// "auto" (default) docks to the bottom, but moves to the top while the
// keyboard is open so the keyboard never covers it. "bottom" pins it to the
// bottom always — for callers (e.g. a field's own inline toast) whose bottom
// anchor already sits above the keyboard, like a number-pad-height field.
type ToastPosition = "auto" | "bottom";

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  position: ToastPosition;
  show: (message: string, type?: ToastType, position?: ToastPosition) => void;
  hide: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: "",
  type: "success",
  position: "auto",
  show: (message, type = "success", position = "auto") =>
    set({ visible: true, message, type, position }),
  hide: () => set({ visible: false }),
}));
