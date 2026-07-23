import { CallMethodCard } from "@/src/components/prescription/choose-method/sections/CallMethodCard";
import { RequiresPrescriptionWarning } from "@/src/components/prescription/choose-method/sections/RequiresPrescriptionWarning";
import { UploadMethodCard } from "@/src/components/prescription/choose-method/sections/UploadMethodCard";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import React from "react";

describe("Choose method copy", () => {
  it("uses correct plural prescription copy and normalized medicine units", () => {
    const screen = renderWithProviders(
      <RequiresPrescriptionWarning
        itemCount={2}
        items={[
          { id: "1", medicineName: "Paracip 650mg - 10 Tablet" },
          { id: "2", medicineName: "Parafast 1000mg Injection - 100ml" },
        ]}
      />,
    );

    expect(screen.getByText("2 items require a prescription")).toBeTruthy();
    expect(screen.getByText("Paracip 650 mg – 10 tablets")).toBeTruthy();
    expect(
      screen.getByText("Parafast 1000 mg injection – 100 ml"),
    ).toBeTruthy();
  });

  it("uses sentence case for both method descriptions", () => {
    const upload = renderWithProviders(
      <UploadMethodCard isSelected onSelect={jest.fn()} />,
    );
    expect(
      upload.getByText(
        "The following items require verification before purchase.",
      ),
    ).toBeTruthy();

    const call = renderWithProviders(
      <CallMethodCard isSelected={false} onSelect={jest.fn()} />,
    );
    expect(
      call.getByText(
        "Our pharmacists will assist you and help you complete your order.",
      ),
    ).toBeTruthy();
  });
});
