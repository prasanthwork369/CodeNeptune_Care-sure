/**
 * @module features/prescription-scanner/types
 * Shared TypeScript types for the PrescriptionScanner module.
 */

export interface ScanResult {
  /** Local file URIs of every scanned page, in capture order; empty if none. */
  imageUris: string[];
  /** True when the user cancelled the scanner without capturing an image. */
  cancelled: boolean;
}

export interface RawScanOutput {
  imageUris: string[];
  cancelled: boolean;
}
