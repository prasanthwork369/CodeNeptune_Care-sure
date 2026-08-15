/**
 * @module features/prescription-scanner
 *
 * Public API for the PrescriptionScanner module.
 *
 * PIPELINE
 * ────────
 *   ScannerService.scan()
 *     └─> ScanResult
 */

export type { ScanResult } from "./types";
export { ScannerService } from "./scanner.service";

// ─── Unified upload service hook ──────────────────────────────────────────────

export { usePrescriptionUploadService } from "./usePrescriptionUploadService";
export type {
  UsePrescriptionUploadServiceOptions,
  CapturedAsset,
} from "./usePrescriptionUploadService";
