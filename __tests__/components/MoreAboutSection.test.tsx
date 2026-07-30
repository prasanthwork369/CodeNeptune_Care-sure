import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { MoreAboutSection } from "@/src/components/product/details/sections/MoreAboutSection";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import React from "react";
import { fireEvent } from "@testing-library/react-native";

describe("MoreAboutSection", () => {
  it("renders backend sections in sort order using their design types", () => {
    const { getByText, queryByText } = renderWithProviders(
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
    expect(getByText("Quick Summary")).toBeTruthy();
    expect(getByText("Prescription medicine summary.")).toBeTruthy();
    expect(queryByText("Dizziness")).toBeNull();

    fireEvent.press(getByText("Possible Side Effects"));
    expect(getByText("Dizziness")).toBeTruthy();
    expect(getByText("Drowsiness")).toBeTruthy();

    fireEvent.press(getByText("Frequently Asked Questions"));
    expect(getByText("Can I take it daily?")).toBeTruthy();
    expect(getByText("Ask your doctor.")).toBeTruthy();
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
