const mockDelete = jest.fn();

jest.mock("expo-file-system", () => ({
  File: class {
    uri: string;
    constructor(uri: string) {
      this.uri = uri;
    }
    delete() {
      mockDelete(this.uri);
    }
  },
  Paths: { cache: "file:///cache/" },
}));

import { deleteTempCopy } from "@/src/features/prescription/utils/prescription";
import type { PrescriptionItem } from "@/src/features/prescription/types";

const item = (over: Partial<PrescriptionItem> = {}): PrescriptionItem => ({
  localUri: "file:///cache/prescription_abc123.jpg",
  name: "rx.jpg",
  type: "image/jpeg",
  size: 1024,
  ...over,
});

describe("deleteTempCopy", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes a copy this app created", () => {
    deleteTempCopy(item({ isTempCopy: true }));

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith(
      "file:///cache/prescription_abc123.jpg",
    );
  });

  // The whole safety property: the user's own gallery file is never marked,
  // so it can never be reached by cleanup.
  it("never touches a file the app did not copy", () => {
    deleteTempCopy(
      item({ isTempCopy: false, localUri: "content://media/external/1234" }),
    );
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("treats a missing flag as not-a-copy", () => {
    deleteTempCopy(item());
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it("does nothing for an already-hosted url", () => {
    deleteTempCopy(
      item({ isTempCopy: false, localUri: "https://cdn.example/rx.jpg" }),
    );
    expect(mockDelete).not.toHaveBeenCalled();
  });

  // A stale cache file must never be worth failing an upload over.
  it("swallows a delete failure", () => {
    mockDelete.mockImplementationOnce(() => {
      throw new Error("EBUSY");
    });

    expect(() => deleteTempCopy(item({ isTempCopy: true }))).not.toThrow();
  });
});
