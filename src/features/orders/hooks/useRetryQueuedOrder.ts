import { useEffect, useRef } from "react";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import {
  getQueuedOrder,
  clearQueuedOrder,
  incrementOrderRetryCount,
  isOrderQueueExpired,
} from "@/src/features/orders/utils/queueOrder";
import { orderApi } from "@/src/features/orders/api/order.api";
import { logger } from "@/src/utils/logger";

const MAX_QUEUED_ORDER_RETRIES = 3;

export function useRetryQueuedOrder() {
  const isConnected = useNetworkStore((s) => s.isConnected);
  const isInternetReachable = useNetworkStore((s) => s.isInternetReachable);
  const retryAttemptedRef = useRef(false);

  useEffect(() => {
    const isOnline = isConnected === true && isInternetReachable === true;

    // Reset flag when offline so retry is possible on next online transition
    if (!isOnline) {
      retryAttemptedRef.current = false;
      return;
    }

    // Only retry once when transitioning to online
    if (retryAttemptedRef.current) return;

    retryAttemptedRef.current = true;

    let mounted = true;

    const retryQueued = async () => {
      try {
        const queuedOrder = await getQueuedOrder();
        if (!queuedOrder || !mounted) return;

        // Reject expired queued orders (older than 24 hours)
        if (isOrderQueueExpired(queuedOrder.queuedAt)) {
          if (__DEV__)
            logger.warn(
              "[retryQueuedOrder] Queued order expired, clearing",
              queuedOrder.idempotencyKey,
            );
          await clearQueuedOrder();
          return;
        }

        // Don't retry if max attempts exceeded
        if (queuedOrder.attemptCount >= MAX_QUEUED_ORDER_RETRIES) {
          if (__DEV__)
            logger.error(
              "[retryQueuedOrder] Max retries exceeded",
              queuedOrder.idempotencyKey,
            );
          // Keep the queued order so user can see it in history if needed
          // Backend will have the idempotency key to prevent duplicate orders
          return;
        }

        if (__DEV__)
          logger.debug("[retryQueuedOrder] Retrying queued order", {
            idempotencyKey: queuedOrder.idempotencyKey,
            attemptCount: queuedOrder.attemptCount,
          });

        await incrementOrderRetryCount();

        // Attempt to create the order
        const order = await orderApi.createOrder(
          queuedOrder.payload,
          queuedOrder.idempotencyKey,
        );

        if (order?.id && mounted) {
          if (__DEV__)
            logger.debug(
              "[retryQueuedOrder] Queued order succeeded",
              order.id,
            );
          // Clear the queued order since it succeeded
          await clearQueuedOrder();
        }
      } catch (err) {
        if (__DEV__)
          logger.warn("[retryQueuedOrder] Retry failed", err);
        // Leave the queued order in place for next reconnect
      }
    };

    // Delay slightly to let network fully stabilize
    const timer = setTimeout(() => {
      if (mounted) {
        retryQueued();
      }
    }, 500);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [isConnected, isInternetReachable]);
}
