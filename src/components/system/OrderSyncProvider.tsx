import { useRetryQueuedOrder } from "@/src/features/orders/hooks/useRetryQueuedOrder";

export const OrderSyncProvider = () => {
  useRetryQueuedOrder();
  return null;
};
