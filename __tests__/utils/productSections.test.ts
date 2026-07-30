import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import { ApiAdditionalDataMap } from "@/src/types/productSection";
import { humanizeKey, parseProductSections } from "@/src/utils/productSections";

describe("humanizeKey", () => {
  it("turns camelCase backend keys into readable labels", () => {
    expect(humanizeKey("actionClass")).toBe("Action Class");
    expect(humanizeKey("therapeuticClassDetail")).toBe(
      "Therapeutic Class Detail",
    );
    expect(humanizeKey("habitForming")).toBe("Habit Forming");
  });
});

describe("parseProductSections", () => {
  it("returns nothing when additionalData is missing", () => {
    expect(parseProductSections(null)).toEqual([]);
    expect(parseProductSections(undefined)).toEqual([]);
  });

  it("orders sections by sort_order, not object key order", () => {
    const data: ApiAdditionalDataMap = {
      faqs: {
        design_type: SECTION_DESIGN_TYPE.FAQ_ACCORDION,
        title: "FAQs",
        sort_order: 18,
        data: [{ question: "Q", answer: "A" }],
      },
      shortDescription: {
        design_type: SECTION_DESIGN_TYPE.TEXT_BLOCK,
        title: "Quick Summary",
        sort_order: 0,
        data: "Summary text",
      },
    };

    expect(parseProductSections(data).map((s) => s.id)).toEqual([
      "shortDescription",
      "faqs",
    ]);
  });

  // The whole point: a key the app has never heard of still renders.
  it("renders an unknown key the backend adds later", () => {
    const sections = parseProductSections({
      brandNewSection: {
        design_type: SECTION_DESIGN_TYPE.TEXT_BLOCK,
        sort_order: 5,
        data: "Something new",
      },
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].id).toBe("brandNewSection");
    // No title from the backend, so the key becomes the heading.
    expect(sections[0].title).toBe("Brand New Section");
  });

  it("drops a section whose design_type the app does not support", () => {
    expect(
      parseProductSections({
        futureThing: { design_type: 99, sort_order: 1, data: "x" },
      }),
    ).toEqual([]);
  });

  // sideEffects arrives as a JSON-encoded string, not an array.
  it("parses a JSON-encoded bullet list", () => {
    const sections = parseProductSections({
      sideEffects: {
        design_type: SECTION_DESIGN_TYPE.BULLET_LIST,
        title: "Side Effects",
        sort_order: 7,
        data: '["Dizziness","Loss of appetite","Drowsiness"]',
      },
    });

    expect(sections[0]).toMatchObject({
      designType: SECTION_DESIGN_TYPE.BULLET_LIST,
      points: ["Dizziness", "Loss of appetite", "Drowsiness"],
    });
  });

  it("removes backend paragraph markup from bullet values", () => {
    const sections = parseProductSections({
      productHighlights: {
        design_type: SECTION_DESIGN_TYPE.BULLET_LIST,
        title: "Product Highlights",
        sort_order: 6,
        data: [
          "<p>Supports immunity &amp; general wellness</p>",
          "<li>Easy to consume</li>",
        ],
      },
    });

    expect(sections[0]).toMatchObject({
      points: ["Supports immunity & general wellness", "Easy to consume"],
    });
  });

  it("falls back to pipe-separated and single-sentence bullet data", () => {
    const piped = parseProductSections({
      a: { design_type: SECTION_DESIGN_TYPE.BULLET_LIST, data: "One | Two" },
    });
    expect(piped[0]).toMatchObject({ points: ["One", "Two"] });

    const single = parseProductSections({
      a: { design_type: SECTION_DESIGN_TYPE.BULLET_LIST, data: "Just one" },
    });
    expect(single[0]).toMatchObject({ points: ["Just one"] });
  });

  it("builds key-value rows with humanised labels", () => {
    const sections = parseProductSections({
      factBox: {
        design_type: SECTION_DESIGN_TYPE.KEY_VALUE_TABLE,
        title: "Fact Box",
        sort_order: 20,
        data: {
          actionClass: "Carbonic Anhydrase Inhibitors",
          habitForming: "No",
          chemicalClass: "",
        },
      },
    });

    expect(sections[0]).toMatchObject({
      rows: [
        { label: "Action Class", value: "Carbonic Anhydrase Inhibitors" },
        { label: "Habit Forming", value: "No" },
      ],
    });
  });

  it("keeps safety advice items and faq pairs", () => {
    const sections = parseProductSections({
      safetyGuidance: {
        design_type: SECTION_DESIGN_TYPE.ICON_ADVICE_CARDS,
        sort_order: 2,
        data: [
          {
            image: "https://x/alcohol.svg",
            label: "Unsafe",
            title: "Alcohol",
            description: "May cause drowsiness.",
          },
        ],
      },
      faqs: {
        design_type: SECTION_DESIGN_TYPE.FAQ_ACCORDION,
        sort_order: 3,
        data: [
          { question: "Q1", answer: "A1" },
          { question: "", answer: "no question" },
        ],
      },
    });

    expect(sections[0]).toMatchObject({ items: [{ title: "Alcohol" }] });
    // The malformed pair is dropped.
    expect(sections[1]).toMatchObject({ faqs: [{ question: "Q1" }] });
  });

  it("drops sections with empty content", () => {
    expect(
      parseProductSections({
        blank: { design_type: SECTION_DESIGN_TYPE.TEXT_BLOCK, data: "   " },
        emptyList: { design_type: SECTION_DESIGN_TYPE.BULLET_LIST, data: "[]" },
        emptyBox: {
          design_type: SECTION_DESIGN_TYPE.KEY_VALUE_TABLE,
          data: {},
        },
        nothing: null,
      }),
    ).toEqual([]);
  });
});
