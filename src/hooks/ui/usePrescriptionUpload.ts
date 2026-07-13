import { useNav } from "@/src/hooks/useNav";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { PrescriptionItem } from "@/src/types/prescription";
import { MAX_FILES, validatePrescriptionFile } from "@/src/utils/prescription";
import { PrescriptionScanner, getConfidenceLevel } from "@/src/features/prescription-scanner";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useRef } from "react";

export function usePrescriptionUpload(
  onError?: (title: string, message: string, onDismiss?: () => void) => void,
  onSizeExceeded?: (sizeMB: string) => void,
  onDuplicate?: (
    fileName: string,
    fileSize: number | undefined,
    proceed: () => void,
  ) => void,
) {
  const router = useNav();
  const { addItems } = usePrescriptionDraftStore();
  // Valid files from a batch that also contained an oversized file —
  // held back until the "file too large" notice is dismissed, so the
  // preview screen never appears underneath it.
  const pendingTooLarge = useRef<PrescriptionItem[] | null>(null);
  // Set right before navigating to preview, so the screen's
  // focus-blur cleanup (which clears the draft when the user leaves)
  // can tell "leaving on purpose to continue" apart from "backing out".
  const isProceeding = useRef(false);

  const showErr = (title: string, message: string, onDismiss?: () => void) =>
    onError?.(title, message, onDismiss);

  const processAssets = async (
    assets: (
      | DocumentPicker.DocumentPickerAsset
      | ImagePicker.ImagePickerAsset
    )[],
  ): Promise<{ validated: PrescriptionItem[]; hadTooLarge: boolean }> => {
    const validated: PrescriptionItem[] = [];
    let hadTooLarge = false;
    for (const asset of assets) {
      const item = await validatePrescriptionFile(asset, onError, (sizeMB) => {
        hadTooLarge = true;
        onSizeExceeded?.(sizeMB);
      });
      if (item) validated.push(item);
    }
    return { validated, hadTooLarge };
  };

  const pushToPreview = (files: PrescriptionItem[]) => {
    if (files.length === 0) return;

    const currentItems = usePrescriptionDraftStore.getState().items;
    const existingKeys = new Set(
      currentItems.map((it) => `${it.name}_${it.size ?? 0}_${it.type}`),
    );
    const seenKeys = new Set(existingKeys);
    const uniqueInSelection: PrescriptionItem[] = [];
    const skippedCount = { internal: 0, existing: 0 };
    let firstDuplicate: PrescriptionItem | null = null;

    for (const f of files) {
      const key = `${f.name}_${f.size ?? 0}_${f.type}`;
      if (seenKeys.has(key)) {
        existingKeys.has(key)
          ? skippedCount.existing++
          : skippedCount.internal++;
        if (!firstDuplicate) firstDuplicate = f;
      } else {
        uniqueInSelection.push(f);
        seenKeys.add(key);
      }
    }

    if (currentItems.length + uniqueInSelection.length > MAX_FILES) {
      showErr("Limit Reached", `Maximum ${MAX_FILES} prescriptions allowed.`);
      return;
    }

    // Deferred until the duplicate notice is dismissed, so the preview
    // screen never appears underneath it before the user has
    // acknowledged the duplicate.
    const goToPreview = () => {
      if (uniqueInSelection.length === 0) return;
      addItems(uniqueInSelection);
      isProceeding.current = true;
      router.push("/(prescription)/preview");
    };

    if (skippedCount.existing > 0 || skippedCount.internal > 0) {
      if (onDuplicate && firstDuplicate) {
        onDuplicate(firstDuplicate.name, firstDuplicate.size, goToPreview);
      } else {
        const onDismiss = currentItems.length > 0 ? goToPreview : undefined;
        showErr(
          "Duplicate Files",
          "Some identical files were detected and skipped.",
          onDismiss,
        );
      }
      return;
    }

    goToPreview();
  };

  const handlePicked = (
    validated: PrescriptionItem[],
    hadTooLarge: boolean,
  ) => {
    if (validated.length === 0) return;
    if (hadTooLarge) {
      pendingTooLarge.current = validated;
      return;
    }
    pushToPreview(validated);
  };

  // Called once the "file too large" notice is dismissed via its close/OK
  // action, to proceed with whatever valid files were in that same batch.
  const proceedAfterTooLarge = () => {
    const items = pendingTooLarge.current;
    pendingTooLarge.current = null;
    if (items) pushToPreview(items);
  };

  // Called when the user instead chooses to pick different files —
  // discards the held-back batch rather than proceeding with it.
  const discardPendingTooLarge = () => {
    pendingTooLarge.current = null;
  };

  const pickDocument = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showErr(
          "Permission Required",
          "Please allow photo library access in Settings to continue.",
        );
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png", "image/webp"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const { validated, hadTooLarge } = await processAssets(result.assets);
      handlePicked(validated, hadTooLarge);
    } catch {
      showErr("Error", "Failed to pick document. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showErr(
          "Permission Required",
          "Please allow photo library access in Settings to continue.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const { validated, hadTooLarge } = await processAssets(result.assets);
      handlePicked(validated, hadTooLarge);
    } catch {
      showErr("Error", "Failed to pick image. Please try again.");
    }
  };

  const takePhoto = async () => {
    try {
      // Permission check — must happen before opening the scanner
      const { status, canAskAgain } =
        await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        if (!canAskAgain)
          showErr(
            "Permission Required",
            "Please allow camera access in Settings to continue.",
          );
        return;
      }

      // Centralised scanner → OCR → validation pipeline
      const result = await PrescriptionScanner.scan();

      // User cancelled inside the scanner — nothing to do
      if (result.cancelled || !result.imageUri) return;

      const scannedUri = result.imageUri;
      const filename = scannedUri.split("/").pop() || "scanned_prescription.jpg";
      const asset = {
        uri: scannedUri,
        name: filename,
        fileName: filename,
        mimeType: "image/jpeg",
      };

      // Deferred continuation — runs after the user dismisses any warning modal.
      // For high confidence this is called immediately (no modal shown).
      const continueUpload = async () => {
        const { validated, hadTooLarge } = await processAssets([asset as any]);
        handlePicked(validated, hadTooLarge);
      };

      // UX: advisory warning for medium or low confidence.
      // Navigation is deferred into onDismiss so the modal stays visible
      // until the user taps OK — the user is NEVER blocked from uploading.
      const level = getConfidenceLevel(result.confidence);
      if (level === 'medium') {
        showErr(
          'Check Your Prescription',
          'This may not be a medical prescription. Please ensure you have scanned the correct document.',
          continueUpload,   // ← proceed only after user taps OK
        );
        return;             // ← stop here; continueUpload fires via onDismiss
      }
      if (level === 'low') {
        showErr(
          'Prescription Not Detected',
          'We could not confirm this is a prescription. You can still upload it and our team will verify.',
          continueUpload,
        );
        return;
      }

      // High confidence — proceed silently with no modal
      await continueUpload();
    } catch {
      showErr("Error", "Failed to take photo. Please try again.");
    }
  };

  const pickPdf = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showErr(
          "Permission Required",
          "Please allow photo library access in Settings to continue.",
        );
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      const { validated, hadTooLarge } = await processAssets(result.assets);
      handlePicked(validated, hadTooLarge);
    } catch {
      showErr("Error", "Failed to pick PDF. Please try again.");
    }
  };

  return {
    pickDocument,
    pickImage,
    takePhoto,
    pickPdf,
    proceedAfterTooLarge,
    discardPendingTooLarge,
    isProceeding,
  };
}
