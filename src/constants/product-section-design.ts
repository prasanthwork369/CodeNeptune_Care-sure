// Backend stamps every product detail section with one of these codes so the client picks a renderer without new fields per content type.
export const SECTION_DESIGN_TYPE = {
  TEXT_BLOCK: 1,
  BULLET_LIST: 2,
  FAQ_ACCORDION: 3,
  ICON_ADVICE_CARDS: 4,
  KEY_VALUE_TABLE: 5,
} as const;

export type SectionDesignTypeValue =
  (typeof SECTION_DESIGN_TYPE)[keyof typeof SECTION_DESIGN_TYPE];

export const VALID_SECTION_DESIGN_TYPES = Object.values(SECTION_DESIGN_TYPE);

// Labels are for logging only — never render these, section titles come from the API.
export const SECTION_DESIGN_TYPE_LABELS: Record<
  SectionDesignTypeValue,
  string
> = {
  [SECTION_DESIGN_TYPE.TEXT_BLOCK]: "Text Block",
  [SECTION_DESIGN_TYPE.BULLET_LIST]: "Bullet List",
  [SECTION_DESIGN_TYPE.FAQ_ACCORDION]: "FAQ Accordion",
  [SECTION_DESIGN_TYPE.ICON_ADVICE_CARDS]: "Icon Advice Cards",
  [SECTION_DESIGN_TYPE.KEY_VALUE_TABLE]: "Key Value Table",
};

// An unknown code must render nothing rather than crash — backend can ship a new type before the app supports it.
export const isKnownSectionDesignType = (
  value: number,
): value is SectionDesignTypeValue =>
  (VALID_SECTION_DESIGN_TYPES as number[]).includes(value);
