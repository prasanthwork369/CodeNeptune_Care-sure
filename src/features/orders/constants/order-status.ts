// Order status codes, synchronised with the backend order-service and the
// web client's src/constants/order-status.ts.
export const ORDER_STATUS_CODE = {
  CANCELLED: 0,
  NEW: 1,
  DOCTOR_APPROVED: 2,
  PHARMACIST_APPROVED: 3,
  PICKED: 4,
  CHECKED: 5, // internal warehouse step, shown to the customer as Processing
  SHIPPED: 6,
  DELIVERED: 7,
  CALLER_REVIEW: 8,
  PARTIALLY_PICKED: 9,
  RETURNED_FROM_CALLER: 10,
  RETURNED_FROM_PHARMACIST: 11,
  DISPATCHER_CANCEL: 12,
  PACKED: 14, // the real "packed" status — raw 5 (CHECKED) is not this
} as const;

export type OrderStatusCode =
  (typeof ORDER_STATUS_CODE)[keyof typeof ORDER_STATUS_CODE];

// An order in this state can no longer be self-service cancelled.
export const TERMINAL_OR_CANCELLED_STATUSES: number[] = [
  ORDER_STATUS_CODE.DELIVERED,
  ORDER_STATUS_CODE.CANCELLED,
  ORDER_STATUS_CODE.DISPATCHER_CANCEL,
];

// Both raw codes end the order in a cancelled state.
export const CANCELLED_STATUSES: number[] = [
  ORDER_STATUS_CODE.CANCELLED,
  ORDER_STATUS_CODE.DISPATCHER_CANCEL,
];
