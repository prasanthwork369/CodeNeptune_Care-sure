import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";

// The envelope every additionalData entry arrives in, whatever its key.
export interface ApiProductSection {
  data?: unknown;
  design_type?: number;
  title?: string;
  sort_order?: number;
}

export type ApiAdditionalDataMap = Record<string, ApiProductSection | null>;

export interface SafetyAdviceItem {
  image?: string;
  label?: string;
  title?: string;
  description?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface KeyValueRow {
  label: string;
  value: string;
}

interface SectionBase {
  /** The additionalData key, e.g. "shortDescription" — stable across renders. */
  id: string;
  /** Full heading from the API, e.g. "Possible Side Effects of Zonegran Tablet". */
  title: string;
  /** Short tab label, e.g. "Side Effects" — the title is far too long for a tab strip. */
  label: string;
  sortOrder: number;
}

// Discriminated on designType so each renderer gets exactly the shape it needs.
export type ProductSection =
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.TEXT_BLOCK;
      html: string;
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.BULLET_LIST;
      points: string[];
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.FAQ_ACCORDION;
      faqs: FaqItem[];
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.ICON_ADVICE_CARDS;
      items: SafetyAdviceItem[];
    })
  | (SectionBase & {
      designType: typeof SECTION_DESIGN_TYPE.KEY_VALUE_TABLE;
      rows: KeyValueRow[];
    });
