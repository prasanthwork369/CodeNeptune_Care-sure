import {
  fireEvent,
  renderWithProviders,
} from "@/__tests__/test-utils/renderWithProviders";
import { SelectPatientLayout } from "@/src/features/prescription/screens/SelectPatientLayout";

const mockHandleProceed = jest.fn();

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ back: jest.fn() }),
}));

jest.mock("@/src/hooks/ui/useBottomInset", () => ({
  useAdjustedBottomInset: () => 0,
}));

jest.mock("@/src/components/profile/patients/AddPatientSheet", () => ({
  AddPatientSheet: () => null,
}));

jest.mock("@/src/features/prescription/components/HealthProblemSheet", () => ({
  HealthProblemSheet: () => null,
}));

jest.mock("@/src/components/upload/UploadPrescriptionSheet", () => ({
  UploadPrescriptionSheet: () => null,
}));

jest.mock("@/src/features/prescription/hooks/useSelectPatient", () => ({
  useSelectPatient: () => ({
    router: { push: jest.fn() },
    toPay: "1100",
    prescriptionItems: [],
    isAddingImage: false,
    removingImageIndex: null,
    addImageFromLibrary: jest.fn(),
    addImageFromCamera: jest.fn(),
    addImageFromPdf: jest.fn(),
    removeImage: jest.fn(),
    members: [
      {
        id: "patient-1",
        name: "Nilesh",
        relationship: "Me",
        dateOfBirth: "2000-01-01",
        gender: "MALE",
        phone: "+919444444444",
        isDefault: true,
        createdAt: "",
        updatedAt: "",
      },
    ],
    loading: false,
    setSelectedPatientId: jest.fn(),
    selectedPatient: {
      id: "patient-1",
      name: "Nilesh",
      relationship: "Me",
      dateOfBirth: "2000-01-01",
      gender: "MALE",
      phone: "+919444444444",
      isDefault: true,
      createdAt: "",
      updatedAt: "",
    },
    symptoms: "",
    setSymptoms: jest.fn(),
    selectedHealthProblem: null,
    setSelectedHealthProblem: jest.fn(),
    customProblemText: "",
    setCustomProblemText: jest.fn(),
    showHealthSheet: false,
    setShowHealthSheet: jest.fn(),
    isAddPatientSheetVisible: false,
    setIsAddPatientSheetVisible: jest.fn(),
    editingPhone: false,
    phoneValue: "",
    handlePhoneChange: jest.fn(),
    phoneError: "",
    savingPhone: false,
    editingPatient: null,
    setEditingPatient: jest.fn(),
    showEmptyState: false,
    handleUpdatePhone: jest.fn(),
    handleAddPatient: jest.fn(),
    handleEditPatient: jest.fn(),
    handleDeletePatient: jest.fn(),
    handleProceed: mockHandleProceed,
  }),
}));

describe("SelectPatientLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the single Continue footer from the approved design", () => {
    const screen = renderWithProviders(<SelectPatientLayout />);

    expect(screen.getByText("Select Patient")).toBeTruthy();
    expect(screen.getByText("ADD PATIENT")).toBeTruthy();
    expect(screen.getByText("Continue")).toBeTruthy();
    expect(screen.queryByText("Proceed")).toBeNull();
    expect(screen.queryByText("To Pay")).toBeNull();
    expect(screen.queryByText(/Take care/)).toBeNull();
  });

  it("preserves the existing proceed handler", () => {
    const screen = renderWithProviders(<SelectPatientLayout />);

    fireEvent.press(screen.getByTestId("select-patient-continue"));

    expect(mockHandleProceed).toHaveBeenCalledTimes(1);
  });
});
