import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/authStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import { isOffline } from "@/src/utils/offline/networkState";
import { repairLegacyVariantCartRows } from "../services/cartLegacyRepair";
import type { Cart } from "../types";

/**
 * Rewrites pre-fix variant rows once per session, from the Cart screen —
 * the only route into checkout, so rows are fixed before Place Order.
 */
export const useLegacyCartRepair = (cart: Cart | undefined) => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isMergingCart = useCartPendingStore((s) => s.isMergingCart);
  const hasRunRef = useRef(false);

  useEffect(() => {
    // Guest carts are local and were never written by the broken path.
    if (!isAuthenticated || isMergingCart || isOffline()) return;
    if (hasRunRef.current) return;
    if (!cart?.items?.length) return;

    // Guarded: the repair writes, and its invalidate re-renders this host.
    hasRunRef.current = true;
    void repairLegacyVariantCartRows(queryClient, cart);
  }, [isAuthenticated, isMergingCart, cart, queryClient]);
};
