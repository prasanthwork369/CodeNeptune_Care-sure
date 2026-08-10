// Origin of a catalog product record. Mirrors the web's SOURCE_TYPE.
export const SOURCE_TYPE = {
  INTERNAL: 1, // Our product / house brand
  COMPARABLE: 2, // Search product / third-party brand
} as const;

export type SourceTypeValue = (typeof SOURCE_TYPE)[keyof typeof SOURCE_TYPE];
