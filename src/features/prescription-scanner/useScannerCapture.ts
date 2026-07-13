/**
 * @module features/prescription-scanner/useScannerCapture
 *
 * Reusable React hook that encapsulates the complete "Take a Photo" flow:
 *   1. Camera permission request
 *   2. PrescriptionScanner.scan() — scanner → OCR → validation
 *   3. Confidence-level UX via system Alert (works above any closed sheet)
 *   4. Deferred asset delivery — caller receives a CapturedAsset only after
 *      the user has acknowledged any warning.
 *
 * USAGE
 * ─────
 *   const { capture } = useScannerCapture({
 *     onAssetReady: async (asset) => {
 *       // process / validate / navigate — your existing logic here
 *     },
 *     onError: (msg) => showMyErrorDialog('Error', msg),
 *   });
 *
 *   // Trigger from any button / timeout:
 *   <Button onPress={capture} />
 *
 * WHY Alert.alert() FOR WARNINGS
 * ───────────────────────────────
 * In both the cart bottom-sheet flow and the preview "add more" sheet flow,
 * the sheet is CLOSED before the scanner returns (onClose() + setTimeout).
 * Any InfoModal rendered inside those components is therefore invisible.
 * Alert.alert() is a system-level dialog that renders above ALL components
 * regardless of mount / visibility state — it always shows correctly.
 */

import { useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { PrescriptionScanner, getConfidenceLevel } from './index';

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * A lightweight asset descriptor produced after a successful scan.
 * Shape is intentionally compatible with the object accepted by
 * validatePrescriptionFile() so callers can pass it through without casting.
 */
export interface CapturedAsset {
  uri: string;
  name: string;
  fileName: string;
  mimeType: 'image/jpeg';
}

export interface UseScannerCaptureOptions {
  /**
   * Called when a valid image has been captured and the user has acknowledged
   * any confidence warning. Run your file validation / navigation here.
   */
  onAssetReady: (asset: CapturedAsset) => Promise<void> | void;
  /**
   * Called when an unexpected error occurs (e.g. camera crash).
   * Receives a user-friendly message string.
   * Defaults to a generic Alert if omitted.
   */
  onError?: (message: string) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns a stable `capture` function that runs the full scan pipeline.
 * Call `capture()` from any button press, setTimeout, or effect.
 */
export function useScannerCapture({
  onAssetReady,
  onError,
}: UseScannerCaptureOptions) {
  const capture = useCallback(async () => {
    try {
      // ── 1. Camera permission ───────────────────────────────────────────────
      const { status, canAskAgain } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        if (!canAskAgain) {
          // System alert — always visible regardless of component state
          Alert.alert(
            'Permission Required',
            'Please allow camera access in Settings to continue.',
            [{ text: 'OK' }],
          );
        }
        return;
      }

      // ── 2. Scan → OCR → validate ───────────────────────────────────────────
      const result = await PrescriptionScanner.scan();

      // User cancelled the scanner or camera without capturing anything
      if (result.cancelled || !result.imageUri) return;

      // ── 3. Build asset ─────────────────────────────────────────────────────
      const scannedUri = result.imageUri;
      const filename =
        scannedUri.split('/').pop() || 'scanned_prescription.jpg';
      const asset: CapturedAsset = {
        uri: scannedUri,
        name: filename,
        fileName: filename,
        mimeType: 'image/jpeg',
      };

      // ── 4. Deferred delivery ───────────────────────────────────────────────
      // The caller's onAssetReady is invoked only AFTER the user has
      // acknowledged any confidence warning, preventing the navigation race
      // condition where a modal is dismissed by screen transition.
      const deliver = () => onAssetReady(asset);

      const level = getConfidenceLevel(result.confidence);

      if (level === 'medium') {
        Alert.alert(
          'Check Your Prescription',
          'This may not be a medical prescription. Please ensure you have scanned the correct document.',
          [
            { text: 'Scan Again', style: 'cancel' },
            { text: 'Continue', onPress: deliver },
          ],
        );
        return;
      }

      if (level === 'low') {
        Alert.alert(
          'Prescription Not Detected',
          'We could not confirm this is a prescription. You can still upload it and our team will verify.',
          [
            { text: 'Scan Again', style: 'cancel' },
            { text: 'Upload Anyway', onPress: deliver },
          ],
        );
        return;
      }

      // High confidence — proceed immediately, no dialog shown
      await deliver();
    } catch {
      const message = 'Failed to take photo. Please try again.';
      if (onError) {
        onError(message);
      } else {
        Alert.alert('Error', message);
      }
    }
  }, [onAssetReady, onError]);

  return { capture };
}
