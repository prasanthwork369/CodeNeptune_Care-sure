import React from "react";
import {
  renderWithProviders,
  fireEvent,
} from "@/__tests__/test-utils/renderWithProviders";
import { ChooseMethodLayout } from "@/src/features/prescription/screens/ChooseMethodLayout";
import { useFamilyMembers } from "@/src/features/profile/hooks/useFamilyMembers";
import { useCart } from "@/src/features/cart/hooks/useCart";
import type { FamilyMember } from "@/src/features/profile/types";

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock(
  "@/src/features/prescription/components/UploadPrescriptionSheet",
  () => ({ UploadPrescriptionSheet: () => null }),
);

jest.mock("@/src/features/profile/components/AddPatientSheet", () => ({
  AddPatientSheet: () => null,
}));

const mockPush = jest.fn();
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ push: mockPush }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ toPay: "1100" }),
}));

jest.mock("@/src/features/cart/hooks/useCart");
jest.mock("@/src/features/profile/hooks/useFamilyMembers");

type FamilyMembersResult = ReturnType<typeof useFamilyMembers>;

/** Only the two fields this screen reads; the rest of the hook is unused here. */
const mockMembers = (members: FamilyMember[], loading: boolean) =>
  jest
    .mocked(useFamilyMembers)
    .mockReturnValue({ members, loading } as unknown as FamilyMembersResult);

const PATIENT = {
  id: "m-1",
  name: "Asha",
  relationship: "Self",
} as FamilyMember;

describe("ChooseMethod Proceed gating", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useCart)
      .mockReturnValue({ items: [] } as unknown as ReturnType<typeof useCart>);
  });

  const selectCallOption = () => {
    const screen = renderWithProviders(<ChooseMethodLayout />);
    fireEvent.press(screen.getByText("Don't have a prescription? Call us"));
    return screen;
  };

  it("keeps Proceed enabled and navigating when patients are known but the list query is still fetching", () => {
    // The state on the way back from Patient Details/Checkout: the members
    // fetch has (re)started with no data of its own, while a patient is
    // already available to the screen.
    mockMembers([PATIENT], true);

    const screen = selectCallOption();
    const proceed = screen.getByText("Proceed");

    fireEvent.press(proceed);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(prescription)/select-patient",
      params: { toPay: "1100" },
    });
  });

  it("still blocks Proceed during a cold load with no patients yet", () => {
    mockMembers([], true);

    const screen = selectCallOption();
    fireEvent.press(screen.getByText("Loading…"));

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigates once the patient list has resolved", () => {
    mockMembers([PATIENT], false);

    const screen = selectCallOption();
    fireEvent.press(screen.getByText("Proceed"));

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("does nothing until an option is selected", () => {
    mockMembers([PATIENT], false);

    const screen = renderWithProviders(<ChooseMethodLayout />);
    fireEvent.press(screen.getByText("Proceed"));

    expect(mockPush).not.toHaveBeenCalled();
  });
});
