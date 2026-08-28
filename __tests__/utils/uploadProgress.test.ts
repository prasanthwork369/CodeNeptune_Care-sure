import { computeUploadTotals } from "@/src/features/prescription/utils/uploadProgress";
import type { FileUploadState } from "@/src/features/prescription/hooks/usePrescriptionUploader";
import type { PrescriptionItem } from "@/src/features/prescription/types";

const item = (
  name: string,
  size: number | undefined,
  type = "image/jpeg",
): PrescriptionItem => ({
  localUri: `file:///${name}`,
  name,
  size,
  type,
});

const uploading = (progress: number): FileUploadState => ({
  status: "uploading",
  progress,
});
const success = (): FileUploadState => ({ status: "success", progress: 100 });
const error = (): FileUploadState => ({ status: "error", progress: 0 });
const pending = (): FileUploadState => ({ status: "pending", progress: 0 });

describe("computeUploadTotals", () => {
  it("handles a single image mid-upload", () => {
    const items = [item("a.jpg", 1_000_000)];
    const key = "a.jpg_1000000_image/jpeg";
    const totals = computeUploadTotals(items, { [key]: uploading(40) });

    expect(totals).toEqual({ total: 1, done: 0, failed: 0, percent: 40 });
  });

  it("weights two unequal-sized files by bytes, not by averaging percentages", () => {
    // 1MB file fully done (1,000,000 bytes) + 9MB file at 0% (0 bytes) out of
    // 10MB total = 10% overall — a plain average of (100 + 0) / 2 would say 50%.
    const items = [item("small.jpg", 1_000_000), item("large.jpg", 9_000_000)];
    const states = {
      "small.jpg_1000000_image/jpeg": success(),
      "large.jpg_9000000_image/jpeg": uploading(0),
    };

    expect(computeUploadTotals(items, states).percent).toBe(10);
  });

  it("moves the overall percent by actual bytes as the large file progresses", () => {
    const items = [item("small.jpg", 1_000_000), item("large.jpg", 9_000_000)];
    const at0 = computeUploadTotals(items, {
      "small.jpg_1000000_image/jpeg": success(),
      "large.jpg_9000000_image/jpeg": uploading(0),
    }).percent;
    const at50 = computeUploadTotals(items, {
      "small.jpg_1000000_image/jpeg": success(),
      "large.jpg_9000000_image/jpeg": uploading(50),
    }).percent;
    const at100 = computeUploadTotals(items, {
      "small.jpg_1000000_image/jpeg": success(),
      "large.jpg_9000000_image/jpeg": success(),
    }).percent;

    // (1M + 4.5M) / 10M = 55%
    expect(at0).toBe(10);
    expect(at50).toBe(55);
    expect(at100).toBe(100);
    expect(at50).toBeGreaterThan(at0);
    expect(at100).toBeGreaterThan(at50);
  });

  it("handles 6 images with unequal sizes and mixed statuses", () => {
    const sizes = [500_000, 1_000_000, 2_000_000, 250_000, 4_000_000, 750_000];
    const items = sizes.map((size, i) => item(`f${i}.jpg`, size));
    const keyOf = (i: number) => `f${i}.jpg_${sizes[i]}_image/jpeg`;
    const totalBytes = sizes.reduce((a, b) => a + b, 0);

    const states: Record<string, FileUploadState> = {
      [keyOf(0)]: success(),
      [keyOf(1)]: success(),
      [keyOf(2)]: uploading(50),
      [keyOf(3)]: pending(),
      [keyOf(4)]: uploading(10),
      [keyOf(5)]: pending(),
    };
    const uploadedBytes =
      sizes[0] + sizes[1] + sizes[2] * 0.5 + sizes[4] * 0.1;
    const expectedPercent = Math.round((uploadedBytes / totalBytes) * 100);

    const totals = computeUploadTotals(items, states);
    expect(totals.total).toBe(6);
    expect(totals.done).toBe(2);
    expect(totals.failed).toBe(0);
    expect(totals.percent).toBe(expectedPercent);
  });

  it("gives a failed file zero weight instead of freezing at its last progress", () => {
    const items = [item("a.jpg", 1_000_000), item("b.jpg", 1_000_000)];
    const states = {
      "a.jpg_1000000_image/jpeg": success(),
      "b.jpg_1000000_image/jpeg": error(),
    };

    const totals = computeUploadTotals(items, states);
    expect(totals.failed).toBe(1);
    expect(totals.percent).toBe(50); // only the successful half counts
  });

  it("does not regress when a failed file is retried from 0%", () => {
    const items = [item("a.jpg", 1_000_000), item("b.jpg", 1_000_000)];
    const beforeRetry = computeUploadTotals(items, {
      "a.jpg_1000000_image/jpeg": success(),
      "b.jpg_1000000_image/jpeg": error(),
    }).percent;
    const duringRetry = computeUploadTotals(items, {
      "a.jpg_1000000_image/jpeg": success(),
      "b.jpg_1000000_image/jpeg": uploading(0),
    }).percent;

    expect(duringRetry).toBeGreaterThanOrEqual(beforeRetry);
  });

  it("reflects two concurrent workers uploading different files at once", () => {
    const items = [item("a.jpg", 2_000_000), item("b.jpg", 2_000_000)];
    const states = {
      "a.jpg_2000000_image/jpeg": uploading(25),
      "b.jpg_2000000_image/jpeg": uploading(75),
    };

    // (0.5M + 1.5M) / 4M = 50%
    expect(computeUploadTotals(items, states).percent).toBe(50);
  });

  it("never exceeds 100 even if a progress value is malformed above 100", () => {
    const items = [item("a.jpg", 1_000_000)];
    const states = { "a.jpg_1000000_image/jpeg": uploading(140) };

    expect(computeUploadTotals(items, states).percent).toBe(100);
  });

  it("falls back to the average known size for an item with no size (e.g. scanner-seeded)", () => {
    // Scanner item has no size; gallery item does. The unsized item should be
    // weighted using the known item's size, not zero — so it still counts.
    const items = [item("scanner.jpg", undefined), item("gallery.jpg", 1_000_000)];
    const states = {
      "scanner.jpg_0_image/jpeg": success(),
      "gallery.jpg_1000000_image/jpeg": uploading(0),
    };

    // Both weighted equally (unsized falls back to the known 1,000,000), so
    // one fully done out of two equal-weight files is 50%, not 0%.
    expect(computeUploadTotals(items, states).percent).toBe(50);
  });

  it("falls back to equal per-file weighting when no file has a known size", () => {
    const items = [item("a.jpg", undefined), item("b.jpg", undefined)];
    const states = {
      "a.jpg_0_image/jpeg": success(),
      "b.jpg_0_image/jpeg": pending(),
    };

    expect(computeUploadTotals(items, states).percent).toBe(50);
  });

  it("returns 0 for an empty item list", () => {
    expect(computeUploadTotals([], {})).toEqual({
      total: 0,
      done: 0,
      failed: 0,
      percent: 0,
    });
  });
});
