import { useCartPendingStore } from "@/src/store/cartStore";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useCart } from "./queries/useCart";
import { useAuthStore } from "@/src/store/authStore";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { analyticsService } from "@/src/services/firebase";

/**
 * Product identity for cart operations.
 *
 * For variants: pass medicineId = variant.id (the variant UUID).
 * The backend cart unique-key is (cartId, medicineId) — variant UUIDs ensure separate rows.
 * variantId is stored in metadata only (frontend display use).
 */
export interface CartActionProduct {
  medicineId: string;         // For variants: the variant UUID. For base products: the medicine UUID.
  baseMedicineId?: string;    // Base medicine UUID — fallback for items added from listing cards (no variant).
  variantId?: string | null;  // Stored in metadata; not used for cart matching (backend limitation).
  productId?: string;         // Catalog ID (e.g. "CS-BDSMYG") — stored in metadata only
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image?: any;
  packSize?: string; // e.g. "50 ml" — stored in metadata for web cart display
  unit?: string; // e.g. "ml"
  manufacturer?: string;
  requiresPrescription?: boolean;
}

export const useCartActions = (product: CartActionProduct) => {
  const { items, addItem, updateItem, removeItem } = useCart();

  // Primary match: medicineId = variant UUID (new items).
  // Fallback: metadata.selectedVariantId match for items added with old code (medicineId = parent UUID).
  const pendingKey = product.medicineId;

  const cartItem = items.find(
    (i) =>
      i.medicineId === product.medicineId ||
      (product.baseMedicineId != null && i.medicineId === product.baseMedicineId) ||
      (product.variantId != null && i.metadata?.selectedVariantId === product.variantId),
  );

  const count = cartItem?.quantity ?? 0;
  // Subscribe to this product's pending flag only — a whole-store subscription
  // re-rendered every mounted card on each setPending call.
  const isPending = useCartPendingStore(
    (s) => s.pendingIds[pendingKey] ?? false,
  );
  const setPending = useCartPendingStore((s) => s.setPending);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const prevCountRef = useRef(count);
  const prevIsPendingRef = useRef(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count !== prevCountRef.current) {
      if (prevIsPendingRef.current) {
        slideAnim.setValue(0);
        opacityAnim.setValue(1);
      } else {
        const isIncrement = count > prevCountRef.current;
        slideAnim.setValue(isIncrement ? 15 : -15);
        opacityAnim.setValue(0);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
    prevCountRef.current = count;
  }, [count, opacityAnim, slideAnim]);

  useEffect(() => {
    prevIsPendingRef.current = isPending;
  });

  const increment = async () => {
    const { isConnected } = useNetworkStore.getState();
    if (isConnected === false) {
      useNetworkStore.getState().showOfflineAlert();
      return;
    }
    if (isPending) return;
    if (isAuthenticated) setPending(pendingKey, true);
    try {
      if (cartItem) {
        await updateItem(cartItem.id, { quantity: count + 1 });
        void analyticsService.logAddToCart();
      } else {
        const medicineName =
          String(product.name ?? "").trim() || product.medicineId;
        const medicineSlug =
          String(product.slug ?? "").trim() ||
          String(product.productId ?? "").trim() ||
          product.medicineId;
        // unitPrice must be the MRP — the backend derives the selling price
        // as unitPrice * (1 - discountPercent/100), matching customer-website's
        // ProductCard.tsx (unitPrice: mrp, mrp: mrp, discountPercent).
        const mrp = Number(product.originalPrice ?? product.price ?? 0);
        const unitPrice = mrp;
        const discountPercent = Number(product.discountPercent ?? 0);
        const imageUri =
          typeof product.image === "object" && product.image?.uri
            ? String(product.image.uri)
            : typeof product.image === "string"
              ? product.image
              : undefined;

        if (!product.medicineId || unitPrice <= 0) {
          if (__DEV__)
            console.warn("[AddToCart] blocked — missing medicineId or price:", {
              medicineId: product.medicineId,
              price: product.price,
            });
          return;
        }

        const formattedPackSize = product.packSize
          ? (product.unit && !String(product.packSize).endsWith(product.unit)
              ? `${product.packSize}${product.unit}`
              : String(product.packSize))
          : undefined;

        await addItem({
          medicineId: product.medicineId,
          variantId: product.variantId ?? null,
          medicineName,
          medicineSlug,
          unitPrice,
          mrp,
          discountPercent,
          quantity: 1,
          requiresPrescription: product.requiresPrescription ?? false,
          image: imageUri,
          metadata: {
            ...(product.productId ? { productId: product.productId } : {}),
            ...(product.variantId
              ? { selectedVariantId: product.variantId }
              : {}),
            ...(formattedPackSize ? { packSize: formattedPackSize } : {}),
            ...(product.unit ? { unit: product.unit } : {}),
            price: unitPrice,
            image: imageUri,
            manufacturer: product.manufacturer ?? null,
            ...(discountPercent > 0 ? { discountPercent } : {}),
          },
        });
        void analyticsService.logAddToCart();
      }
    } finally {
      if (isAuthenticated) setPending(pendingKey, false);
    }
  };

  const decrement = async () => {
    const { isConnected } = useNetworkStore.getState();
    if (isConnected === false) {
      useNetworkStore.getState().showOfflineAlert();
      return;
    }
    if (isPending || count <= 0) return;
    if (isAuthenticated) setPending(pendingKey, true);
    try {
      if (count === 1) {
        await removeItem(cartItem!.id);
      } else {
        await updateItem(cartItem!.id, { quantity: count - 1 });
      }
    } finally {
      if (isAuthenticated) setPending(pendingKey, false);
    }
  };

  return {
    count,
    isPending,
    increment,
    decrement,
    animations: { slideAnim, opacityAnim },
  };
};
