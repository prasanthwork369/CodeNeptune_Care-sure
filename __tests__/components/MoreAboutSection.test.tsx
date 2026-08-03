import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { MoreAboutSection } from "@/src/components/product/details/sections/MoreAboutSection";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";
import { fireEvent } from "@testing-library/react-native";
import React from "react";

describe("MoreAboutSection", () => {
  it("renders backend sections in sort order using their design types", () => {
    const { getByText, getAllByText } = renderWithProviders(
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
    // Amazon-style layout keeps every section in the vertical reading flow.
    // The full API title appears as the heading, since it says more than the tab label.
    expect(getByText("Possible Side Effects")).toBeTruthy();
    expect(getByText("Dizziness")).toBeTruthy();
    expect(getByText("Drowsiness")).toBeTruthy();
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

  it("shows View More for a long description before layout measurement", () => {
    const { getByText, queryByText } = renderWithProviders(
      <MoreAboutSection
        medicineName="Zonegran Tablet"
        additionalData={{
          longDescription: {
            design_type: SECTION_DESIGN_TYPE.TEXT_BLOCK,
            title: "Description",
            sort_order: 0,
            data: "Long medicine description. ".repeat(30),
          },
        }}
      />,
    );

    expect(getByText("View More")).toBeTruthy();
    expect(queryByText("View Less")).toBeNull();

    fireEvent.press(getByText("View More"));
    expect(getByText("View Less")).toBeTruthy();
  });

  it("keeps only one FAQ open and lets the open FAQ close", () => {
    const { getByText, queryByText } = renderWithProviders(
      <MoreAboutSection
        medicineName="Zonegran Tablet"
        additionalData={{
          faqs: {
            design_type: SECTION_DESIGN_TYPE.FAQ_ACCORDION,
            title: "FAQs",
            sort_order: 0,
            data: [
              { question: "First question?", answer: "First answer." },
              { question: "Second question?", answer: "Second answer." },
            ],
          },
        }}
      />,
    );

    expect(getByText("First answer.")).toBeTruthy();
    expect(queryByText("Second answer.")).toBeNull();

    fireEvent.press(getByText("Second question?"));
    expect(queryByText("First answer.")).toBeNull();
    expect(getByText("Second answer.")).toBeTruthy();

    fireEvent.press(getByText("Second question?"));
    expect(queryByText("Second answer.")).toBeNull();
  });

  it("reveals additional FAQs through View More FAQs", () => {
    const faqs = Array.from({ length: 6 }, (_, index) => ({
      question: `Question ${index + 1}?`,
      answer: `Answer ${index + 1}.`,
    }));
    const { getByText, queryByText } = renderWithProviders(
      <MoreAboutSection
        medicineName="Zonegran Tablet"
        additionalData={{
          faqs: {
            design_type: SECTION_DESIGN_TYPE.FAQ_ACCORDION,
            title: "FAQs",
            sort_order: 0,
            data: faqs,
          },
        }}
      />,
    );

    expect(getByText("Question 4?")).toBeTruthy();
    expect(queryByText("Question 5?")).toBeNull();

    fireEvent.press(getByText("View More FAQs"));
    expect(getByText("Question 5?")).toBeTruthy();
    expect(getByText("Question 6?")).toBeTruthy();

    fireEvent.press(getByText("View Less FAQs"));
    expect(queryByText("Question 5?")).toBeNull();
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
