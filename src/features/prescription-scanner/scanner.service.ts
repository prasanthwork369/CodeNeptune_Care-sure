/**
 * @module features/prescription-scanner/scanner.service
 *
 * Responsible solely for acquiring an image from the device.
 * Tries the document-scanner plugin first; falls back to the standard camera.
 * Handles permissions and cancellation — callers receive a clean RawScanOutput.
 *
 * All camera / scanner integration is isolated here so no other layer needs to
 * know about expo-image-picker or react-native-document-scanner-plugin.
 */

import { NativeModules } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { RawScanOutput } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns the DocumentScanner default export when the native module is
 * available, or null when it is not. Guards via NativeModules first so
 * TurboModuleRegistry.getEnforcing() never throws on iOS new-arch builds
 * where the native binary does not include the scanner module.
 */
function loadDocumentScanner(): any | null {
  // NativeModules check prevents TurboModuleRegistry from throwing synchronously
  if (!NativeModules.DocumentScanner) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("react-native-document-scanner-plugin").default;
  } catch {
    return null;
  }
}

// ─── Camera fallback ─────────────────────────────────────────────────────────

async function captureWithCamera(): Promise<string | null> {
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.9,
    cameraType: ImagePicker.CameraType.back,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

// ─── ScannerService ───────────────────────────────────────────────────────────

export const ScannerService = {
  /**
   * Opens the document scanner (or camera fallback) and returns the URI of
   * the captured image.
   *
   * Requires camera permission — call this AFTER the caller has already
   * obtained permission (usePrescriptionUpload / usePrescriptionPicker both
   * request it before invoking scan()).
   *
   * @returns RawScanOutput — always resolves, never rejects.
   */
  async scan(): Promise<RawScanOutput> {
    // 1. Try the document scanner plugin
    const DocumentScanner = loadDocumentScanner();
    if (DocumentScanner) {
      try {
        const result = await DocumentScanner.scanDocument();

        // scannedImages present → success
        if (result?.scannedImages?.length) {
          return { imageUri: result.scannedImages[0], cancelled: false };
        }

        // result truthy but no images → user cancelled inside the scanner
        if (result) {
          return { imageUri: null, cancelled: true };
        }
      } catch (e) {
        if (__DEV__) {
          console.warn(
            "[ScannerService] Document scanner failed, falling back to camera:",
            e,
          );
        }
        // Fall through to camera fallback
      }
    }

    // 2. Camera fallback
    try {
      const uri = await captureWithCamera();
      if (!uri) return { imageUri: null, cancelled: true };
      return { imageUri: uri, cancelled: false };
    } catch (e) {
      if (__DEV__) console.error("[ScannerService] Camera fallback failed:", e);
      return { imageUri: null, cancelled: false };
    }
  },
};
