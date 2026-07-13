/**
 * @module features/prescription-scanner
 *
 * Public API for the PrescriptionScanner module.
 *
 * USAGE (any upload surface)
 * ──────────────────────────
 *   import { PrescriptionScanner, getConfidenceLevel } from '@/src/features/prescription-scanner';
 *
 *   const result = await PrescriptionScanner.scan();
 *
 *   if (result.cancelled) return;
 *
 *   switch (getConfidenceLevel(result.confidence)) {
 *     case 'high':
 *       // proceed silently
 *       break;
 *     case 'medium':
 *       // show advisory warning — still allow continue
 *       break;
 *     case 'low':
 *       // show stronger warning — still allow upload
 *       break;
 *   }
 *
 *   // result.imageUri is the local file path ready for the upload API
 *
 * PIPELINE
 * ────────
 *   ScannerService.scan()
 *     └─> OcrService.recognizeText(imageUri)
 *           └─> PrescriptionValidator.analyze(text)
 *                 └─> ScanResult (unified object)
 */

import { OcrService } from './ocr.service';
import { PrescriptionValidator } from './prescription-validator';
import { ScannerService } from './scanner.service';
import { ScanResult, ConfidenceLevel } from './types';
import {
  HIGH_CONFIDENCE_THRESHOLD,
  MEDIUM_CONFIDENCE_THRESHOLD,
} from './constants';

// ─── Public orchestrator ──────────────────────────────────────────────────────

export const PrescriptionScanner = {
  /**
   * Full scan pipeline: document scanner → OCR → validation.
   *
   * Always resolves — never rejects. Callers should check `result.cancelled`
   * before doing anything with `result.imageUri`.
   */
  async scan(): Promise<ScanResult> {
    // Step 1 — Acquire image
    const { imageUri, cancelled } = await ScannerService.scan();

    if (cancelled || !imageUri) {
      return {
        imageUri: null,
        extractedText: '',
        confidence: 0,
        likelyPrescription: false,
        keywords: [],
        cancelled: true,
      };
    }

    // Step 2 — OCR (cached, times out gracefully)
    const ocr = await OcrService.recognizeText(imageUri);

    // Step 3 — Validation
    const validation = PrescriptionValidator.analyze(ocr.text);

    return {
      imageUri,
      extractedText: validation.extractedText,
      confidence: validation.confidence,
      likelyPrescription: validation.likelyPrescription,
      keywords: validation.detectedKeywords,
      cancelled: false,
    };
  },
};

// ─── Confidence-level helper (shared by all upload hooks) ─────────────────────

/**
 * Maps a numeric confidence score to one of the three discrete UX levels.
 *
 * @param confidence — value from ScanResult.confidence (0.0 – 1.0)
 */
export function getConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= HIGH_CONFIDENCE_THRESHOLD) return 'high';
  if (confidence >= MEDIUM_CONFIDENCE_THRESHOLD) return 'medium';
  return 'low';
}

// ─── Re-exports for consumers that need the raw types ────────────────────────

export type { ScanResult, OcrResult, ValidationResult, ConfidenceLevel } from './types';
export { OcrService } from './ocr.service';
export { ScannerService } from './scanner.service';
export { PrescriptionValidator } from './prescription-validator';
