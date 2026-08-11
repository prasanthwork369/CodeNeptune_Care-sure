import type { ImageSource } from "expo-image";
import { useCartPendingStore } from "@/src/store/cartStore";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { useCartRead } from "./queries/useCartRead";
import { cartMutations } from "@/src/services/cart.mutations";
import { useAuthStore } from "@/src/store/authStore";
import { requireInternet } from "@/src/utils/offline";
import { notifyCartError } from "@/src/utils/cartError";
import { analyticsService } from "@/src/services/firebase";

/**
 * Product identity for cart operations.
 *
 * For variants: pass medicineId = variant.id (the variant UUID).
 * The backend cart unique-key is (cartId, medicineId) — variant UUIDs ensure separate rows.
 * variantId is stored in metadata only (frontend display use).
 */
export interface CartActionProduct {
  medicineId: string; // For variants: the variant UUID. For base products: the medicine UUID.
  baseMedicineId?: string; // Base medicine UUID — fallback for items added from listing cards (no variant).
  variantId?: string | null; // Stored in metadata; not used for cart matching (backend limitation).
  productId?: string; // Catalog ID (e.g. "CS-BDSMYG") — stored in metadata only
  name: string;
  slug?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image?: ImageSource | string | null;
  packSize?: string; // e.g. "50 ml" — stored in metadata for web cart display
  unit?: string; // e.g. "ml"
  manufacturer?: string;
  requiresPrescription?: boolean;
}

export const useCartActions = (product: CartActionProduct) => {
  // Read-only: writes go through cartMutations, so a card never allocates the
  // five useMutation instances useCart builds.
  const { items } = useCartRead();

  // Primary match: medicineId = variant UUID (new items).
  // Fallback: metadata.selectedVariantId match for items added with old code (medicineId = parent UUID).
  const pendingKey = product.medicineId;

  const cartItem = items.find(
    (i) =>
      i.medicineId === product.medicineId ||
      (product.baseMedicineId != null &&
        i.medicineId === product.baseMedicineId) ||
      (product.variantId != null &&
        i.metadata?.selectedVariantId === product.variantId) ||
      // Stable catalog-id fallback: reconciles the same product across surfaces
      // (e.g. a recommended item shown both in a comparison card and a standalone
      // card) when their medicineId differs. Excludes variant lines so it never
      // conflates two pack-size variants that share one productId.
      (product.productId != null &&
        !i.metadata?.selectedVariantId &&
        i.metadata?.productId === product.productId),
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
  // State updates are asynchronous; this lock also blocks a second tap made
  // before the pending-store update has rendered.
  const operationPendingRef = useRef(false);
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

  /**
   * Resolves true only when the item actually reached the cart.
   *
   * Callers use this to gate the fly-to-cart animation: it used to run
   * unconditionally, so an offline add showed the item flying in and the badge
   * counting up while nothing had been added.
   */
  const increment = async (): Promise<boolean> => {
    // Guest edits are local, so only a signed-in write needs the connection.
    if (isAuthenticated && !requireInternet()) return false;
    if (isPending || operationPendingRef.current) return false;
    operationPendingRef.current = true;
    setPending(pendingKey, true);
    try {
      if (cartItem) {
        await cartMutations.updateItem(cartItem.id, { quantity: count + 1 });
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
          return false;
        }

        const formattedPackSize = product.packSize
          ? product.unit && !String(product.packSize).endsWith(product.unit)
            ? `${product.packSize} ${product.unit}`
            : String(product.packSize)
          : undefined;

        await cartMutations.addItem({
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
      return true;
    } catch (err) {
      notifyCartError(err);
      return false;
    } finally {
      operationPendingRef.current = false;
      setPending(pendingKey, false);
    }
  };

  const decrement = async () => {
    // Guest edits are local, so only a signed-in write needs the connection.
    if (isAuthenticated && !requireInternet()) return;
    if (isPending || operationPendingRef.current || count <= 0) return;
    operationPendingRef.current = true;
    setPending(pendingKey, true);
    try {
      if (count === 1) {
        await cartMutations.removeItem(cartItem!.id);
      } else {
        await cartMutations.updateItem(cartItem!.id, { quantity: count - 1 });
      }
    } catch (err) {
      notifyCartError(err);
    } finally {
      operationPendingRef.current = false;
      setPending(pendingKey, false);
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
