import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/authStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import { isOffline } from "@/src/utils/offline/networkState";
import { repairLegacyVariantCartRows } from "../services/cartLegacyRepair";
import type { Cart } from "../types";

/**
 * Rewrites pre-fix variant rows once per app session, on the Cart screen.
 *
 * Cart is the only route into checkout, so repairing here guarantees the rows
 * are fixed before Place Order can be reached. Runs silently: the customer
 * sees their cart re-render with the same items, and a cart that cannot be
 * repaired simply behaves as it did before.
 *
 * Guarded so it runs at most once per session — the repair issues cart writes,
 * and the invalidate it ends with re-renders this hook's host.
 */
export const useLegacyCartRepair = (cart: Cart | undefined) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isMergingCart = useCartPendingStore((s) => s.isMergingCart);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Guest carts are local and were never written by the broken path, so
    // there is nothing to repair until the customer is signed in.
    if (!isAuthenticated || isMergingCart || isOffline()) return;
    if (hasRunRef.current) return;
    if (!cart?.items?.length) return;

    hasRunRef.current = true;
    void repairLegacyVariantCartRows(queryClient, cart);
  }, [isAuthenticated, isMergingCart, cart, queryClient]);
};
