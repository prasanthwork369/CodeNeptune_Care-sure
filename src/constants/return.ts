export const REFUND_METHOD = {
  WALLET: 1,
  ORIGINAL_PAYMENT: 2,
} as const;

export type RefundMethodValue = typeof REFUND_METHOD[keyof typeof REFUND_METHOD];

export const REFUND_METHOD_LABELS: Record<RefundMethodValue, string> = {
  [REFUND_METHOD.WALLET]: 'CareSure Wallet',
  [REFUND_METHOD.ORIGINAL_PAYMENT]: 'Original Payment Method',
};

// Closed/terminal return statuses -- an order with a return outside these is
// treated as "already has an active return request".
export const CLOSED_RETURN_STATUSES = [6, 7];
