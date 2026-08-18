export type AddressType = "home" | "office" | "other";

export const LABELS = ["HOME", "WORK", "OTHER"] as const;
export type LabelType = (typeof LABELS)[number];

export interface Address {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
}
