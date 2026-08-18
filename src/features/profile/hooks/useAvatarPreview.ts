import { useCallback, useRef, useState } from "react";
import type { View } from "react-native";
import type { PreviewRect } from "./useAvatarPreviewAnimation";

/**
 * Screen-side state for AvatarPreviewModal: measures the avatar on screen so the
 * preview can grow out of it, then keeps that rect for the closing animation.
 */
export function useAvatarPreview() {
  const targetRef = useRef<View | null>(null);
  const [rect, setRect] = useState<PreviewRect | null>(null);
  const [visible, setVisible] = useState(false);

  const open = useCallback(() => {
    const node = targetRef.current;
    if (!node) return;
    // Measure before opening — window coords are what the modal animates from.
    node.measureInWindow((x, y, width, height) => {
      setRect({ x, y, width, height });
      setVisible(true);
    });
  }, []);

  const close = useCallback(() => setVisible(false), []);

  return { targetRef, rect, visible, open, close };
}
