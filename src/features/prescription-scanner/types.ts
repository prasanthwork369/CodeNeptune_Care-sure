/**
 * @module features/prescription-scanner/types
 * Shared TypeScript types for the PrescriptionScanner module.
 */

export interface ScanResult {
  /** Local file URI of the scanned image, or null if no image was captured. */
  imageUri: string | null;
  /** True when the user cancelled the scanner without capturing an image. */
  cancelled: boolean;
}

export interface RawScanOutput {
  imageUri: string | null;
  cancelled: boolean;
}
