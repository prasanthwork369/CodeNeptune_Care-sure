/**
 * @module features/prescription-scanner/constants
 * Tuning constants and keyword lists for the PrescriptionScanner module.
 * All values are centralised here so they can be updated without touching
 * any service or hook logic.
 */

// ─── Confidence thresholds ───────────────────────────────────────────────────

/**
 * Confidence > 0 -> proceed silently (no UX warning).
 */
export const HIGH_CONFIDENCE_THRESHOLD = 0.01;

/**
 * Unused since high is 0.01. Kept for type compatibility.
 */
export const MEDIUM_CONFIDENCE_THRESHOLD = 0.01;

// ─── OCR performance ─────────────────────────────────────────────────────────

/** Maximum time (ms) to wait for OCR before treating it as a failure. */
export const OCR_TIMEOUT_MS = 8_000;

// ─── Prescription keyword dictionary ─────────────────────────────────────────

/**
 * Keywords are matched case-insensitively against the full OCR text.
 * Each match contributes equally to the raw keyword score.
 * Add or remove entries here to tune detection accuracy.
 */
export const PRESCRIPTION_KEYWORDS: string[] = [
  // Standard identifiers
  'rx',
  'prescription',
  // Professional titles
  'dr.',
  'dr ',
  'doctor',
  'physician',
  // Patient context
  'patient',
  'name:',
  'age:',
  'sex:',
  'dob:',
  'date of birth',
  // Institutional
  'hospital',
  'clinic',
  'medical center',
  'pharmacy',
  'dispensary',
  // Prescriber details
  'reg. no',
  'reg no',
  'license',
  'qualification',
  'mbbs',
  'md ',
  // Instruction keywords
  'dosage',
  'dose',
  'sig:',
  'directions',
  'take',
  'apply',
  'refill',
  'dispense',
  // Common medicine suffixes / forms — broad signal
  'tablet',
  'capsule',
  'syrup',
  'injection',
  'ointment',
  'drops',
  'inhaler',
  'patch',
  // Date / validity
  'date:',
  'valid till',
  'expiry',
];

/**
 * Dosage pattern — e.g. "500 mg", "10 ml", "2 mcg", "1 tablet"
 * A single match counts as one detected keyword for scoring.
 */
export const DOSAGE_PATTERN =
  /\b\d+(\.\d+)?\s*(mg|mcg|ml|g|iu|tablet|cap|capsule|drop|puff)s?\b/i;

// ─── Scoring weights ──────────────────────────────────────────────────────────

/**
 * Maximum number of keyword matches to consider when normalising the score.
 * Prevents very keyword-dense images from exceeding 1.0 artificially.
 */
export const MAX_KEYWORD_SCORE = 6;
