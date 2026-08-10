// Backend product type codes. Mirrors the web's PRODUCT_TYPE.
export const PRODUCT_TYPE = {
  MEDICINE: 1,
  OTC: 2,
  FMCG: 3,
} as const;

export type ProductTypeValue = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
