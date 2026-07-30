import React from "react";
import {
  renderWithProviders,
  fireEvent,
  waitFor,
} from "@/__tests__/test-utils/renderWithProviders";
import { AddAddressLayout } from "@/src/components/profile/addresses/AddAddressLayout";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useAuthStore } from "@/src/store/authStore";

const mockBack = jest.fn();
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    back: mockBack,
  }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({}),
}));

jest.mock("@/src/hooks/queries/useAddress");
const mockUseAddress = useAddress as jest.MockedFunction<typeof useAddress>;

describe("AddAddressLayout Component", () => {
  const addAddressMock = jest.fn();
  const updateAddressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
      } as any,
    });
    mockUseAddress.mockReturnValue({
      addresses: [],
      addAddress: addAddressMock.mockResolvedValue({ id: "addr-101" }),
      updateAddress: updateAddressMock,
      submitting: false,
      error: null,
    } as any);
  });

  it("renders screen header, required form input fields, and address type chips", () => {
    const { getByText, getByPlaceholderText } = renderWithProviders(
      <AddAddressLayout />,
    );

    expect(getByText("Add New Address")).toBeTruthy();
    expect(getByPlaceholderText("Enter Full Name")).toBeTruthy();
    expect(getByPlaceholderText("Enter Mobile Number")).toBeTruthy();
    expect(getByPlaceholderText("Enter House Number")).toBeTruthy();
    expect(getByPlaceholderText("Enter City")).toBeTruthy();
    expect(getByPlaceholderText("Enter State")).toBeTruthy();
    expect(getByPlaceholderText("Enter Pincode")).toBeTruthy();
    expect(getByText("HOME")).toBeTruthy();
    expect(getByText("WORK")).toBeTruthy();
    expect(getByText("OTHER")).toBeTruthy();
  });

  it("allows selecting address type chip", () => {
    const { getByText } = renderWithProviders(<AddAddressLayout />);

    const workChip = getByText("WORK");
    fireEvent.press(workChip);

    expect(workChip).toBeTruthy();
  });

  it("fills out form fields and triggers addAddress on save", async () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(
      <AddAddressLayout />,
    );

    fireEvent.changeText(getByPlaceholderText("Enter Full Name"), "Jane Smith");
    fireEvent.changeText(
      getByPlaceholderText("Enter Mobile Number"),
      "9876543210",
    );
    fireEvent.changeText(
      getByPlaceholderText("Enter House Number"),
      "Flat 4B, Sunset Apts",
    );
    fireEvent.changeText(getByPlaceholderText("Enter City"), "Mumbai");
    fireEvent.changeText(getByPlaceholderText("Enter State"), "Maharashtra");
    fireEvent.changeText(getByPlaceholderText("Enter Pincode"), "400001");
    fireEvent.press(getByText("HOME"));

    const saveBtn = getByText("Save Address →");
    fireEvent.press(saveBtn);

    await waitFor(() => {
      expect(addAddressMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Jane Smith",
          phone: "9876543210",
          line1: "Flat 4B, Sunset Apts",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          label: "HOME",
        }),
      );
      expect(mockBack).toHaveBeenCalled();
    });
  });
});
