import { Order, TrackingStep } from "@/src/types/order";
import { useMemo } from "react";

function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_TITLE: Record<number, string> = {
  1: "Order Placed",
  2: "Confirmed",
  3: "Verified by Pharmacist",
  4: "Processing",
  5: "Packed",
  6: "Shipped",
  7: "Delivered",
  8: "Under Review",
  9: "Processing",
  10: "Under Review",
  0: "Cancelled",
};

// Only treat status as a progress position if it's a known step (1-7).
// Unknown codes (e.g. 11 = pending payment) must not mark later steps complete.
const STEP_STATUSES = [1, 2, 3, 4, 5, 6, 7];

export function useOrderTrackingSteps(order: Order | null | undefined): TrackingStep[] {
  return useMemo(() => {
    const isCancelled = order?.status === 0;

    // Map toStatus → timestamp from statusLogs for accurate step times
    const logTimeByStatus: Record<string, string> = {};
    (order?.statusLogs ?? []).forEach((log) => {
      if (log.toStatus && log.createdAt) {
        logTimeByStatus[log.toStatus] = log.createdAt;
      }
    });
    const logTime = (status: number) => logTimeByStatus[String(status)] ?? null;

    // For cancelled orders: build steps only from what statusLogs recorded
    if (isCancelled) {
      return (order?.statusLogs ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((log) => ({
          title: STATUS_TITLE[Number(log.toStatus)] ?? `Status ${log.toStatus}`,
          time: formatDateTime(log.createdAt),
          completed: Number(log.toStatus) !== 0,
          cancelled: Number(log.toStatus) === 0,
          isActive: false,
        }));
    }

    const cur = STEP_STATUSES.includes(order?.status ?? -1) ? (order?.status ?? 0) : 0;

    return [
      { status: 1, title: "Order Placed", time: logTime(1) ?? order?.createdAt },
      { status: 2, title: "Confirmed", time: logTime(2) ?? order?.confirmedAt },
      { status: 3, title: "Verified", time: logTime(3) ?? order?.processingAt },
      { status: 4, title: "Processing", time: logTime(4) ?? order?.processingAt },
      { status: 5, title: "Packed", time: logTime(5) ?? order?.processingAt },
      { status: 6, title: "Shipped", time: logTime(6) ?? order?.shippedAt },
      {
        status: 7,
        title: "Delivered",
        time: logTime(7) ?? order?.deliveredAt ?? order?.estimatedDelivery,
      },
    ].map((step) => ({
      title: step.title,
      time: step.time ? formatDateTime(step.time) : "—",
      completed: cur > 0 && cur >= step.status,
      cancelled: false,
      isActive: cur > 0 ? cur === step.status : step.status === 1,
    }));
  }, [order]);
}
