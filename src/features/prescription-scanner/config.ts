/**
 * @module features/prescription-scanner/config
 * Configuration for the OCR validation engine.
 */

export const PrescriptionValidationConfig = {
  /** Confidence score required to accept immediately without warnings */
  highConfidenceThreshold: 0.8,
  /** Confidence score required to treat as a likely handwritten prescription (soft warning) */
  mediumConfidenceThreshold: 0.4,
  /** Minimum extracted text length to assume a document is present */
  minimumTextLength: 15,
  /** Weighting for scoring algorithm */
  weights: {
    /** 50% of the score comes from matching medical keywords */
    keyword: 0.5,
    /** 30% of the score comes from simply detecting a document (mass of text) */
    document: 0.3,
    /** 20% of the score comes from the raw ML Kit confidence baseline */
    ocr: 0.2,
  },
};
