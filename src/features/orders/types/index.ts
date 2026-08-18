export interface TrackingStep {
  title: string;
  time: string;
  completed: boolean;
  cancelled?: boolean;
  isActive?: boolean;
}

export type OrderTabKey = "all" | "delivered" | "cancelled";

export const ORDER_STATUS: Record<
  number,
  { label: string; bg: string; text: string; border: string }
> = {
  0: { label: "CANCELED", bg: "#FFF7ED", text: "#C47A00", border: "#FED7AA" },
  1: { label: "PLACED", bg: "#FFFBE8", text: "#7A7600", border: "#FDE047" },
  2: { label: "CONFIRMED", bg: "#ECFDF5", text: "#16A34A", border: "#BBF7D0" },
  3: { label: "VERIFIED", bg: "#ECFDF5", text: "#16A34A", border: "#BBF7D0" },
  // Raw 5 is CHECKED (internal warehouse step) — shown as PROCESSING, same as 4/9.
  4: { label: "PROCESSING", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  5: { label: "PROCESSING", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  6: { label: "SHIPPED", bg: "#E8F5FF", text: "#005F99", border: "#99CCFF" },
  7: { label: "DELIVERED", bg: "#ECFDF5", text: "#00703C", border: "#16A34A" },
  8: {
    label: "UNDER REVIEW",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
  },
  9: { label: "PROCESSING", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
  10: {
    label: "UNDER REVIEW",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
  },
  11: {
    label: "UNDER REVIEW",
    bg: "#F5F3FF",
    text: "#7C3AED",
    border: "#DDD6FE",
  },
  12: {
    label: "DISPATCH CANCELLED",
    bg: "#FEF2F2",
    text: "#DC2626",
    border: "#FECACA",
  },
  // Raw 14 is the real PACKED status (raw 5 is the internal CHECKED step).
  14: { label: "PACKED", bg: "#FFFBE8", text: "#92600A", border: "#FFE998" },
};

export * from "./api.types";
