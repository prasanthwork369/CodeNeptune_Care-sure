export type AddressType = "home" | "office" | "other";

export const LABELS = ["HOME", "WORK", "OTHER"] as const;
export type LabelType = (typeof LABELS)[number];
