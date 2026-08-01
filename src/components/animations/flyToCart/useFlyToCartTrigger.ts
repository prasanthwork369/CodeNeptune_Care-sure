import type { ImageSource } from "expo-image";
import { useCallback, useRef } from "react";
import { View } from "react-native";
import { useFlyToCartActionsSafe } from "./FlyToCartContext";

type FlyImage = ImageSource | string | null | undefined;

// Attach `imageRef` (with collapsable={false}) to a card's image and call
// `triggerFly` from its add/increment handler. No-op outside a provider.
export const useFlyToCartTrigger = (image: FlyImage, medicineId: string) => {
  const ctx = useFlyToCartActionsSafe();
  const imageRef = useRef<View>(null);

  const triggerFly = useCallback(() => {
    if (!ctx || !image || !medicineId) return;

    imageRef.current?.measure((x, y, width, height, pageX, pageY) => {
      if (pageX && pageY) {
        ctx.flyToCart(pageX + width / 2, pageY + height / 2, image, medicineId);
        return;
      }
      // Some Android views report 0 from measure(); window coords still work.
      imageRef.current?.measureInWindow((winX, winY, winW, winH) => {
        if (winX === undefined || winY === undefined) return;
        ctx.flyToCart(winX + winW / 2, winY + winH / 2, image, medicineId);
      });
    });
  }, [ctx, image, medicineId]);

  return { imageRef, triggerFly };
};
