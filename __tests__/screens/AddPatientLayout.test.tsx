import React from "react";
import {
  renderWithProviders,
  fireEvent,
  waitFor,
} from "@/__tests__/test-utils/renderWithProviders";
import { AddPatientLayout } from "@/src/features/profile/screens/AddPatientLayout";
import { useFamilyMembers } from "@/src/features/profile/hooks/useFamilyMembers";
import { useLocalSearchParams } from "expo-router";

jest.mock("@/src/components/ui/UnsavedChangesGuard", () => ({
  UnsavedChangesGuard: () => null,
}));

jest.mock("@/src/components/ui/DatePickerModal", () => ({
  DatePickerModal: () => null,
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

const mockBack = jest.fn();
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ back: mockBack }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: jest.fn(() => ({})),
}));
const mockUseLocalSearchParams = useLocalSearchParams as jest.Mock;

jest.mock("@/src/features/profile/hooks/useFamilyMembers");
const mockUseFamilyMembers = useFamilyMembers as jest.MockedFunction<
  typeof useFamilyMembers
>;

describe("AddPatientLayout save gating", () => {
  const addMemberMock = jest.fn();
  const updateMemberMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({});
    mockUseFamilyMembers.mockReturnValue({
      members: [],
      addMember: addMemberMock.mockResolvedValue({ id: "member-101" }),
      updateMember: updateMemberMock,
    } as any);
  });

  it("disables Add Patient until all required fields are valid", () => {
    const { getByText } = renderWithProviders(<AddPatientLayout />);

    const submitBtn = getByText("Add Patient");
    fireEvent.press(submitBtn);

    expect(addMemberMock).not.toHaveBeenCalled();
  });

  it("keeps Update Details disabled in edit mode until a field actually changes", async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: "member-1" });
    mockUseFamilyMembers.mockReturnValue({
      members: [
        {
          id: "member-1",
          name: "Jane Smith",
          phone: "+919876543210",
          dateOfBirth: "1990-05-15",
          relationship: "Wife",
          gender: "FEMALE",
        },
      ],
      addMember: addMemberMock,
      updateMember: updateMemberMock.mockResolvedValue(undefined),
    } as any);

    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AddPatientLayout />,
    );

    const saveBtn = getByText("Update Details");

    // Untouched: nothing changed since load.
    fireEvent.press(saveBtn);
    expect(updateMemberMock).not.toHaveBeenCalled();

    // Trimmed-equal edit isn't a real change.
    fireEvent.changeText(
      getByPlaceholderText("Enter the name"),
      "Jane Smith ",
    );
    fireEvent.press(saveBtn);
    expect(updateMemberMock).not.toHaveBeenCalled();

    // A real change enables the button.
    fireEvent.changeText(getByPlaceholderText("Enter the name"), "Jane Doe");
    fireEvent.press(saveBtn);
    await waitFor(() => {
      expect(updateMemberMock).toHaveBeenCalledWith(
        "member-1",
        expect.objectContaining({ name: "Jane Doe" }),
      );
    });
  });
});
