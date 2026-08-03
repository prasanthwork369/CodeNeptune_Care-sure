import { useCart } from "@/src/hooks/queries/useCart";
import type { CartItem } from "@/src/types/cart";
import type { ImageSource } from "expo-image";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Dimensions } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import {
  SharedValue,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from "react-native-reanimated";

/** What a card can hand to the fly animation: a remote URI or a bundled asset. */
export type FlyImage = ImageSource | string | null | undefined;

export interface ActiveAnimation {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageUrl: FlyImage;
  productId: string;
}

export interface VisualCartImage {
  id: string;
  image: FlyImage;
  isPending?: boolean;
  isRemoving?: boolean;
  isBehindRemoving?: boolean;
}

interface FlyToCartContextType {
  destinationCoords: { x: number; y: number };
  setDestinationCoords: (coords: { x: number; y: number }) => void;
  activeAnimations: ActiveAnimation[];
  flyToCart: (
    sourceX: number,
    sourceY: number,
    imageUrl: FlyImage,
    productId: string,
  ) => void;
  handleComplete: (id: string, imageUrl: FlyImage, productId: string) => void;
  bounceSharedValue: SharedValue<number>;
  widthExpansion: SharedValue<number>;
  /** Live target, so a flight already in the air re-aims when the banner
   * mounts and reports its position (matters on the very first add). */
  destinationShared: SharedValue<{ x: number; y: number }>;
  triggerBounce: () => void;
  triggerWidthExpansion: () => void;
  visualCartCount: number;
  visualCartImages: VisualCartImage[];
}

const FlyToCartContext = createContext<FlyToCartContextType | null>(null);

/**
 * Just the two actions, split out and held stable forever. Product cards
 * subscribe to this instead of the full context so the visual state churning
 * during a fly (activeAnimations, visualCartImages…) can't re-render the grid.
 */
interface FlyToCartActions {
  flyToCart: (
    sourceX: number,
    sourceY: number,
    imageUrl: FlyImage,
    productId: string,
  ) => void;
  setDestinationCoords: (coords: { x: number; y: number }) => void;
}

const FlyToCartActionsContext = createContext<FlyToCartActions | null>(null);

export const FlyToCartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { totalItems, items } = useCart();
  const adjustedBottom = useAdjustedBottomInset();
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Default targets the center of the circle (first-item state)
  const defaultCoords = {
    x: screenWidth / 2,
    y: screenHeight - adjustedBottom - 8 - 30,
  };

  const [destinationCoords, setDestinationCoordsState] = useState<{
    x: number;
    y: number;
  }>(defaultCoords);

  const [activeAnimations, setActiveAnimations] = useState<ActiveAnimation[]>(
    [],
  );
  const [visualCartCount, setVisualCartCount] = useState(0);
  const [visualCartImages, setVisualCartImages] = useState<VisualCartImage[]>(
    [],
  );

  const bounceSharedValue = useSharedValue(1);
  const widthExpansion = useSharedValue(0);
  const destinationShared = useSharedValue(defaultCoords);

  const hasJustAdded = React.useRef(false);
  const lastAddTimestamp = React.useRef(0);
  const prevItemsRef = React.useRef<CartItem[]>(items);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageClearTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  // Prevents normal sync from clearing images while banner collapse animation is running
  const isCollapsingRef = React.useRef(false);

  // Sync visual cart with real cart, checking for item removals to trigger exit animations
  useEffect(() => {
    // 1. Detect if any items were removed from the cart
    const prevIds = prevItemsRef.current.map((item) => item.medicineId);
    const currentIds = items.map((item) => item.medicineId);
    const removedIds = prevIds.filter((id) => !currentIds.includes(id));

    if (removedIds.length > 0) {
      const removedVisualIndex = visualCartImages.findIndex((img) =>
        removedIds.includes(img.id),
      );
      let targetIdToAnimate = "";
      let animateBehind = false;

      if (removedVisualIndex !== -1) {
        targetIdToAnimate = visualCartImages[removedVisualIndex].id;
      } else if (visualCartImages.length > 0) {
        // If the removed item is not in the visible list (cart has > 3 items),
        // animate the oldest visible item (left-most, index 0) to give the removal feel!
        targetIdToAnimate = visualCartImages[0].id;
        animateBehind = true;
      }

      if (targetIdToAnimate) {
        if (totalItems === 0) {
          // ── LAST ITEM REMOVED ──────────────────────────────────────────────
          // Do NOT play the thumbnail removal animation — the image should stay
          // visible and fade out naturally with the banner's collapse animation.
          // Lock out normal sync so it doesn't clear images early.
          isCollapsingRef.current = true;
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setVisualCartCount((prev) => (prev === 0 ? prev : 0));

            if (imageClearTimeoutRef.current)
              clearTimeout(imageClearTimeoutRef.current);
            imageClearTimeoutRef.current = setTimeout(() => {
              setVisualCartImages((prev) => (prev.length === 0 ? prev : []));
              isCollapsingRef.current = false; // unlock after images cleared
              imageClearTimeoutRef.current = null;
            }, 720); // matches banner collapse duration

            timeoutRef.current = null;
          }, 50);
          prevItemsRef.current = items;
          return;
        } else {
          // Mark the target item in state to play removal animation
          setVisualCartImages((prev) => {
            const next = prev.map((img) =>
              img.id === targetIdToAnimate
                ? {
                    ...img,
                    isRemoving: !animateBehind,
                    isBehindRemoving: animateBehind,
                  }
                : img,
            );
            const isChanged = next.some(
              (img, idx) =>
                img.isRemoving !== prev[idx].isRemoving ||
                img.isBehindRemoving !== prev[idx].isBehindRemoving,
            );
            return isChanged ? next : prev;
          });
          setVisualCartCount((prev) =>
            prev === totalItems ? prev : totalItems,
          );
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setVisualCartImages((prev) => {
              const next = prev
                .filter((img) => img.id !== targetIdToAnimate || animateBehind)
                .map((img) =>
                  img.id === targetIdToAnimate
                    ? { ...img, isBehindRemoving: false }
                    : img,
                );
              return next;
            });
            timeoutRef.current = null;
          }, 600);
          prevItemsRef.current = items;
          return;
        } // end else (totalItems > 0)
      }
    }

    // 2. Skip normal sync if any item is currently in the middle of being removed/animated
    const isCurrentlyRemoving = visualCartImages.some(
      (img) => img.isRemoving || img.isBehindRemoving,
    );
    if (isCurrentlyRemoving) {
      prevItemsRef.current = items;
      return;
    }

    // 3. Normal sync logic (when no active animations are running)
    if (activeAnimations.length === 0) {
      if (totalItems > 0) {
        const isWithinLockout = Date.now() - lastAddTimestamp.current < 2000;
        const shouldSync =
          totalItems >= visualCartCount ||
          (!hasJustAdded.current && !isWithinLockout);

        if (shouldSync) {
          hasJustAdded.current = false;
          setVisualCartCount((prev) =>
            prev === totalItems ? prev : totalItems,
          );
          const cartItemsWithImage = items.filter(
            (item) => item.image ?? item.metadata?.image,
          );
          const newImages: VisualCartImage[] = cartItemsWithImage
            .map((i) => ({
              id: i.medicineId,
              image: i.image ?? i.metadata?.image,
              isPending: false,
            }))
            .slice(-3);

          setVisualCartImages((prev) => {
            const isIdentical =
              prev.length === newImages.length &&
              prev.every(
                (img, idx) =>
                  img.id === newImages[idx].id &&
                  img.image === newImages[idx].image &&
                  img.isPending === newImages[idx].isPending &&
                  img.isRemoving === newImages[idx].isRemoving,
              );
            return isIdentical ? prev : newImages;
          });
        }
      } else if (!hasJustAdded.current && !isCollapsingRef.current) {
        // Guard: don't wipe images while the banner collapse animation is running
        setVisualCartCount((prev) => (prev === 0 ? prev : 0));
        setVisualCartImages((prev) => (prev.length === 0 ? prev : []));
      }
    }

    prevItemsRef.current = items;
  }, [
    totalItems,
    items,
    activeAnimations.length,
    visualCartImages,
    visualCartCount,
  ]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (imageClearTimeoutRef.current)
        clearTimeout(imageClearTimeoutRef.current);
    };
  }, []);

  // Mirrored into refs so flyToCart can stay referentially stable — otherwise
  // every card consuming it re-renders whenever the destination or cart moves.
  const destinationRef = React.useRef(defaultCoords);
  const totalItemsRef = React.useRef(totalItems);
  totalItemsRef.current = totalItems;

  const setDestinationCoords = useCallback(
    (coords: { x: number; y: number }) => {
      destinationRef.current = coords;
      destinationShared.value = coords;
      setDestinationCoordsState(coords);
    },
    [destinationShared],
  );

  const flyToCart = useCallback(
    (sourceX: number, sourceY: number, imageUrl: FlyImage, productId: string) => {
      const destination = destinationRef.current;
      const currentTotal = totalItemsRef.current;
      const id = Math.random().toString(36).substring(2, 9);
      hasJustAdded.current = true;
      lastAddTimestamp.current = Date.now();
      setActiveAnimations((prev) => [
        ...prev,
        {
          id,
          startX: sourceX,
          startY: sourceY,
          endX: destination.x,
          endY: destination.y,
          imageUrl,
          productId,
        },
      ]);

      // Optimistically increment the visual cart count immediately
      setVisualCartCount((prev) => Math.max(prev + 1, currentTotal + 1));

      // First item: show image immediately in the circle (no pending)
      // so user sees image in circle before expansion starts.
      // Subsequent items: keep isPending so thumbnail only pops in when fly lands.
      if (imageUrl && productId) {
        const isFirstItem = currentTotal === 0;
        // Use the real cart row id when the item already exists in the cart
        // (e.g. incrementing quantity) so this optimistic entry shares the
        // same id the sync effect below will use — preventing two entries
        // for the same product from coexisting with different ids.
        const visualId = productId;
        setVisualCartImages((prev) => {
          const filtered = prev.filter((item) => item.id !== visualId);
          return [
            ...filtered,
            { id: visualId, image: imageUrl, isPending: !isFirstItem },
          ].slice(-3);
        });
      }
    },
    [],
  );

  const triggerBounce = useCallback(() => {
    // Avoid bounce/zoom animation
  }, []);

  const triggerWidthExpansion = useCallback(() => {
    widthExpansion.value = withSequence(
      withTiming(18, { duration: 160 }),
      withSpring(0, { damping: 14, stiffness: 220 }),
    );
  }, [widthExpansion]);

  const handleComplete = useCallback(
    (id: string, imageUrl: FlyImage, productId: string) => {
      setActiveAnimations((prev) => prev.filter((anim) => anim.id !== id));

      // Once the flying image lands, transition isPending to false so the thumbnail animates in.
      if (imageUrl && productId) {
        const visualId = productId;
        setVisualCartImages((prev) =>
          prev.map((item) =>
            item.id === visualId ? { ...item, isPending: false } : item,
          ),
        );
      }

      triggerBounce();
      triggerWidthExpansion();
    },
    [triggerBounce, triggerWidthExpansion],
  );

  // Both callbacks are stable, so this object is created once and never again.
  const actions = useMemo<FlyToCartActions>(
    () => ({ flyToCart, setDestinationCoords }),
    [flyToCart, setDestinationCoords],
  );

  const value = useMemo<FlyToCartContextType>(
    () => ({
      destinationCoords,
      setDestinationCoords,
      activeAnimations,
      flyToCart,
      handleComplete,
      bounceSharedValue,
      widthExpansion,
      destinationShared,
      triggerBounce,
      triggerWidthExpansion,
      visualCartCount,
      visualCartImages,
    }),
    [
      destinationCoords,
      setDestinationCoords,
      activeAnimations,
      flyToCart,
      handleComplete,
      bounceSharedValue,
      widthExpansion,
      destinationShared,
      triggerBounce,
      triggerWidthExpansion,
      visualCartCount,
      visualCartImages,
    ],
  );

  return (
    <FlyToCartActionsContext.Provider value={actions}>
      <FlyToCartContext.Provider value={value}>
        {children}
      </FlyToCartContext.Provider>
    </FlyToCartActionsContext.Provider>
  );
};

export const useFlyToCart = () => {
  const context = useContext(FlyToCartContext);
  if (!context) {
    throw new Error("useFlyToCart must be used within a FlyToCartProvider");
  }
  return context;
};

// Safe version — returns null when used outside provider (no throw)
export const useFlyToCartSafe = (): FlyToCartContextType | null => {
  return useContext(FlyToCartContext);
};

// Actions only — subscribing to this never re-renders on visual state changes.
export const useFlyToCartActionsSafe = (): FlyToCartActions | null => {
  return useContext(FlyToCartActionsContext);
};
