import {
  fireEvent,
  renderWithProviders,
} from "@/__tests__/test-utils/renderWithProviders";
import { AddPatientSheet } from "@/src/features/profile/components/AddPatientSheet";
import { StyleSheet } from "react-native";

jest.mock("@/src/components/ui/GorhomBottomSheet", () => {
  const ReactModule = jest.requireActual("react");
  const { View: NativeView } = jest.requireActual("react-native");
  const MockGorhomBottomSheet = ({ isVisible, children }: any) =>
    isVisible ? ReactModule.createElement(NativeView, null, children) : null;

  MockGorhomBottomSheet.displayName = "MockGorhomBottomSheet";

  return { GorhomBottomSheet: MockGorhomBottomSheet };
});

jest.mock("@gorhom/bottom-sheet", () => {
  const ReactModule = jest.requireActual("react");
  const { ScrollView: NativeScrollView, TextInput: NativeTextInput } =
    jest.requireActual("react-native");

  const MockBottomSheetScrollView = ReactModule.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
      ReactModule.createElement(NativeScrollView, { ...props, ref }),
  );
  MockBottomSheetScrollView.displayName = "MockBottomSheetScrollView";

  const MockBottomSheetTextInput = ReactModule.forwardRef(
    (props: Record<string, unknown>, ref: React.Ref<unknown>) =>
      ReactModule.createElement(NativeTextInput, { ...props, ref }),
  );
  MockBottomSheetTextInput.displayName = "MockBottomSheetTextInput";

  return {
    BottomSheetScrollView: MockBottomSheetScrollView,
    BottomSheetTextInput: MockBottomSheetTextInput,
  };
});

jest.mock("@/src/components/ui/DatePickerModal", () => ({
  DatePickerModal: () => null,
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardEvents: {
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

describe("AddPatientSheet field sizing", () => {
  const renderSheet = () =>
    renderWithProviders(
      <AddPatientSheet
        isVisible
        onClose={jest.fn()}
        onAdd={jest.fn().mockResolvedValue(undefined)}
      />,
    );

  it("uses the shared patient input height for all standard fields", () => {
    const screen = renderSheet();

    for (const testID of [
      "add-patient-name-field",
      "add-patient-mobile-field",
      "add-patient-dob-field",
    ]) {
      const style = StyleSheet.flatten(screen.getByTestId(testID).props.style);
      expect(style.height).toBe(52);
    }
  });

  it("applies the same height to the conditional relationship input", () => {
    const screen = renderSheet();

    fireEvent.press(screen.getByText("Other"));

    const style = StyleSheet.flatten(
      screen.getByTestId("add-patient-other-relationship-field").props.style,
    );
    expect(style.height).toBe(52);
  });
});

describe("AddPatientSheet save gating", () => {
  const editPatient = {
    id: "member-1",
    name: "Jane Smith",
    phone: "+919876543210",
    dateOfBirth: "1990-05-15",
    relationship: "Wife",
    gender: "FEMALE",
  };

  it("disables Add Patient until all required fields are filled", () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AddPatientSheet isVisible onClose={jest.fn()} onAdd={onAdd} />,
    );

    const submitBtn = getByText("Add Patient");
    fireEvent.press(submitBtn);
    expect(onAdd).not.toHaveBeenCalled();

    fireEvent.changeText(
      getByPlaceholderText("Enter the name"),
      "New Patient",
    );
    fireEvent.press(submitBtn);
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("keeps Save Changes disabled in edit mode until a field actually changes", async () => {
    const onEdit = jest.fn().mockResolvedValue(undefined);
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AddPatientSheet
        isVisible
        onClose={jest.fn()}
        onAdd={jest.fn()}
        editPatient={editPatient as any}
        onEdit={onEdit}
      />,
    );

    const saveBtn = getByText("Save Changes");

    fireEvent.press(saveBtn);
    expect(onEdit).not.toHaveBeenCalled();

    fireEvent.changeText(getByPlaceholderText("Enter the name"), "Jane Doe");
    fireEvent.press(saveBtn);
    expect(onEdit).toHaveBeenCalledWith(
      "member-1",
      expect.objectContaining({ name: "Jane Doe" }),
    );
  });
});
