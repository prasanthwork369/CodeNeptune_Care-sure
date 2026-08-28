import React from "react";
import { render } from "@testing-library/react-native";
import { UploadProgressPanel } from "@/src/features/prescription/sections/preview/UploadProgressPanel";

describe("UploadProgressPanel", () => {
  it("shows the completed-file count in the required format", () => {
    const { getByText } = render(
      <UploadProgressPanel total={6} done={1} percent={23} failed={0} />,
    );

    expect(getByText("1 of 6 files completed")).toBeTruthy();
    expect(getByText("23%")).toBeTruthy();
    expect(getByText("Uploading prescriptions…")).toBeTruthy();
  });

  it("switches to a saving state at 100% without resetting the bar or count", () => {
    const { getByText, queryByText } = render(
      <UploadProgressPanel total={3} done={3} percent={100} failed={0} saving />,
    );

    expect(getByText("Saving prescription…")).toBeTruthy();
    expect(getByText("100%")).toBeTruthy();
    expect(getByText("3 of 3 files completed")).toBeTruthy();
    expect(queryByText("Uploading prescriptions…")).toBeNull();
  });

  it("shows the failed count alongside the completed count", () => {
    const { getByText } = render(
      <UploadProgressPanel total={4} done={2} percent={50} failed={1} />,
    );

    expect(getByText("2 of 4 files completed · 1 failed")).toBeTruthy();
  });
});
