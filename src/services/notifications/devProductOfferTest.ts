import { Image } from "react-native";
import { HOME_IMAGES } from "../../constants/images";
import { showProductOffer } from "./productOfferNotification";
import { logger } from "@/src/utils/logger";

/**
 * DEV-ONLY test trigger for the custom product-offer notification — no FCM
 * needed. From the Metro/DevTools JS console run:
 *
 *   testProductOffer()                          // full payload
 *   testProductOffer({ imageUrl: "https://broken.example/x.png" })  // image failure
 *   testProductOffer({ mrp: "", couponText: "" })                   // optional fields hidden
 *
 * Stripped from release builds by the __DEV__ guard.
 */
if (__DEV__) {
  const basePayload = {
    notificationType: "product_offer",
    productId: "CS-0173",
    title: "Montecip-LC Tablet 10's",
    mrp: "₹349",
    offerPrice: "₹199",
    discountText: "Save ₹150",
    couponText: "Use code CARE150",
    // Bundled asset served by the Metro dev server as an http URL the native
    // downloader can fetch — no external CDN dependency for testing.
    imageUrl: Image.resolveAssetSource(HOME_IMAGES.medicineStrip).uri,
    buttonText: "VIEW PRODUCT",
    deepLink: "caresure://product/CS-0173",
    subText: "Shop Now on CareSure",
  };

  (globalThis as Record<string, unknown>).testProductOffer = (
    overrides: Record<string, string> = {},
  ) =>
    showProductOffer({ ...basePayload, ...overrides }).then((shown) =>
      logger.debug(`[DevProductOffer] shown natively: ${shown}`),
    );
}

export {};
