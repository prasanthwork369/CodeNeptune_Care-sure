import { getAccessToken } from "@/src/api/client";
import type { Cart, Coupon } from "@/src/features/cart/types";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { tokenStorage } from "@/src/lib/storage";
import { useAuthStore } from "@/src/store/authStore";
import { useCartPendingStore } from "@/src/store/cartStore";
import { API_BASE_URL } from "@/src/utils/urls";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { logger } from "@/src/utils/logger";

export const useCartSocketSync = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setCart = useCartPendingStore((s) => s.setCart);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let mounted = true;

    const connect = async () => {
      const token = await tokenStorage.get();
      if (!token || !mounted) return;

      // Kept as one mutable object (not replaced) — engine.io reads
      // `extraHeaders` fresh from this same reference on every reconnect
      // attempt, so updating its value in place is what lets a reconnect
      // pick up a token Axios refreshed after this socket first connected.
      const authHeaders = { Authorization: `Bearer ${token}` };

      const socket: Socket = io(API_BASE_URL, {
        extraHeaders: authHeaders,
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Fires before each reconnect attempt (not the first connect) — refresh
      // from the same in-memory token Axios's interceptor keeps current, so a
      // reconnect never hands the server the JWT this socket started with.
      socket.io.on("reconnect_attempt", () => {
        const current = getAccessToken();
        if (current) authHeaders.Authorization = `Bearer ${current}`;
      });

      socket.on("connect", () => {
        if (__DEV__) logger.debug("[Socket] Connected");
      });

      socket.on("connect_error", (err) => {
        if (__DEV__) console.warn("[Socket] Error:", err.message);
      });

      socket.on("cart_update", (data: { action: string; cart: Cart }) => {
        if (data?.cart) {
          // 1. Instantly sync Zustand state (sub-100ms UI updates!)
          setCart(data.cart);

          // 2. Proactively update React Query cache to keep queries in sync
          // This avoids unnecessary API requests to GET /cart
          queryClient.setQueryData(QUERY_KEYS.CUSTOMER.CART, data.cart);

          if (__DEV__)
            logger.debug("[Socket] Cart synced from server:", data.action);
        }
      });

      socket.on("coupon_update", (data: { action: string; coupon: Coupon }) => {
        if (__DEV__) logger.debug("[Socket] Coupon update:", data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.COUPONS,
        });
      });

      socket.on("wallet_update", (data: { customerId: string }) => {
        if (__DEV__) logger.debug("[Socket] Wallet update:", data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.WALLET.BALANCE,
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.WALLET.LOGS({}),
        });
      });

      socket.on("profile_update", (data: { customerId: string }) => {
        if (__DEV__) logger.debug("[Socket] Profile update:", data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.PROFILE,
        });
      });

      // Payload is only logged — the handler just invalidates the query.
      socket.on("notification", (data: unknown) => {
        if (__DEV__) logger.debug("[Socket] Notification:", data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
        });
      });

      socket.on(
        "settings_update",
        (data: { action: string; settings: unknown }) => {
          if (__DEV__) logger.debug("[Socket] Settings update:", data);
          queryClient.invalidateQueries({ queryKey: ["platform-settings"] });
          queryClient.invalidateQueries({ queryKey: ["cart-wallet-settings"] });
          queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
        },
      );

      socket.on("disconnect", (reason) => {
        if (__DEV__) logger.debug("[Socket] Disconnected:", reason);
      });

      socketRef.current = socket;
    };

    connect();

    return () => {
      mounted = false;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, queryClient, setCart]);
};
