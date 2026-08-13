import { Order } from "@/src/types/order";

const CANCELLED_STATUS = 0;
const DELIVERED_STATUS = 7;

type DelayCheckOrder = Pick<Order, "status" | "estimatedDelivery">;
type CancellationCheckOrder = Pick<Order, "status" | "statusLogs">;

/** True once the estimated delivery date has passed and the order hasn't finished. */
export function isOrderDelayed(
  order: DelayCheckOrder | null | undefined,
): boolean {
  if (
    order?.status === CANCELLED_STATUS ||
    order?.status === DELIVERED_STATUS
  ) {
    return false;
  }
  if (!order?.estimatedDelivery) return false;
  const eta = new Date(order.estimatedDelivery).getTime();
  return !Number.isNaN(eta) && eta < Date.now();
}

/** The reason recorded when the order was cancelled, if any. */
export function getCancellationReason(
  order: CancellationCheckOrder | null | undefined,
): string | null {
  if (order?.status !== CANCELLED_STATUS) return null;
  const log = order.statusLogs?.find(
    (l) => l.toStatus === String(CANCELLED_STATUS),
  );
  const reason = log?.reason?.trim();
  return reason ? reason : null;
}
