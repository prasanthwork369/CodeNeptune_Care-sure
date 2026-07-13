/**
 * @module features/prescription-scanner/ocr.service
 *
 * Extracts text from a scanned image using Google ML Kit Text Recognition.
 *
 * DEPENDENCY NOTE
 * ───────────────
 * '@react-native-ml-kit/text-recognition' is loaded via a lazy require() so
 * the module compiles and runs even when the package is not installed.
 * When the package is absent, recognizeText() returns { text: '', confidence: 0 }
 * and the rest of the pipeline still works (validation scores zero → low
 * confidence → optional warning shown to user).
 *
 * To activate full OCR:
 *   1. npm install @react-native-ml-kit/text-recognition
 *   2. npx expo prebuild
 *   3. Rebuild the native binary.
 *
 * PERFORMANCE
 * ───────────
 * Results are cached per-session in a Map keyed by imageUri.
 * A single scan invocation therefore never runs OCR more than once.
 * The cache lives in module scope — it is cleared automatically when the
 * JS runtime restarts (i.e. on app restart or hot reload).
 */

import { OCR_TIMEOUT_MS } from './constants';
import { OcrResult } from './types';

// ─── Session cache ────────────────────────────────────────────────────────────

const ocrCache = new Map<string, OcrResult>();

// ─── Lazy ML Kit loader ───────────────────────────────────────────────────────

function loadMlKit(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-ml-kit/text-recognition').default;
  } catch {
    return null;
  }
}

// ─── Timeout utility ──────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`OCR timed out after ${ms}ms`)), ms),
    ),
  ]);
}

// ─── OcrService ───────────────────────────────────────────────────────────────

export const OcrService = {
  /**
   * Recognises text in the given image URI using ML Kit.
   *
   * - Returns a cached result if the same URI was already processed this session.
   * - Returns { text: '', confidence: 0 } on any failure (package missing,
   *   timeout, unreadable image, etc.).
   * - Never throws.
   */
  async recognizeText(imageUri: string): Promise<OcrResult> {
    // Return cached result immediately
    const cached = ocrCache.get(imageUri);
    if (cached) {
      if (__DEV__) console.log('[OcrService] Cache hit for', imageUri);
      return cached;
    }

    const TextRecognition = loadMlKit();
    if (!TextRecognition) {
      if (__DEV__) {
        console.warn(
          '[OcrService] @react-native-ml-kit/text-recognition is not installed. ' +
            'OCR is disabled — install the package and rebuild to enable it.',
        );
      }
      const fallback: OcrResult = { text: '', confidence: 0 };
      ocrCache.set(imageUri, fallback);
      return fallback;
    }

    try {
      const result = await withTimeout(
        TextRecognition.recognize(imageUri),
        OCR_TIMEOUT_MS,
      );

      // ML Kit returns an object with a `text` string and optional `blocks`.
      // Cast to any because the package is loaded via lazy require() and
      // TypeScript has no type information for it at compile time.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mlResult = result as any;
      const text: string =
        typeof mlResult?.text === 'string' ? mlResult.text.trim() : '';

      // Derive a rough confidence: if we got text → 0.5 baseline, else 0
      // (the validator will refine this further via keyword matching).
      const confidence = text.length > 0 ? 0.5 : 0;

      const ocrResult: OcrResult = { text, confidence };
      ocrCache.set(imageUri, ocrResult);

      if (__DEV__) {
        console.log(
          `[OcrService] Extracted ${text.length} chars, base confidence=${confidence}`,
        );
      }

      return ocrResult;
    } catch (e) {
      if (__DEV__) console.error('[OcrService] OCR failed:', e);
      const fallback: OcrResult = { text: '', confidence: 0 };
      ocrCache.set(imageUri, fallback);
      return fallback;
    }
  },

  /**
   * Clears the in-memory OCR cache.
   * Call this when starting a fresh upload session if needed.
   */
  clearCache(): void {
    ocrCache.clear();
  },
};
