import { act, renderHook } from "@testing-library/react-native";
import type { PrescriptionItem } from "@/src/types/prescription";

const mockUpload = jest.fn();
const mockDeleteTempCopy = jest.fn();

jest.mock("@/src/api/storage.api", () => ({
  storageApi: { upload: (...a: unknown[]) => mockUpload(...a) },
}));

jest.mock("@/src/utils/prescription", () => ({
  deleteTempCopy: (item: unknown) => mockDeleteTempCopy(item),
}));

import { usePrescriptionUploader } from "@/src/hooks/ui/usePrescriptionUploader";

const item = (name: string): PrescriptionItem => ({
  localUri: `file:///cache/${name}`,
  name,
  type: "image/jpeg",
  size: 100,
  isTempCopy: true,
});

describe("usePrescriptionUploader temp-copy cleanup", () => {
  beforeEach(() => jest.clearAllMocks());

  it("deletes the copy once the upload succeeds", async () => {
    mockUpload.mockResolvedValue({ url: "https://cdn/a.jpg", path: "a.jpg" });
    const { result } = renderHook(() => usePrescriptionUploader("folder"));

    await act(async () => {
      await result.current.uploadAll([item("a.jpg")]);
    });

    expect(mockDeleteTempCopy).toHaveBeenCalledTimes(1);
    expect(mockDeleteTempCopy).toHaveBeenCalledWith(
      expect.objectContaining({ name: "a.jpg" }),
    );
  });

  // A failed file has to stay on disk, or Retry has nothing to send.
  it("keeps the copy when the upload fails", async () => {
    mockUpload.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => usePrescriptionUploader("folder"));

    await act(async () => {
      await result.current.uploadAll([item("a.jpg")]);
    });

    expect(mockDeleteTempCopy).not.toHaveBeenCalled();
  });

  it("cleans up only the files that actually uploaded", async () => {
    mockUpload
      .mockResolvedValueOnce({ url: "https://cdn/a.jpg", path: "a.jpg" })
      .mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => usePrescriptionUploader("folder"));

    await act(async () => {
      await result.current.uploadAll([item("a.jpg"), item("b.jpg")]);
    });

    expect(mockDeleteTempCopy).toHaveBeenCalledTimes(1);
    expect(mockDeleteTempCopy).toHaveBeenCalledWith(
      expect.objectContaining({ name: "a.jpg" }),
    );
  });

  it("deletes the copy after a successful retry", async () => {
    mockUpload.mockRejectedValueOnce(new Error("network"));
    const { result } = renderHook(() => usePrescriptionUploader("folder"));
    const file = item("a.jpg");

    await act(async () => {
      await result.current.uploadAll([file]);
    });
    expect(mockDeleteTempCopy).not.toHaveBeenCalled();

    mockUpload.mockResolvedValueOnce({ url: "https://cdn/a.jpg", path: "a" });
    await act(async () => {
      await result.current.retryOne(file);
    });

    expect(mockDeleteTempCopy).toHaveBeenCalledTimes(1);
  });

  // Hosted URLs short-circuit before any upload, so there is nothing to clean.
  it("does not clean up an already-hosted file", async () => {
    const { result } = renderHook(() => usePrescriptionUploader("folder"));

    await act(async () => {
      await result.current.uploadAll([
        { ...item("a.jpg"), localUri: "https://cdn/existing.jpg" },
      ]);
    });

    expect(mockUpload).not.toHaveBeenCalled();
    expect(mockDeleteTempCopy).not.toHaveBeenCalled();
  });
});
