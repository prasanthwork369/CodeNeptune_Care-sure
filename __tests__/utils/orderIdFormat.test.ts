import { formatOrderId } from "@/src/utils/order";

describe("formatOrderId Utility", () => {
  it("returns empty string for null, undefined, or empty values", () => {
    expect(formatOrderId(undefined)).toBe("");
    expect(formatOrderId(null as any)).toBe("");
    expect(formatOrderId("")).toBe("");
    expect(formatOrderId("   ")).toBe("");
  });

  it("formats standard UUIDs cleanly with CS- prefix and 6-char uppercase suffix", () => {
    const rawUuid = "66f5a2b1-3c4d-5e6f-7a8b-9c0d1e2f3a4b";
    expect(formatOrderId(rawUuid)).toBe("CS-2F3A4B");
  });

  it("formats MongoDB ObjectIds into CS- prefix format", () => {
    const mongoId = "60c72b2f9b1d8b2d8890a1b2";
    expect(formatOrderId(mongoId)).toBe("CS-90A1B2");
  });

  it("formats numeric order IDs consistently", () => {
    expect(formatOrderId("12345678")).toBe("CS-345678");
    expect(formatOrderId(123456)).toBe("CS-123456");
  });

  it("preserves CS- prefix if already present", () => {
    expect(formatOrderId("CS-8890A1")).toBe("CS-8890A1");
    expect(formatOrderId("cs-8890a1")).toBe("CS-8890A1");
  });
});
