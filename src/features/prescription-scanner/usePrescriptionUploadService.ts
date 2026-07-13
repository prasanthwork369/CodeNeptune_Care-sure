import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { PrescriptionScanner } from './index';
import { ScannerService } from './scanner.service';

export interface CapturedAsset {
  uri: string;
  name: string;
  fileName: string;
  mimeType: string;
}

export interface UsePrescriptionUploadServiceOptions {
  onAssetsReady: (assets: CapturedAsset[]) => Promise<void> | void;
  onError?: (message: string) => void;
}

export function usePrescriptionUploadService({
  onAssetsReady,
  onError,
}: UsePrescriptionUploadServiceOptions) {
  const showErr = (title: string, message: string) => {
    if (onError) {
      onError(message);
    } else {
      Alert.alert(title, message);
    }
  };

  const checkConfidenceAndProceed = async (
    assets: CapturedAsset[],
    onProceed: () => void,
    onRetry: () => void,
    source: 'camera' | 'gallery'
  ) => {
    // Run OCR + validation on all assets in parallel
    const scanResults = await Promise.all(
      assets.map((asset) => PrescriptionScanner.analyzeImage(asset.uri))
    );

    // We still run OCR to preserve the architectural pipeline for future use,
    // but we no longer block or warn based on confidence scores.
    if (__DEV__) {
      const scanResults = await Promise.all(
        assets.map((asset) => PrescriptionScanner.analyzeImage(asset.uri))
      );
      scanResults.forEach((res) => {
        console.log(`[OCR Pass-through] Source: ${source} | Confidence: ${res.confidence}`);
      });
    } else {
      // In production, we can even run this asynchronously without awaiting if we want,
      // but to preserve the exact pipeline flow, we'll await it silently.
      await Promise.all(
        assets.map((asset) => PrescriptionScanner.analyzeImage(asset.uri))
      );
    }

    // Always proceed directly
    onProceed();
  };

  // ── 1. Camera Flow (via PrescriptionScanner) ─────────────────────────────
  const takePhoto = async () => {
    try {
      const { status, canAskAgain } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        if (!canAskAgain) {
          showErr(
            'Permission Required',
            'Please allow camera access in Settings to continue.'
          );
        }
        return;
      }

      const { imageUri, cancelled } = await ScannerService.scan();
      if (cancelled || !imageUri) return;

      const filename = imageUri.split('/').pop() || 'scanned_prescription.jpg';
      const asset: CapturedAsset = {
        uri: imageUri,
        name: filename,
        fileName: filename,
        mimeType: 'image/jpeg',
      };

      await checkConfidenceAndProceed(
        [asset],
        () => onAssetsReady([asset]),
        takePhoto,
        'camera'
      );
    } catch {
      showErr('Error', 'Failed to take photo. Please try again.');
    }
  };

  // ── 2. Gallery Flow ──────────────────────────────────────────────────────
  const chooseFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showErr(
          'Permission Required',
          'Please allow photo library access in Settings to continue.'
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const assets: CapturedAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || a.uri.split('/').pop() || 'gallery_image.jpg',
        fileName: a.fileName || a.uri.split('/').pop() || 'gallery_image.jpg',
        mimeType: 'image/jpeg',
      }));

      await checkConfidenceAndProceed(
        assets,
        () => onAssetsReady(assets),
        chooseFromGallery,
        'gallery'
      );
    } catch {
      showErr('Error', 'Failed to pick images. Please try again.');
    }
  };

  // ── 3. PDF Flow ──────────────────────────────────────────────────────────
  const pickPdf = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showErr(
          'Permission Required',
          'Please allow photo library access in Settings to continue.'
        );
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const assets: CapturedAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        fileName: a.name,
        mimeType: 'application/pdf',
      }));
      await onAssetsReady(assets);
    } catch {
      showErr('Error', 'Failed to pick PDF. Please try again.');
    }
  };

  // ── 4. Mixed Document Flow (Images + PDFs) ───────────────────────────────
  const pickDocument = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        showErr(
          'Permission Required',
          'Please allow photo library access in Settings to continue.'
        );
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const assets: CapturedAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        fileName: a.name,
        mimeType: a.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      }));
      await onAssetsReady(assets);
    } catch {
      showErr('Error', 'Failed to pick document. Please try again.');
    }
  };

  return {
    takePhoto,
    chooseFromGallery,
    pickPdf,
    pickDocument,
  };
}
