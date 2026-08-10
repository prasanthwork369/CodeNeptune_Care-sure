import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import React from "react";
import { Text } from "react-native";

// Only the remote payload varies; everything else about the query is irrelevant
// to the clamping rule under test.
const mockQuery = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: () => mockQuery(),
}));

jest.mock("@/src/lib/sqlite/cache", () => ({
  apiCache: { getWithMeta: () => undefined },
  withSqliteCache: (_k: string, fn: unknown) => fn,
}));

const Probe = () => {
  const { useUploadConfig } = require("@/src/hooks/queries/useSettings");
  return <Text>{String(useUploadConfig().maxFiles)}</Text>;
};

const renderWith = (data: unknown) => {
  mockQuery.mockReturnValue({ data });
  return renderWithProviders(<Probe />);
};

describe("useUploadConfig maxFiles", () => {
  beforeEach(() => jest.clearAllMocks());

  it("uses the admin value when it is sane", () => {
    expect(renderWith({ maxFiles: 15 }).getByText("15")).toBeTruthy();
  });

  it("falls back to 10 when the backend sends nothing", () => {
    expect(renderWith(undefined).getByText("10")).toBeTruthy();
    expect(renderWith({}).getByText("10")).toBeTruthy();
  });

  // A 0 would block every upload; a 500 would exhaust memory on a low-end
  // device. Neither may reach the picker, whatever the admin typed.
  it("clamps a too-low value up to 1", () => {
    expect(renderWith({ maxFiles: 0 }).getByText("1")).toBeTruthy();
    expect(renderWith({ maxFiles: -5 }).getByText("1")).toBeTruthy();
  });

  it("clamps a too-high value down to the ceiling", () => {
    expect(renderWith({ maxFiles: 500 }).getByText("20")).toBeTruthy();
  });

  // Garbage falls back to the known-safe default rather than the ceiling —
  // Infinity is not "the admin wants the maximum", it is a broken payload.
  it("ignores non-numeric or non-finite values", () => {
    expect(renderWith({ maxFiles: "abc" }).getByText("10")).toBeTruthy();
    expect(renderWith({ maxFiles: NaN }).getByText("10")).toBeTruthy();
    expect(renderWith({ maxFiles: Infinity }).getByText("10")).toBeTruthy();
  });

  it("floors a fractional value", () => {
    expect(renderWith({ maxFiles: 7.9 }).getByText("7")).toBeTruthy();
  });
});
