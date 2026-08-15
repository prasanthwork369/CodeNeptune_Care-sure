import { renderHook, act } from "@testing-library/react-native";
import { useMoreAboutTabs } from "@/src/features/product/hooks/useMoreAboutTabs";
import { SECTION_DESIGN_TYPE } from "@/src/constants/product-section-design";

describe("useMoreAboutTabs", () => {
  const sampleData = {
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
  };

  it("parses sections and defaults to the first section as active", () => {
    const { result } = renderHook(() => useMoreAboutTabs(sampleData));

    expect(result.current.sections).toHaveLength(2);
    expect(result.current.activeSection?.id).toBe("shortDescription");
    expect(result.current.activeSection?.title).toBe("Quick Summary");
  });

  it("updates active section when handleTabPress is invoked", () => {
    const { result } = renderHook(() => useMoreAboutTabs(sampleData));

    act(() => {
      result.current.handleTabPress("sideEffects");
    });

    expect(result.current.activeSection?.id).toBe("sideEffects");
    expect(result.current.activeSection?.title).toBe("Possible Side Effects");
  });

  it("resets active section to first section when additionalData changes", () => {
    const { result, rerender } = renderHook(
      (props: { data: any }) => useMoreAboutTabs(props.data),
      { initialProps: { data: sampleData } },
    );

    act(() => {
      result.current.handleTabPress("sideEffects");
    });
    expect(result.current.activeSection?.id).toBe("sideEffects");

    const newData = {
      faqs: {
        design_type: SECTION_DESIGN_TYPE.FAQ_ACCORDION,
        title: "Frequently Asked Questions",
        sort_order: 0,
        data: [{ question: "Q1", answer: "A1" }],
      },
    };

    rerender({ data: newData });

    expect(result.current.activeSection?.id).toBe("faqs");
    expect(result.current.activeSection?.title).toBe("Frequently Asked Questions");
  });

  it("returns empty sections and undefined activeSection when no valid sections exist", () => {
    const { result } = renderHook(() => useMoreAboutTabs(null));

    expect(result.current.sections).toHaveLength(0);
    expect(result.current.activeSection).toBeUndefined();
  });
});
