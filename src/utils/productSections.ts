import {
  SECTION_DESIGN_TYPE,
  isKnownSectionDesignType,
} from "@/src/constants/product-section-design";
import {
  ApiAdditionalDataMap,
  ApiProductSection,
  FaqItem,
  KeyValueRow,
  ProductSection,
  SafetyAdviceItem,
} from "@/src/features/product/types";

// The backend sends arrays either as real arrays or as a JSON-encoded string.
const toArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed.startsWith("[")) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Design type 2 is plain bullet text. Some backend fields still wrap each
// point in paragraph/list markup, which React Native Text would expose
// literally (for example "<p>Improves immunity</p>").
export const htmlToPlainText = (value: string): string =>
  value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(?:p|li)>/gi, " ")
    .replace(/<\/?[a-z][^>]*>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

const normalizePoints = (values: unknown[]): string[] =>
  values
    .map((value) => htmlToPlainText(String(value)))
    .filter((value) => value.length > 0);

// Bullet data can be a JSON array, a pipe-separated string, or a single sentence.
const toPoints = (data: unknown): string[] => {
  if (Array.isArray(data)) return normalizePoints(data);

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) return [];
    // A JSON array is authoritative: "[]" means no points, not a bullet reading "[]".
    if (trimmed.startsWith("[")) {
      return normalizePoints(toArray(trimmed));
    }
    if (trimmed.includes("|")) {
      return normalizePoints(trimmed.split("|"));
    }
    const point = htmlToPlainText(trimmed);
    return point ? [point] : [];
  }
  return [];
};

// "actionClass" -> "Action Class". The backend sends camelCase keys with no labels.
export const humanizeKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();

const toRows = (data: unknown): KeyValueRow[] => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  return Object.entries(data as Record<string, unknown>)
    .filter(([, value]) => value != null && String(value).trim() !== "")
    .map(([key, value]) => ({ label: humanizeKey(key), value: String(value) }));
};

const toFaqs = (data: unknown): FaqItem[] =>
  toArray(data)
    .map((entry) => entry as Partial<FaqItem>)
    .filter((entry) => !!entry?.question && !!entry?.answer)
    .map((entry) => ({ question: entry.question!, answer: entry.answer! }));

const toAdviceItems = (data: unknown): SafetyAdviceItem[] =>
  toArray(data)
    .map((entry) => entry as SafetyAdviceItem)
    .filter((entry) => !!entry?.title || !!entry?.description);

// Returns null when the section carries no usable content, so empty ones never render.
// Tab labels only. An unlisted key still renders — it just falls back to its humanised key,
// so a section the backend adds later needs no app change.
const SECTION_LABELS: Record<string, string> = {
  shortDescription: "Quick Summary",
  longDescription: "Description",
  safetyGuidance: "Safety Advice",
  howToUse: "How to Use",
  directionsForUse: "Directions",
  sideEffects: "Side Effects",
  forgottenDose: "Missed Dose",
  dailyDose: "Daily Dose",
  quickTips: "Quick Tips",
  drugFoodInteraction: "Food Interaction",
  drugDiseaseInteractions: "Disease Interaction",
  productHighlights: "Highlights",
  keyIngredients: "Ingredients",
  safetyInstructions: "Safety Info",
  faqs: "FAQs",
  factBox: "Fact Box",
};

const buildSection = (
  id: string,
  raw: ApiProductSection,
): ProductSection | null => {
  const designType = raw.design_type;
  if (designType == null || !isKnownSectionDesignType(designType)) return null;

  const base = {
    id,
    title: raw.title?.trim() || humanizeKey(id),
    label: SECTION_LABELS[id] ?? humanizeKey(id),
    sortOrder: raw.sort_order ?? Number.MAX_SAFE_INTEGER,
  };

  switch (designType) {
    case SECTION_DESIGN_TYPE.TEXT_BLOCK: {
      const html = typeof raw.data === "string" ? raw.data.trim() : "";
      return html ? { ...base, designType, html } : null;
    }
    case SECTION_DESIGN_TYPE.BULLET_LIST: {
      const points = toPoints(raw.data);
      return points.length ? { ...base, designType, points } : null;
    }
    case SECTION_DESIGN_TYPE.FAQ_ACCORDION: {
      const faqs = toFaqs(raw.data);
      return faqs.length ? { ...base, designType, faqs } : null;
    }
    case SECTION_DESIGN_TYPE.ICON_ADVICE_CARDS: {
      const items = toAdviceItems(raw.data);
      return items.length ? { ...base, designType, items } : null;
    }
    case SECTION_DESIGN_TYPE.KEY_VALUE_TABLE: {
      const rows = toRows(raw.data);
      return rows.length ? { ...base, designType, rows } : null;
    }
  }
};

/**
 * Turns the additionalData map into an ordered, renderable list.
 * Every key is read generically, so a section the backend adds later shows up with no app change.
 */
export const parseProductSections = (
  additionalData?: ApiAdditionalDataMap | null,
): ProductSection[] => {
  if (!additionalData) return [];

  return Object.entries(additionalData)
    .flatMap(([id, raw]) => {
      if (!raw || typeof raw !== "object") return [];
      const section = buildSection(id, raw);
      return section ? [section] : [];
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
};
