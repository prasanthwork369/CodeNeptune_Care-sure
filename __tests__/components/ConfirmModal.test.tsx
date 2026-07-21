import React from "react";
import { renderWithProviders, fireEvent } from "@/__tests__/test-utils/renderWithProviders";
import { ConfirmModal } from "@/src/components/ui/ConfirmModal";

describe("ConfirmModal Component", () => {
  const onConfirmMock = jest.fn();
  const onCancelMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders title, message, and action button labels when visible", () => {
    const { getByText } = renderWithProviders(
      <ConfirmModal
        visible={true}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
        title="Delete Address"
        message="Are you sure you want to delete this delivery address?"
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
      />
    );

    expect(getByText("Delete Address")).toBeTruthy();
    expect(getByText("Are you sure you want to delete this delivery address?")).toBeTruthy();
    expect(getByText("Yes, Delete")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("triggers onConfirm callback when confirm button is pressed", () => {
    const { getByText } = renderWithProviders(
      <ConfirmModal
        visible={true}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Confirm Logout"
        cancelLabel="Stay Logged In"
      />
    );

    fireEvent.press(getByText("Confirm Logout"));
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(onCancelMock).not.toHaveBeenCalled();
  });

  it("triggers onCancel callback when cancel button is pressed", () => {
    const { getByText } = renderWithProviders(
      <ConfirmModal
        visible={true}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
        title="Discard Changes"
        message="Your unsaved changes will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
      />
    );

    fireEvent.press(getByText("Keep Editing"));
    expect(onCancelMock).toHaveBeenCalledTimes(1);
    expect(onConfirmMock).not.toHaveBeenCalled();
  });

  it("renders nothing visible when visible prop is false", () => {
    const { queryByText } = renderWithProviders(
      <ConfirmModal
        visible={false}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
        title="Hidden Dialog"
        message="This should not be rendered"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
      />
    );

    expect(queryByText("Hidden Dialog")).toBeNull();
  });
});
