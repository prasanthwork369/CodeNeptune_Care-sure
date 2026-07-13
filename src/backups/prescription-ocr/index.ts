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
import { ScanResult } from './types';

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
        level: 'LOW',
        likelyPrescription: false,
        documentDetected: false,
        matchedKeywords: [],
        cancelled: true,
      };
    }

    return this.analyzeImage(imageUri);
  },

  /**
   * Extracted OCR and validation pipeline.
   * Useful when an image URI is acquired via other means (like the Gallery).
   */
  async analyzeImage(imageUri: string): Promise<ScanResult> {
    // Step 2 — OCR (cached, times out gracefully)
    const ocr = await OcrService.recognizeText(imageUri);

    // Step 3 — Validation
    const validation = PrescriptionValidator.analyze(ocr.text);

    return {
      imageUri,
      extractedText: ocr.text,
      confidence: validation.confidence,
      level: validation.level,
      likelyPrescription: validation.likelyPrescription,
      documentDetected: validation.documentDetected,
      matchedKeywords: validation.matchedKeywords,
      warningMessage: validation.warningMessage,
      cancelled: false,
    };
  },
};

// ─── Re-exports for consumers that need the raw types ────────────────────────

export type { ScanResult, OcrResult, ValidationResult } from './types';
export { OcrService } from './ocr.service';
export { ScannerService } from './scanner.service';
export { PrescriptionValidator } from './prescription-validator';

// ─── Unified upload service hook ──────────────────────────────────────────────

export { usePrescriptionUploadService } from './usePrescriptionUploadService';
export type { UsePrescriptionUploadServiceOptions, CapturedAsset } from './usePrescriptionUploadService';
