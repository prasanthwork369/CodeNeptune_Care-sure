import { useNav } from "@/src/hooks/useNav";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { PrescriptionItem } from "@/src/types/prescription";
import { validatePrescriptionFile } from "@/src/utils/prescription";
import { PrescriptionScanner, getConfidenceLevel } from "@/src/features/prescription-scanner";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

export function usePrescriptionPicker(
  onClose: () => void,
  toPay?: string,
  patientMemberId?: string,
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

  const showErr = (title: string, message: string, onDismiss?: () => void) =>
    onError?.(title, message, onDismiss);

  const navigate = (files: PrescriptionItem[]) => {
    const currentItems = usePrescriptionDraftStore.getState().items;
    const existingKeys = new Set(
      currentItems.map((it) => `${it.name}-${it.size}-${it.type}`),
    );
    const seenKeys = new Set(existingKeys);
    const uniqueInSelection: PrescriptionItem[] = [];
    const skippedCount = { internal: 0, existing: 0 };
    let firstDuplicate: PrescriptionItem | null = null;

    for (const f of files) {
      const key = `${f.name}-${f.size}-${f.type}`;
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

    // Deferred until the duplicate notice (modal/info dialog) is dismissed,
    // so the preview screen never appears underneath it before the user
    // has acknowledged the duplicate.
    const goToPreview = () => {
      if (uniqueInSelection.length === 0) return;
      addItems(uniqueInSelection);
      router.push({
        pathname: "/(prescription)/preview",
        params: {
          toPay: toPay ?? "0",
          patientMemberId: patientMemberId ?? "",
          source: "cart",
        },
      });
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

  const processAssets = async (
    assets: (
      | DocumentPicker.DocumentPickerAsset
      | ImagePicker.ImagePickerAsset
    )[],
  ): Promise<PrescriptionItem[]> => {
    const validated: PrescriptionItem[] = [];
    for (const asset of assets) {
      const item = await validatePrescriptionFile(
        asset,
        onError,
        onSizeExceeded,
      );
      if (item) validated.push(item);
    }
    return validated;
  };

  const selectImages = async () => {
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
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const validated = await processAssets(result.assets);
        if (validated.length > 0) navigate(validated);
      }
    } catch {
      showErr("Error", "Failed to open image picker.");
    }
  };

  const selectPdfs = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
          showErr('Permission Required', 'Please allow photo library access in Settings to continue.');
          return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (!result.canceled && result.assets.length > 0) {
        const validated = await processAssets(result.assets);
        if (validated.length > 0) navigate(validated);
      }
    } catch {
      showErr("Error", "Failed to open document picker.");
    }
  };

  const pickImages = () => {
    onClose();
    setTimeout(selectImages, 400);
  };
  const pickPdf = () => {
    onClose();
    setTimeout(selectPdfs, 400);
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

      // Deferred continuation — runs after any warning modal is dismissed.
      const continueUpload = async () => {
        const validated = await processAssets([asset as any]);
        if (validated.length > 0) navigate(validated);
      };

      // UX: advisory warning for medium or low confidence.
      // Navigation is deferred into onDismiss — user is never blocked.
      const level = getConfidenceLevel(result.confidence);
      if (level === 'medium') {
        showErr(
          'Check Your Prescription',
          'This may not be a medical prescription. Please ensure you have scanned the correct document.',
          continueUpload,   // ← fires only after user taps OK
        );
        return;             // ← stop here
      }
      if (level === 'low') {
        showErr(
          'Prescription Not Detected',
          'We could not confirm this is a prescription. You can still upload it and our team will verify.',
          continueUpload,
        );
        return;
      }

      // High confidence — proceed silently
      await continueUpload();
    } catch {
      showErr("Error", "Failed to take photo. Please try again.");
    }
  };

  return { pickImages, pickPdf, takePhoto };
}
