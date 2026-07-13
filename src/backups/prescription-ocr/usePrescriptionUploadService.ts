import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { PrescriptionScanner } from './index';
import { ScannerService } from './scanner.service';
import { useUIStore } from '@/src/store/uiStore';
import { HOME_IMAGES } from '@/src/constants/images';

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

    // Find the worst level in the batch to determine UX path
    const hasLow = scanResults.some((res) => res.level === 'LOW');
    const hasMedium = scanResults.some((res) => res.level === 'MEDIUM');

    // Default to 'HIGH' if all are good, else bubble up the most severe warning
    const worstLevel = hasLow ? 'LOW' : hasMedium ? 'MEDIUM' : 'HIGH';

    if (__DEV__) {
      scanResults.forEach(res => {
        console.log(`[OCR Validation] Source: ${source} | Confidence: ${res.confidence.toFixed(2)} | Level: ${res.level}`);
      });
    }

    const retryText = source === 'camera' ? 'Scan Again' : 'Choose Again';

    if (worstLevel === 'MEDIUM') {
      // Find the first warning message from a medium-confidence result
      const warningMessage = scanResults.find((res) => res.level === 'MEDIUM')?.warningMessage || "We couldn't confidently verify this prescription. If it's handwritten, you can continue and it will be reviewed.";
      
      useUIStore.getState().setGlobalAlert({
        title: 'Check Your Prescription',
        message: warningMessage,
        icon: HOME_IMAGES.leaveWarning,
        iconBg: '#FFF1F1',
        confirmBg: '#0F7635', // Green for Continue Upload
        cancelLabel: retryText,
        confirmLabel: 'Continue Upload',
        onCancel: () => {
          useUIStore.getState().setGlobalAlert(null);
          onRetry();
        },
        onConfirm: () => {
          useUIStore.getState().setGlobalAlert(null);
          onProceed();
        },
      });
      return;
    }

    if (worstLevel === 'LOW') {
      // Find the first warning message from a low-confidence result
      const warningMessage = scanResults.find((res) => res.level === 'LOW')?.warningMessage || "This doesn't appear to be a medical prescription.";

      useUIStore.getState().setGlobalAlert({
        title: 'Prescription Not Detected',
        message: warningMessage,
        icon: HOME_IMAGES.leaveWarning,
        iconBg: '#FFF1F1',
        confirmBg: '#0F7635', // Green for Upload Anyway
        cancelLabel: retryText,
        confirmLabel: 'Upload Anyway',
        onCancel: () => {
          useUIStore.getState().setGlobalAlert(null);
          onRetry();
        },
        onConfirm: () => {
          useUIStore.getState().setGlobalAlert(null);
          onProceed();
        },
      });
      return;
    }

    // High confidence — proceed immediately
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
