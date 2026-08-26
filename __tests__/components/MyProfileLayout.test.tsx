import React from "react";
import {
  renderWithProviders,
  fireEvent,
  act,
} from "@/__tests__/test-utils/renderWithProviders";
import { MyProfileLayout } from "@/src/features/profile/screens/MyProfileLayout";

jest.mock("@/src/components/ui/UnsavedChangesGuard", () => ({
  UnsavedChangesGuard: () => null,
}));

jest.mock("@/src/components/ui/GorhomBottomSheet", () => ({
  GorhomBottomSheet: ({ isVisible, children }: any) =>
    isVisible ? children : null,
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const ReactModule = jest.requireActual("react");
  const { View: NativeView } = jest.requireActual("react-native");

  const MockBottomSheetView = (props: Record<string, unknown>) =>
    ReactModule.createElement(NativeView, props);
  MockBottomSheetView.displayName = "MockBottomSheetView";

  return {
    BottomSheetView: MockBottomSheetView,
  };
});

jest.mock("@/src/components/ui/DatePickerModal", () => ({
  DatePickerModal: ({ visible, onChange }: any) =>
    visible ? (
      <button
        data-testid="mock-date-picker"
        onClick={() => onChange(new Date(1990, 0, 1))}
      />
    ) : null,
}));

const mockUpdateProfile = jest.fn();
let mockProfileData = {
  id: "user-1",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+919876543210",
  gender: "MALE",
  dateOfBirth: "1995-05-12T00:00:00.000Z",
  isEmailVerified: true,
};
let mockUpdating = false;
let mockOffline = false;

jest.mock("@/src/features/profile/hooks/useProfile", () => ({
  useProfile: () => ({
    profile: mockProfileData,
    updating: mockUpdating,
    error: null,
    updateProfile: mockUpdateProfile,
  }),
}));

jest.mock("@/src/features/profile/hooks/useEmailVerification", () => ({
  useEmailVerification: () => ({
    requestVerify: jest.fn(),
    requesting: false,
  }),
}));

jest.mock("@/src/hooks/ui/useIsOffline", () => ({
  useIsOffline: () => mockOffline,
}));

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  }),
}));

describe("MyProfileLayout Save Changes button state", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdating = false;
    mockOffline = false;
    mockProfileData = {
      id: "user-1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      phone: "+919876543210",
      gender: "MALE",
      dateOfBirth: "1995-05-12T00:00:00.000Z",
      isEmailVerified: true,
    };
  });

  it("is disabled when screen first loads without edits", () => {
    const { getByTestId } = renderWithProviders(<MyProfileLayout />);
    const saveBtn = getByTestId("save-profile-btn");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("enables when first name is changed, and disables when restored", () => {
    const { getByTestId, getByDisplayValue } = renderWithProviders(
      <MyProfileLayout />,
    );
    const saveBtn = getByTestId("save-profile-btn");
    const firstNameInput = getByDisplayValue("John");

    fireEvent.changeText(firstNameInput, "Johnny");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(false);

    fireEvent.changeText(firstNameInput, "John");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("enables when last name is changed", () => {
    const { getByTestId, getByDisplayValue } = renderWithProviders(
      <MyProfileLayout />,
    );
    const saveBtn = getByTestId("save-profile-btn");
    const lastNameInput = getByDisplayValue("Doe");

    fireEvent.changeText(lastNameInput, "Smith");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(false);
  });

  it("enables when email is changed to valid email, and disables for invalid email", () => {
    const { getByTestId, getByDisplayValue } = renderWithProviders(
      <MyProfileLayout />,
    );
    const saveBtn = getByTestId("save-profile-btn");
    const emailInput = getByDisplayValue("john.doe@example.com");

    fireEvent.changeText(emailInput, "new.email@example.com");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(false);

    fireEvent.changeText(emailInput, "invalid-email");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("enables when gender is changed", () => {
    const { getByTestId, getByText } = renderWithProviders(<MyProfileLayout />);
    const saveBtn = getByTestId("save-profile-btn");

    fireEvent.press(getByText("Male"));
    fireEvent.press(getByText("Female"));

    expect(saveBtn.props.accessibilityState?.disabled).toBe(false);
  });

  it("disables save button when offline even if changes are present", () => {
    mockOffline = true;
    const { getByTestId, getByDisplayValue } = renderWithProviders(
      <MyProfileLayout />,
    );
    const saveBtn = getByTestId("save-profile-btn");
    const firstNameInput = getByDisplayValue("John");

    fireEvent.changeText(firstNameInput, "Johnny");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("disables save button while updating is in progress", () => {
    mockUpdating = true;
    const { getByTestId, getByDisplayValue } = renderWithProviders(
      <MyProfileLayout />,
    );
    const saveBtn = getByTestId("save-profile-btn");
    const firstNameInput = getByDisplayValue("John");

    fireEvent.changeText(firstNameInput, "Johnny");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(true);
  });

  it("does not call updateProfile when save button is disabled", async () => {
    const { getByTestId } = renderWithProviders(<MyProfileLayout />);
    const saveBtn = getByTestId("save-profile-btn");

    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it("calls updateProfile when valid changes exist and save button is pressed", async () => {
    mockUpdateProfile.mockResolvedValueOnce({ success: true });
    const { getByTestId, getByDisplayValue } = renderWithProviders(
      <MyProfileLayout />,
    );
    const saveBtn = getByTestId("save-profile-btn");
    const firstNameInput = getByDisplayValue("John");

    fireEvent.changeText(firstNameInput, "Johnny");
    expect(saveBtn.props.accessibilityState?.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(saveBtn);
    });

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Johnny" }),
    );
  });
});
