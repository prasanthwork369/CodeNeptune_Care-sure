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
  HIGH_CONFIDENCE_THRESHOLD,
  MAX_KEYWORD_SCORE,
  PRESCRIPTION_KEYWORDS,
} from './constants';
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
        likelyPrescription: false,
        detectedKeywords: [],
        extractedText: '',
      };
    }

    const lower = text.toLowerCase();

    // 1. Keyword matching
    const detectedKeywords = PRESCRIPTION_KEYWORDS.filter((kw) =>
      lower.includes(kw),
    );

    // 2. Dosage pattern bonus — counts as one extra keyword hit if present
    const hasDosage = DOSAGE_PATTERN.test(text);
    const rawScore = detectedKeywords.length + (hasDosage ? 1 : 0);

    // 3. Normalise to [0, 1]
    const confidence = Math.min(rawScore / MAX_KEYWORD_SCORE, 1);

    const likelyPrescription = confidence >= HIGH_CONFIDENCE_THRESHOLD;

    if (__DEV__) {
      console.log(
        `[PrescriptionValidator] keywords=${detectedKeywords.length}, ` +
          `dosage=${hasDosage}, score=${rawScore}/${MAX_KEYWORD_SCORE}, ` +
          `confidence=${confidence.toFixed(2)}, likely=${likelyPrescription}`,
      );
    }

    return {
      confidence,
      likelyPrescription,
      detectedKeywords,
      extractedText: text,
    };
  },
};
