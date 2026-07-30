/**
 * Prescription Status Codes
 */
export const PRESCRIPTION_STATUS = {
  CANCELLED: 0,
  NEW: 1,
  APPROVED: 2,
} as const;

export type PrescriptionStatusValue =
  (typeof PRESCRIPTION_STATUS)[keyof typeof PRESCRIPTION_STATUS];

/**
 * Human-readable labels for display or logging
 */
export const PRESCRIPTION_STATUS_LABELS: Record<
  PrescriptionStatusValue,
  string
> = {
  [PRESCRIPTION_STATUS.CANCELLED]: "Rejected",
  [PRESCRIPTION_STATUS.NEW]: "Pending",
  [PRESCRIPTION_STATUS.APPROVED]: "Verified",
};
