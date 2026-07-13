/**
 * @module features/prescription-scanner/types
 * Shared TypeScript types for the PrescriptionScanner module.
 */

// ─── Primary result returned by PrescriptionScanner.scan() ─────────────────

export interface ScanResult {
  /** Local file URI of the scanned image, or null if no image was captured. */
  imageUri: string | null;
  /** Raw text extracted via OCR. Empty string when OCR is unavailable. */
  extractedText: string;
  /**
   * Confidence that the scanned image is a valid medical prescription.
   * Range: 0.0 (no confidence) – 1.0 (certain).
   */
  confidence: number;
  /** Convenience boolean — true when confidence ≥ HIGH_CONFIDENCE_THRESHOLD. */
  likelyPrescription: boolean;
  /** Prescription-related keywords that were detected in the OCR text. */
  keywords: string[];
  /** True when the user cancelled the scanner without capturing an image. */
  cancelled: boolean;
}

// ─── OCR layer ──────────────────────────────────────────────────────────────

export interface OcrResult {
  /** Full text block recognised from the image. */
  text: string;
  /**
   * Raw confidence returned by the OCR engine (0.0 – 1.0).
   * 0 when OCR is unavailable or the image contained no text.
   */
  confidence: number;
}

// ─── Validation layer ───────────────────────────────────────────────────────

export interface ValidationResult {
  /** Normalised prescription-confidence score (0.0 – 1.0). */
  confidence: number;
  likelyPrescription: boolean;
  /** Subset of PRESCRIPTION_KEYWORDS that appeared in the OCR text. */
  detectedKeywords: string[];
  /** The full OCR text that was analysed. */
  extractedText: string;
}

// ─── Discrete confidence level used for UX branching ────────────────────────

/**
 * - `high`   → proceed silently
 * - `medium` → show advisory warning, still allow continue
 * - `low`    → show stronger warning, still allow upload
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// ─── Scanner layer ──────────────────────────────────────────────────────────

export interface RawScanOutput {
  imageUri: string | null;
  cancelled: boolean;
}
