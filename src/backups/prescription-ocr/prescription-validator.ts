/**
 * @module features/prescription-scanner/prescription-validator
 *
 * Pure function that analyses OCR text and produces a confidence score
 * indicating how likely the scanned image is a valid medical prescription.
 *
 * SCORING ALGORITHM
 * ─────────────────
 * 1. Count how many PRESCRIPTION_KEYWORDS appear in the lowercased OCR text.
 * 2. Check whether a DOSAGE_PATTERN match is present (adds one keyword-equivalent).
 * 3. Normalise: rawCount / MAX_KEYWORD_SCORE, clamped to [0, 1].
 *
 * This is intentionally simple and deterministic — no ML, no network calls.
 * The thresholds in constants.ts are the primary tuning knobs.
 *
 * SOLID note: this module has no dependencies on scanner or OCR — it is a
 * pure transformation function and can be unit-tested in complete isolation.
 */

import {
  DOSAGE_PATTERN,
  MAX_KEYWORD_SCORE,
  PRESCRIPTION_KEYWORDS,
} from './constants';
import { PrescriptionValidationConfig as config } from './config';
import { ValidationResult } from './types';

export const PrescriptionValidator = {
  /**
   * Analyses raw OCR text and returns a structured validation result.
   *
   * @param text — The full text extracted from the image by OcrService.
   * @returns ValidationResult — always returns a valid object, never throws.
   */
  analyze(text: string): ValidationResult {
    if (!text || text.trim().length === 0) {
      return {
        confidence: 0,
        level: 'LOW',
        likelyPrescription: false,
        documentDetected: false,
        matchedKeywords: [],
        extractedText: '',
        warningMessage: "This doesn't appear to be a medical prescription.",
      };
    }

    const lower = text.toLowerCase();
    const documentDetected = text.trim().length >= config.minimumTextLength;

    // 1. Keyword matching
    const matchedKeywords = PRESCRIPTION_KEYWORDS.filter((kw) =>
      lower.includes(kw),
    );

    // 2. Dosage pattern bonus — counts as one extra keyword hit if present
    const hasDosage = DOSAGE_PATTERN.test(text);
    const keywordCount = matchedKeywords.length + (hasDosage ? 1 : 0);
    const keywordRatio = Math.min(keywordCount / MAX_KEYWORD_SCORE, 1);

    // 3. OCR text density base score (simply having text contributes to confidence)
    const ocrBaseScore = documentDetected ? Math.min(text.length / 100, 1) : 0;

    // 4. Weighted calculation
    const weightedScore =
      (documentDetected ? config.weights.document : 0) +
      (keywordRatio * config.weights.keyword) +
      (ocrBaseScore * config.weights.ocr);

    const confidence = Math.min(weightedScore, 1);
    const likelyPrescription = confidence >= config.highConfidenceThreshold;

    let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    let warningMessage: string | undefined = undefined;

    if (confidence < config.mediumConfidenceThreshold) {
      level = 'LOW';
      warningMessage = "This doesn't appear to be a medical prescription.";
    } else if (confidence < config.highConfidenceThreshold) {
      level = 'MEDIUM';
      warningMessage = "We couldn't confidently verify this prescription. If it's handwritten, you can continue and it will be reviewed.";
    }

    return {
      confidence,
      level,
      likelyPrescription,
      documentDetected,
      matchedKeywords,
      extractedText: text,
      warningMessage,
    };
  },
};
