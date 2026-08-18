import { Order, TrackingStep } from "../types";
import { CANCELLED_STATUSES, ORDER_STATUS_CODE } from "../constants/order-status";
import { RETURN_STATUS } from "../constants/return-status";
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

const { PICKED, CHECKED, SHIPPED, DELIVERED, PARTIALLY_PICKED, PACKED } =
  ORDER_STATUS_CODE;

const STATUS_TITLE: Record<number, string> = {
  0: "Cancelled",
  1: "Order Placed",
  2: "Confirmed",
  3: "Verified by Pharmacist",
  4: "Processing",
  5: "Processing",
  6: "Shipped",
  7: "Delivered",
  8: "Under Review",
  9: "Processing",
  10: "Under Review",
  11: "Under Review",
  12: "Dispatch Cancelled",
  14: "Packed",
};

// Display pipeline is 7 fixed steps; several raw statuses collapse into the
// same step (e.g. PICKED/CHECKED/PARTIALLY_PICKED all read as "Processing").
const PIPELINE_STATUSES = [1, 2, 3, 4, 5, 6, 7];

function getCompletedSteps(status: number): number[] {
  switch (status) {
    case 1:
      return [1];
    case 2:
      return [1, 2];
    case 3:
      return [1, 2, 3];
    case PICKED:
    case PARTIALLY_PICKED:
    case CHECKED:
      return [1, 2, 3, 4];
    case PACKED:
      return [1, 2, 3, 4, 5];
    case SHIPPED:
      return [1, 2, 3, 4, 5, 6];
    case DELIVERED:
      return [1, 2, 3, 4, 5, 6, 7];
    default:
      return [1];
  }
}

function isPipelineStepActive(pipelineStep: number, status: number): boolean {
  if (pipelineStep === 4)
    return status === PICKED || status === PARTIALLY_PICKED || status === CHECKED;
  if (pipelineStep === 5) return status === PACKED;
  // Delivered is terminal — the order is done, so it shouldn't pulse as
  // "in progress" the way an in-flight step does.
  if (pipelineStep === DELIVERED) return false;
  return status === pipelineStep;
}

const RETURN_STEP_TITLE: Record<number, string> = {
  [RETURN_STATUS.PICKED_UP]: "Item Picked Up",
  [RETURN_STATUS.COMPLETED]: "Refund Completed",
};
const RETURN_STEP_STATUSES = [RETURN_STATUS.PICKED_UP, RETURN_STATUS.COMPLETED];

function buildReturnSteps(
  activeReturn: NonNullable<Order["returns"]>[number],
): TrackingStep[] {
  const cur = activeReturn.status;

  const logTimeByStatus: Record<string, string> = {};
  (activeReturn.statusLogs ?? []).forEach((log) => {
    if (log.toStatus != null && log.createdAt) {
      logTimeByStatus[String(log.toStatus)] = log.createdAt;
    }
  });

  // Matches the web client exactly: no special-casing for a rejected/
  // cancelled return, so both steps still read as done once the return
  // status number has passed them.
  return RETURN_STEP_STATUSES.map((status) => ({
    title: RETURN_STEP_TITLE[status],
    time: formatDateTime(logTimeByStatus[String(status)]),
    completed: cur >= status,
    cancelled: false,
    isActive: cur === status,
  }));
}

export function useOrderTrackingSteps(
  order: Order | null | undefined,
): TrackingStep[] {
  return useMemo(() => {
    const isCancelled =
      order?.status != null && CANCELLED_STATUSES.includes(order.status);

    // For cancelled orders: build steps only from what statusLogs recorded
    if (isCancelled) {
      return (order?.statusLogs ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        )
        .map((log) => {
          const toStatus = Number(log.toStatus);
          const isCancelRow = CANCELLED_STATUSES.includes(toStatus);
          return {
            title: STATUS_TITLE[toStatus] ?? `Status ${log.toStatus}`,
            time: formatDateTime(log.createdAt),
            completed: !isCancelRow,
            cancelled: isCancelRow,
            isActive: false,
          };
        });
    }

    // Map pipeline step id → timestamp. Raw CHECKED (5) must not seed step 5
    // ("Packed") — only the real PACKED status (14) fills that step's time.
    const logTimeByPipelineStep: Record<number, string> = {};
    if (order?.createdAt) logTimeByPipelineStep[1] = order.createdAt;
    (order?.statusLogs ?? []).forEach((log) => {
      const statusNum = Number(log.toStatus);
      if (!log.createdAt) return;
      if (statusNum !== CHECKED && PIPELINE_STATUSES.includes(statusNum)) {
        logTimeByPipelineStep[statusNum] = log.createdAt;
      }
      if (
        statusNum === PICKED ||
        statusNum === PARTIALLY_PICKED ||
        statusNum === CHECKED
      ) {
        logTimeByPipelineStep[4] = log.createdAt;
      }
      if (statusNum === PACKED) {
        logTimeByPipelineStep[5] = log.createdAt;
      }
    });

    const cur = order?.status ?? -1;
    const completedSteps = getCompletedSteps(cur);
    const isDelivered = cur === DELIVERED;

    const activeReturn = order?.returns?.[0];
    const showReturnSteps = isDelivered && !!activeReturn;

    const stepTitles: Record<number, string> = {
      1: "Order Placed",
      2: "Confirmed",
      3: "Verified",
      4: "Processing",
      5: "Packed",
      6: "Shipped",
      7: "Delivered",
    };

    const baseSteps: TrackingStep[] = PIPELINE_STATUSES.map((step) => ({
      title: stepTitles[step],
      time: formatDateTime(logTimeByPipelineStep[step]),
      completed: completedSteps.includes(step),
      cancelled: false,
      isActive: isPipelineStepActive(step, cur),
    }));

    return showReturnSteps && activeReturn
      ? [...baseSteps, ...buildReturnSteps(activeReturn)]
      : baseSteps;
  }, [order]);
}
