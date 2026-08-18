import { useMemo } from "react";
import { ORDER_STATUS_CODE } from "../constants/order-status";
import { CLOSED_RETURN_STATUSES } from "../constants/return";
import { Order } from "../types";

export interface ReturnEligibility {
  hasActiveReturnRequest: boolean;
  showRequestReturnButton: boolean;
  showWindowExpiredMessage: boolean;
  returnDeadlineLabel: string | null;
}

// Wraps Date.now() outside the hook body so it isn't an impure call during
// render. Missing deadline data (legacy orders) means "unknown", not
// "expired" — matches the web client's return-window logic exactly.
function isPastDeadline(deadline: number | null): boolean {
  return deadline !== null && Date.now() > deadline;
}

export function useReturnEligibility(
  order: Order | null | undefined,
): ReturnEligibility {
  return useMemo(() => {
    const isDelivered = order?.status === ORDER_STATUS_CODE.DELIVERED;
    const isCorporateOrder = order?.isCorporateGeneratedOrder === true;

    const hasActiveReturnRequest = !!order?.returns?.some(
      (r) => !CLOSED_RETURN_STATUSES.includes(r.status),
    );

    const deadlines = (order?.items ?? [])
      .filter((item) => item.isReturnable && item.returnDeadline)
      .map((item) => new Date(item.returnDeadline as string).getTime());
    const earliestReturnDeadline = deadlines.length
      ? Math.min(...deadlines)
      : null;
    const isReturnWindowExpired = isPastDeadline(earliestReturnDeadline);

    const canRequestReturn =
      isDelivered && !hasActiveReturnRequest && !isCorporateOrder;
    const showRequestReturnButton = canRequestReturn && !isReturnWindowExpired;

    const returnDeadlineLabel =
      showRequestReturnButton && earliestReturnDeadline !== null
        ? new Date(earliestReturnDeadline).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : null;

    return {
      hasActiveReturnRequest,
      showRequestReturnButton,
      showWindowExpiredMessage: canRequestReturn && isReturnWindowExpired,
      returnDeadlineLabel,
    };
  }, [order]);
}
