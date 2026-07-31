import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { MoreAboutSection } from "@/src/components/product/details/sections/MoreAboutSection";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import React from "react";
import { fireEvent } from "@testing-library/react-native";

describe("MoreAboutSection", () => {
  it("renders backend sections in sort order using their design types", () => {
    const { getByText, getAllByText, queryByText } = renderWithProviders(
      <MoreAboutSection
        medicineName="Zonegran Tablet"
        additionalData={{
          faqs: {
            design_type: SECTION_DESIGN_TYPE.FAQ_ACCORDION,
            title: "Frequently Asked Questions",
            sort_order: 2,
            data: [
              { question: "Can I take it daily?", answer: "Ask your doctor." },
            ],
          },
          shortDescription: {
            design_type: SECTION_DESIGN_TYPE.TEXT_BLOCK,
            title: "Quick Summary",
            sort_order: 0,
            data: "Prescription medicine summary.",
          },
          sideEffects: {
            design_type: SECTION_DESIGN_TYPE.BULLET_LIST,
            title: "Possible Side Effects",
            sort_order: 1,
            data: '["Dizziness","Drowsiness"]',
          },
        }}
      />,
    );

    expect(getByText("More About Zonegran Tablet")).toBeTruthy();
    // Tabs carry a short label; the API title would be far too long for the strip.
    // "Quick Summary" appears twice: the tab label and the content heading.
    expect(getAllByText("Quick Summary")).toHaveLength(2);
    expect(getByText("Side Effects")).toBeTruthy();
    expect(getByText("FAQs")).toBeTruthy();
    expect(getByText("Prescription medicine summary.")).toBeTruthy();
    expect(queryByText("Dizziness")).toBeNull();

    fireEvent.press(getByText("Side Effects"));
    // The full API title appears as the heading, since it says more than the tab label.
    expect(getByText("Possible Side Effects")).toBeTruthy();
    expect(getByText("Dizziness")).toBeTruthy();
    expect(getByText("Drowsiness")).toBeTruthy();

    fireEvent.press(getByText("FAQs"));
    expect(getByText("Frequently Asked Questions")).toBeTruthy();
    expect(getByText("Can I take it daily?")).toBeTruthy();
    expect(getByText("Ask your doctor.")).toBeTruthy();
  });

  // Every tab leads with its API heading, even when it repeats the short tab label.
  it("always renders the section heading above the content", () => {
    const { getAllByText } = renderWithProviders(
      <MoreAboutSection
        medicineName="Zonegran Tablet"
        additionalData={{
          shortDescription: {
            design_type: SECTION_DESIGN_TYPE.TEXT_BLOCK,
            title: "Quick Summary",
            sort_order: 0,
            data: "Prescription medicine summary.",
          },
        }}
      />,
    );

    // Once as the tab label, once as the content heading.
    expect(getAllByText("Quick Summary")).toHaveLength(2);
  });

  it("renders nothing when the response has no supported content", () => {
    const { queryByText } = renderWithProviders(
      <MoreAboutSection
        medicineName="Zonegran Tablet"
        additionalData={{
          futureSection: {
            design_type: 99,
            title: "Future Section",
            sort_order: 0,
            data: "Unsupported",
          },
        }}
      />,
    );

    expect(queryByText("More About Zonegran Tablet")).toBeNull();
  });
});
