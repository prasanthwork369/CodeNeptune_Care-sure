import { Alert, AppState, Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
import { armSettingsReturn } from "@/src/store/lastRouteStore";
import { ScannerService } from "./scanner.service";

type PendingPermissionAction = "camera" | "gallery" | "pdf" | "document";

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
  // Ref, not state, so a rapid double-tap in the same tick can't launch a
  // second native picker/scanner activity before the first one has opened.
  const runningRef = useRef(false);
  // Set when the user is sent to Settings from a permission alert below, so
  // the AppState effect can silently re-check that one permission on return
  // and resume the action the user actually asked for, instead of requiring
  // a second tap.
  const pendingActionRef = useRef<PendingPermissionAction | null>(null);
  // True from the moment the picker/scanner returns valid assets until the
  // local validate+copy work (and whatever it triggers) finishes — covers
  // Gallery, Camera/Scanner, PDF, and Document, since they all funnel here.
  const [isOpening, setIsOpening] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const runOnAssetsReady = async (assets: CapturedAsset[]) => {
    if (isMountedRef.current) setIsOpening(true);
    // The file copy/stat calls inside onAssetsReady can block the JS thread,
    // so wait one frame first to let the overlay actually paint.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    try {
      await onAssetsReady(assets);
    } finally {
      if (isMountedRef.current) setIsOpening(false);
    }
  };

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
  const showPermissionAlert = (
    title: string,
    message: string,
    action: PendingPermissionAction,
  ) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open Settings",
        onPress: () => {
          pendingActionRef.current = action;
          armSettingsReturn();
          void Linking.openSettings();
        },
      },
    ]);
  };

  // ── 1. Camera Flow (via PrescriptionScanner) ─────────────────────────────
  const takePhoto = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        showPermissionAlert(
          "Camera Access Required",
          "CareSure needs access to your camera to take a photo of your prescription. Please allow Camera access in Settings to continue.",
          "camera",
        );
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

      await runOnAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to take photo. Please try again.");
    } finally {
      runningRef.current = false;
    }
  };

  // ── 2. Gallery Flow ──────────────────────────────────────────────────────
  const chooseFromGallery = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert(
          "Photo Access Required",
          "CareSure needs access to your photos to upload a prescription. Please allow Photo access in Settings to continue.",
          "gallery",
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

      await runOnAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to pick images. Please try again.");
    } finally {
      runningRef.current = false;
    }
  };

  // ── 3. PDF Flow ──────────────────────────────────────────────────────────
  const pickPdf = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        // File-specific wording — this is a PDF pick, not a photo pick.
        showPermissionAlert(
          "File Access Required",
          "CareSure needs access to your files to upload a prescription PDF. Please allow Storage access in Settings to continue.",
          "pdf",
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
      await runOnAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to pick PDF. Please try again.");
    } finally {
      runningRef.current = false;
    }
  };

  // ── 4. Mixed Document Flow (Images + PDFs) ───────────────────────────────
  const pickDocument = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert(
          "Photo Access Required",
          "CareSure needs access to your photos to upload a prescription. Please allow Photo access in Settings to continue.",
          "document",
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
      await runOnAssetsReady(assets);
    } catch {
      showErr("Error", "Failed to pick document. Please try again.");
    } finally {
      runningRef.current = false;
    }
  };

  // Kept current every render so the mount-once effect below never calls a
  // stale closure (these actions capture onAssetsReady/onError from props).
  const actionsRef = useRef({ takePhoto, chooseFromGallery, pickPdf, pickDocument });
  useEffect(() => {
    actionsRef.current = { takePhoto, chooseFromGallery, pickPdf, pickDocument };
  });

  // Silently re-checks the permission that sent the user to Settings, and
  // resumes the action they originally asked for if it's now granted — so
  // returning from a permission change doesn't require a second tap. Never
  // shows a dialog itself; if still denied, the user just retries manually.
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (next) => {
      if (next !== "active") return;
      const action = pendingActionRef.current;
      if (!action) return;
      pendingActionRef.current = null;

      try {
        if (action === "camera") {
          const { status } = await ImagePicker.getCameraPermissionsAsync();
          if (status === "granted") await actionsRef.current.takePhoto();
        } else {
          const { status } =
            await ImagePicker.getMediaLibraryPermissionsAsync();
          if (status !== "granted") return;
          if (action === "gallery") await actionsRef.current.chooseFromGallery();
          else if (action === "pdf") await actionsRef.current.pickPdf();
          else await actionsRef.current.pickDocument();
        }
      } catch {
        // Best-effort resume only — a failure here just leaves the user
        // where a manual retry already works.
      }
    });
    return () => sub.remove();
  }, []);

  return {
    takePhoto,
    chooseFromGallery,
    pickPdf,
    pickDocument,
    isOpening,
  };
}
