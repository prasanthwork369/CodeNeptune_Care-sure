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
