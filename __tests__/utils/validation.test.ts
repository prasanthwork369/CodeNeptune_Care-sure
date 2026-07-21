import { sanitize } from "@/src/utils/validation";

describe("sanitize.phone", () => {
  it("keeps a plain 10-digit number unchanged", () => {
    expect(sanitize.phone("9898856008")).toBe("9898856008");
  });

  it("strips formatting characters from a pasted number", () => {
    expect(sanitize.phone("98988 56008")).toBe("9898856008");
    expect(sanitize.phone("+91-98988-56008")).toBe("9898856008");
    expect(sanitize.phone("(989) 885-6008")).toBe("9898856008");
  });

  // The bug this guards: slicing the first 10 digits kept "91" and dropped the
  // last two, silently sending an OTP to a different number.
  it("drops a +91 country code instead of truncating the number", () => {
    expect(sanitize.phone("+919898856008")).toBe("9898856008");
    expect(sanitize.phone("919898856008")).toBe("9898856008");
  });

  it("drops a leading trunk zero", () => {
    expect(sanitize.phone("09898856008")).toBe("9898856008");
  });

  it("never returns more than 10 digits", () => {
    expect(sanitize.phone("12345678901234")).toHaveLength(10);
  });

  it("leaves a 10-digit number starting with 91 alone", () => {
    expect(sanitize.phone("9188856008")).toBe("9188856008");
  });

  it("handles partial input while typing", () => {
    expect(sanitize.phone("")).toBe("");
    expect(sanitize.phone("98")).toBe("98");
  });
});
