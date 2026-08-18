import React from "react";
import {
  renderWithProviders,
  fireEvent,
  waitFor,
} from "@/__tests__/test-utils/renderWithProviders";
import { EmailVerifyModal } from "@/src/features/profile/components/EmailVerifyModal";
import { useEmailVerification } from "@/src/features/profile/hooks/useEmailVerification";
import { useOtpInput } from "@/src/hooks/ui/useOtpInput";

jest.mock("@/src/features/profile/hooks/useEmailVerification");
jest.mock("@/src/hooks/ui/useOtpInput");

const mockUseEmailVerification = useEmailVerification as jest.MockedFunction<
  typeof useEmailVerification
>;
const mockUseOtpInput = useOtpInput as jest.MockedFunction<typeof useOtpInput>;

describe("EmailVerifyModal Component", () => {
  const onCloseMock = jest.fn();
  const onVerifiedMock = jest.fn();
  const verifyMock = jest.fn();
  const resetVerifyErrorMock = jest.fn();
  const requestVerifyMock = jest.fn();
  const handleOtpChangeMock = jest.fn();
  const handleBoxPressMock = jest.fn();
  const resetOtpMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEmailVerification.mockReturnValue({
      verify: verifyMock.mockResolvedValue(true),
      verifying: false,
      verifyError: "",
      resetVerifyError: resetVerifyErrorMock,
      requestVerify: requestVerifyMock.mockResolvedValue(true),
      requesting: false,
    } as any);

    mockUseOtpInput.mockReturnValue({
      slots: ["1", "2", "3", "4", "5", "6"],
      inputValue: "123456",
      code: "123456",
      activeIndex: 5,
      inputRef: React.createRef<any>(),
      handleBoxPress: handleBoxPressMock,
      handleOtpChange: handleOtpChangeMock,
      reset: resetOtpMock,
    });
  });

  it("renders modal title, email address, and action buttons when visible is true", () => {
    const { getByText } = renderWithProviders(
      <EmailVerifyModal
        isVisible={true}
        email="testuser@caresure.com"
        onClose={onCloseMock}
        onVerified={onVerifiedMock}
      />,
    );

    expect(getByText("Verify Email")).toBeTruthy();
    expect(getByText("testuser@caresure.com")).toBeTruthy();
    expect(getByText("Verify")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("triggers onClose when Cancel button is pressed", () => {
    const { getByText } = renderWithProviders(
      <EmailVerifyModal
        isVisible={true}
        email="testuser@caresure.com"
        onClose={onCloseMock}
        onVerified={onVerifiedMock}
      />,
    );

    const cancelBtn = getByText("Cancel");
    fireEvent.press(cancelBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("triggers verify callback and onVerified when Verify is pressed", async () => {
    const { getByText } = renderWithProviders(
      <EmailVerifyModal
        isVisible={true}
        email="testuser@caresure.com"
        onClose={onCloseMock}
        onVerified={onVerifiedMock}
      />,
    );

    const verifyBtn = getByText("Verify");
    fireEvent.press(verifyBtn);

    await waitFor(() => {
      expect(verifyMock).toHaveBeenCalledWith("123456");
      expect(onVerifiedMock).toHaveBeenCalledTimes(1);
    });
  });

  it("displays verify error text when verifyError is returned and slots have digits", () => {
    mockUseEmailVerification.mockReturnValueOnce({
      verify: verifyMock,
      verifying: false,
      verifyError: "Incorrect verification code",
      resetVerifyError: resetVerifyErrorMock,
      requestVerify: requestVerifyMock,
      requesting: false,
    } as any);

    const { getByText } = renderWithProviders(
      <EmailVerifyModal
        isVisible={true}
        email="testuser@caresure.com"
        onClose={onCloseMock}
        onVerified={onVerifiedMock}
      />,
    );

    expect(getByText("Incorrect verification code")).toBeTruthy();
  });
});
