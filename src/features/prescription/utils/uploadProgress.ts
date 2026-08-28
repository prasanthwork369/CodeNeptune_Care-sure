import type { PrescriptionItem } from "../types";
import {
  uploadKeyOf,
  type FileUploadState,
} from "../hooks/usePrescriptionUploader";

export interface UploadTotals {
  total: number;
  done: number;
  failed: number;
  /** Byte-weighted overall progress across all files, 0-100. */
  percent: number;
}

/**
 * Byte-weighted overall upload progress: a large file moving 1% counts for
 * far more than a tiny one, so the bar reflects actual bytes sent rather than
 * one file's percentage or a plain average across files.
 *
 * Files with an unknown size (e.g. seeded straight from the scanner, which
 * has no size at seed time) fall back to the average size of files that do
 * have one, so a single unsized file can't be weighted at zero and vanish
 * from the total. If no file has a known size, every file weighs the same —
 * degrading to a plain per-file average rather than dividing by zero.
 */
export function computeUploadTotals(
  items: PrescriptionItem[],
  states: Record<string, FileUploadState>,
): UploadTotals {
  const total = items.length;
  const knownSizes = items
    .map((item) => item.size)
    .filter((size): size is number => !!size && size > 0);
  const avgKnownSize =
    knownSizes.length > 0
      ? knownSizes.reduce((sum, size) => sum + size, 0) / knownSizes.length
      : 1;

  let done = 0;
  let failed = 0;
  let totalWeight = 0;
  let uploadedWeight = 0;

  for (const item of items) {
    const weight = item.size && item.size > 0 ? item.size : avgKnownSize;
    totalWeight += weight;

    const state = states[uploadKeyOf(item)];
    if (!state) continue;

    if (state.status === "success") {
      done += 1;
      uploadedWeight += weight;
    } else if (state.status === "error") {
      failed += 1;
      // Contributes 0 — matches the thumbnail's "Retry" state, not partial credit.
    } else if (state.status === "uploading") {
      const clamped = Math.max(0, Math.min(100, state.progress));
      uploadedWeight += weight * (clamped / 100);
    }
    // "pending" contributes 0 — not started yet.
  }

  const percent =
    totalWeight > 0
      ? Math.max(0, Math.min(100, Math.round((uploadedWeight / totalWeight) * 100)))
      : 0;

  return { total, done, failed, percent };
}
