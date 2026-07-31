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

      const socket: Socket = io(API_BASE_URL, {
        extraHeaders: { Authorization: `Bearer ${token}` },
        transports: ["websocket"],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        if (__DEV__) logger.debug("[Socket] Connected");
      });

      socket.on("connect_error", (err) => {
        if (__DEV__) console.warn("[Socket] Error:", err.message);
      });

      socket.on("cart_update", (data: { action: string; cart: any }) => {
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

      socket.on("coupon_update", (data: { action: string; coupon: any }) => {
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

      socket.on("notification", (data: any) => {
        if (__DEV__) logger.debug("[Socket] Notification:", data);
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CUSTOMER.NOTIFICATIONS,
        });
      });

      socket.on(
        "settings_update",
        (data: { action: string; settings: any }) => {
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
