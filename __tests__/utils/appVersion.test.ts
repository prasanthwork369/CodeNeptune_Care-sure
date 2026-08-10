import { compareVersions, isUpdateRequired } from "@/src/utils/appVersion";

describe("compareVersions", () => {
  it("orders versions numerically, not lexically", () => {
    expect(compareVersions("1.10.0", "1.9.0")).toBe(1);
    expect(compareVersions("1.9.0", "1.10.0")).toBe(-1);
    expect(compareVersions("2.0.0", "1.99.99")).toBe(1);
  });

  it("treats missing trailing segments as zero", () => {
    expect(compareVersions("1.4", "1.4.0")).toBe(0);
    expect(compareVersions("1.4.1", "1.4")).toBe(1);
  });
});

describe("isUpdateRequired", () => {
  it("blocks only when the installed build is genuinely older", () => {
    expect(isUpdateRequired("1.5.0", "1.4.9")).toBe(true);
    expect(isUpdateRequired("1.5.0", "1.5.0")).toBe(false);
    expect(isUpdateRequired("1.5.0", "1.6.0")).toBe(false);
  });

  // Every uncertain input must fail open — wrongly locking a user out of a
  // pharmacy app is far worse than letting an old build keep running.
  it("fails open when the setting is absent", () => {
    expect(isUpdateRequired(undefined, "1.0.0")).toBe(false);
    expect(isUpdateRequired("", "1.0.0")).toBe(false);
  });

  it("fails open when the installed version is unreadable", () => {
    expect(isUpdateRequired("1.5.0", null)).toBe(false);
    expect(isUpdateRequired("1.5.0", "")).toBe(false);
  });

  it("fails open on unparseable version strings", () => {
    expect(isUpdateRequired("v1.5.0", "1.0.0")).toBe(false);
    expect(isUpdateRequired("1.5.0-beta", "1.0.0")).toBe(false);
    expect(isUpdateRequired("latest", "1.0.0")).toBe(false);
    expect(isUpdateRequired("1.5.0", "1.0.0-rc1")).toBe(false);
  });
});
