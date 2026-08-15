// Return status codes, synchronised with the backend and the web client.
export const RETURN_STATUS = {
  REQUESTED: 1,
  APPROVED: 2,
  PICKED_UP: 3,
  RECEIVED: 4,
  COMPLETED: 5,
  REJECTED: 6,
  CANCELLED: 7,
} as const;

export type ReturnStatusValue =
  (typeof RETURN_STATUS)[keyof typeof RETURN_STATUS];

// Styled like ORDER_STATUS in src/types/order.ts for visual consistency.
export const RETURN_STATUS_LABELS: Record<
  number,
  { label: string; bg: string; text: string; border: string }
> = {
  [RETURN_STATUS.REQUESTED]: {
    label: "Return Requested",
    bg: "#FFFBE8",
    text: "#92600A",
    border: "#FFE998",
  },
  [RETURN_STATUS.APPROVED]: {
    label: "Return Approved",
    bg: "#ECFDF5",
    text: "#16A34A",
    border: "#BBF7D0",
  },
  [RETURN_STATUS.PICKED_UP]: {
    label: "Picked Up",
    bg: "#E8F5FF",
    text: "#005F99",
    border: "#99CCFF",
  },
  [RETURN_STATUS.RECEIVED]: {
    label: "Received",
    bg: "#E8F5FF",
    text: "#005F99",
    border: "#99CCFF",
  },
  [RETURN_STATUS.COMPLETED]: {
    label: "Refund Completed",
    bg: "#ECFDF5",
    text: "#00703C",
    border: "#16A34A",
  },
  [RETURN_STATUS.REJECTED]: {
    label: "Return Rejected",
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
  },
  [RETURN_STATUS.CANCELLED]: {
    label: "Return Cancelled",
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#E5E7EB",
  },
};
