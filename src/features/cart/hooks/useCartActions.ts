import type { ImageSource } from "expo-image";
import { useCartPendingStore } from "@/src/store/cartStore";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { cartApi } from "../api/cart.api";
import { cartMutations } from "../services/cart.mutations";
import { useAuthStore } from "@/src/store/authStore";
import { requireInternet } from "@/src/utils/offline";
import { notifyCartError } from "../utils/cartError";
import { analyticsService } from "@/src/services/firebase";
import type { CartItem } from "../types";

/**
 * Product identity for cart operations.
 *
 * medicineId is ALWAYS the parent `medicines.id` UUID — including for pack-size
 * variants. The selected variant travels in `metadata.selectedVariantId`, which
 * is what order-service reads: add-item.usecase.ts pulls the variant out of
 * metadata, and postgres-cart.repository.ts matches an existing line on
 * (cartId, medicineId, metadata->>'selectedVariantId'), so different variants
 * of one medicine already get their own cart rows without overloading
 * medicineId. Sending a `medicine_variants.id` here instead breaks checkout —
 * catalog `/medicines/bulk` and `medicine_stock` are both keyed to
 * `medicines.id`, so order-service can't resolve a price and rejects the order.
 */
export interface CartActionProduct {
  medicineId: string; // Parent `medicines.id` UUID — never a variant UUID.
  baseMedicineId?: string; // Legacy alias for the parent id — extra match candidate for rows written by older builds.
  variantId?: string | null; // Selected variant UUID; stored in metadata.selectedVariantId.
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

/** The variant a cart row represents, or null for a plain (non-variant) line. */
function cartItemVariantId(item: CartItem): string | null {
  // `variantId` isn't a declared key on CartItemMetadata, so it arrives as
  // `unknown` through the index signature — accept it only when it's a string.
  const legacy = item.metadata?.variantId;
  return (
    item.metadata?.selectedVariantId ??
    (typeof legacy === "string" ? legacy : null)
  );
}

// Matching is variant-aware: now that every surface sends the parent medicineId,
// a medicineId-only match would make each variant's card read (and edit) another
// variant's row, so the variant must agree too — mirroring the backend's own
// (cartId, medicineId, metadata->>'selectedVariantId') lookup.
//
// The legacy clause still matches rows written by builds that stored the variant
// UUID in medicineId, so carts created before this fix stay editable.
//
// The catalog-id fallback reconciles the same product across surfaces (e.g. a
// recommended item shown both in a comparison card and a standalone card) when
// their medicineId differs. It stays limited to variant-less rows so it never
// conflates two pack-size variants that share one productId.
function matchesCartItem(item: CartItem, product: CartActionProduct): boolean {
  const wantVariantId = product.variantId ?? null;
  const itemVariantId = cartItemVariantId(item);

  // Legacy rows: medicineId held the variant UUID.
  if (wantVariantId != null && item.medicineId === wantVariantId) return true;

  const medicineMatches =
    item.medicineId === product.medicineId ||
    (product.baseMedicineId != null &&
      item.medicineId === product.baseMedicineId);
  if (medicineMatches) return itemVariantId === wantVariantId;

  if (wantVariantId != null) return itemVariantId === wantVariantId;

  return (
    product.productId != null &&
    itemVariantId == null &&
    item.metadata?.productId === product.productId
  );
}

export const useCartActions = (product: CartActionProduct) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Variant-scoped: medicineId alone is shared by every pack-size variant of a
  // medicine, so two variant cards on one screen would block each other.
  const pendingKey = product.variantId
    ? `${product.medicineId}-${product.variantId}`
    : product.medicineId;

  // Narrow, per-card subscriptions: each card selects only its own matching
  // item out of the shared cart (server cart via React Query `select`, guest
  // cart via a Zustand selector) instead of reading the whole items array —
  // so it only re-renders when ITS OWN item changes, not on every unrelated
  // add/remove elsewhere in the cart. Both cart sources preserve unrelated
  // items' object identity across updates (structural sharing / spread-map),
  // so an unchanged match keeps the same reference and skips the re-render.
  // Paused during the post-login guest cart merge (see cartMerge.service.ts)
  // so this — mounted once per product card, i.e. ~25x on Home right after
  // login — can't independently fetch a partial cart mid-merge.
  const isMergingCart = useCartPendingStore((s) => s.isMergingCart);

  const { data: authCartItem } = useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.CART,
    queryFn: cartApi.getCart,
    enabled: isAuthenticated && !isMergingCart,
    staleTime: 10_000,
    select: (cart) => cart.items.find((i) => matchesCartItem(i, product)),
  });

  const guestCartItem = useCartPendingStore((s) =>
    isAuthenticated
      ? undefined
      : s.guestCart?.items?.find((i) => matchesCartItem(i, product)),
  );

  const cartItem = isAuthenticated ? authCartItem : guestCartItem;
  const count = cartItem?.quantity ?? 0;
  // Subscribe to this product's pending flag only — a whole-store subscription
  // re-rendered every mounted card on each setPending call.
  const isPending = useCartPendingStore(
    (s) => s.pendingIds[pendingKey] ?? false,
  );
  const setPending = useCartPendingStore((s) => s.setPending);

  const prevCountRef = useRef(count);
  const prevIsPendingRef = useRef(false);
  // State updates are asynchronous; this lock also blocks a second tap made
  // before the pending-store update has rendered.
  const operationPendingRef = useRef(false);
  // Lazy useState initializer, not useRef(new Animated.Value(...)).current —
  // the latter still constructs (and discards) a new Animated.Value on every
  // render since useRef's argument is evaluated unconditionally; useState's
  // initializer function is guaranteed to run exactly once.
  // Stable animation values (kept permanently visible & centered at 0)
  const [slideAnim] = useState(() => new Animated.Value(0));
  const [opacityAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

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
