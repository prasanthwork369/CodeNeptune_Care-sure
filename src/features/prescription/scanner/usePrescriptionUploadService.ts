import { Alert, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { ScannerService } from "./scanner.service";

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

  // Permission denials always need the same actionable dialog — a friendly
  // title plus a direct path to Settings — regardless of which screen hosts
  // this hook, so this bypasses the generic onError/InfoModal plumbing above.
  const showPermissionAlert = (title: string, message: string) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => void Linking.openSettings() },
    ]);
  };

  // ── 1. Camera Flow (via PrescriptionScanner) ─────────────────────────────
  const takePhoto = async () => {
    try {
      const { status, canAskAgain } =
        await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) {
          showPermissionAlert(
            "Camera Access Required",
            "CareSure needs camera access to scan your prescription. Please allow it in Settings to continue.",
          );
        }
        return;
      }

      const { imageUris, cancelled } = await ScannerService.scan();
      if (cancelled || imageUris.length === 0) return;

      // One asset per scanned page — the scanner's "+" can return several.
      const assets: CapturedAsset[] = imageUris.map((uri, index) => {
        const filename =
          uri.split("/").pop() || `scanned_prescription_${index + 1}.jpg`;
        return {
          uri,
          name: filename,
          fileName: filename,
          mimeType: "image/jpeg",
        };
      });

      await onAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to take photo. Please try again.");
    }
  };

  // ── 2. Gallery Flow ──────────────────────────────────────────────────────
  const chooseFromGallery = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert(
          "Photo Access Required",
          "CareSure needs access to your photos to upload a prescription. Please allow it in Settings to continue.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const assets: CapturedAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || a.uri.split("/").pop() || "gallery_image.jpg",
        fileName: a.fileName || a.uri.split("/").pop() || "gallery_image.jpg",
        mimeType: "image/jpeg",
      }));

      await onAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to pick images. Please try again.");
    }
  };

  // ── 3. PDF Flow ──────────────────────────────────────────────────────────
  const pickPdf = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert(
          "Photo Access Required",
          "CareSure needs access to your photos to upload a prescription. Please allow it in Settings to continue.",
        );
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const assets: CapturedAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        fileName: a.name,
        mimeType: "application/pdf",
      }));
      await onAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to pick PDF. Please try again.");
    }
  };

  // ── 4. Mixed Document Flow (Images + PDFs) ───────────────────────────────
  const pickDocument = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert(
          "Photo Access Required",
          "CareSure needs access to your photos to upload a prescription. Please allow it in Settings to continue.",
        );
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;

      const assets: CapturedAsset[] = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name,
        fileName: a.name,
        mimeType: a.name.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "image/jpeg",
      }));
      await onAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to pick document. Please try again.");
    }
  };

  return {
    takePhoto,
    chooseFromGallery,
    pickPdf,
    pickDocument,
  };
}
