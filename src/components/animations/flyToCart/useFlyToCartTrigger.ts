import { useCallback, useRef } from "react";
import { View } from "react-native";
import { useFlyToCartActionsSafe, type FlyImage } from "./FlyToCartContext";

// Attach `imageRef` (with collapsable={false}) to a card's image and call
// `triggerFly` from its add/increment handler. No-op outside a provider.
export const useFlyToCartTrigger = (image: FlyImage, medicineId: string) => {
  const ctx = useFlyToCartActionsSafe();
  const imageRef = useRef<View>(null);

  const triggerFly = useCallback(() => {
    if (!ctx || !medicineId) return;

    // `measure`'s native callback has been observed to fire more than once
    // for a single call on some Android devices. Each call to flyToCart bumps
    // the banner's optimistic count by one, so an extra callback silently
    // counted a second, non-existent item — this guard caps one triggerFly()
    // invocation to a single flyToCart(), no matter how many times the
    // native side calls back.
    let hasFlown = false;
    const fly = (x: number, y: number) => {
      if (hasFlown) return;
      hasFlown = true;
      ctx.flyToCart(x, y, image, medicineId);
    };

    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (pageX && pageY) {
        fly(pageX + width / 2, pageY + height / 2);
        return;
      }
      // Some Android views report 0 from measure(); window coords still work.
      imageRef.current?.measureInWindow((winX, winY, winW, winH) => {
        if (winX === undefined || winY === undefined) return;
        fly(winX + winW / 2, winY + winH / 2);
      });
    });
  }, [ctx, image, medicineId]);

  return { imageRef, triggerFly };
};
