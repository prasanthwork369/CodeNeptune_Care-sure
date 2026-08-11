import React from "react";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import { ReturnStatusSection } from "@/src/components/profile/orders/tracking-sections/ReturnStatusSection";
import { RETURN_STATUS } from "@/src/constants/return-status";

describe("ReturnStatusSection", () => {
  it("renders nothing when there are no returns", () => {
    const { toJSON } = renderWithProviders(
      <ReturnStatusSection returns={undefined} />,
    );

    expect(toJSON()).toBeNull();
  });

  it("renders nothing when returns is an empty array", () => {
    const { toJSON } = renderWithProviders(<ReturnStatusSection returns={[]} />);

    expect(toJSON()).toBeNull();
  });

  it("renders a badge for the return status", () => {
    const { getByText } = renderWithProviders(
      <ReturnStatusSection
        returns={[{ id: "ret-1", status: RETURN_STATUS.APPROVED }]}
      />,
    );

    expect(getByText("Return Approved")).toBeTruthy();
  });

  it("renders one badge per return when there are multiple", () => {
    const { getByText } = renderWithProviders(
      <ReturnStatusSection
        returns={[
          { id: "ret-1", status: RETURN_STATUS.REQUESTED },
          { id: "ret-2", status: RETURN_STATUS.COMPLETED },
        ]}
      />,
    );

    expect(getByText("Return Requested")).toBeTruthy();
    expect(getByText("Refund Completed")).toBeTruthy();
  });

  it("falls back to a generic badge for an unrecognized status code", () => {
    const { getByText } = renderWithProviders(
      <ReturnStatusSection returns={[{ id: "ret-1", status: 999 }]} />,
    );

    expect(getByText("Return")).toBeTruthy();
  });
});
