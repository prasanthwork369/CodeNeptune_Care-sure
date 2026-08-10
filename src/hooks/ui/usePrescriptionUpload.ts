import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { useNav } from "@/src/hooks/useNav";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { PrescriptionItem } from "@/src/types/prescription";
import { MAX_FILES, validatePrescriptionFile } from "@/src/utils/prescription";
import {
  usePrescriptionUploadService,
  CapturedAsset,
} from "@/src/features/prescription-scanner";
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
  const addItems = usePrescriptionDraftStore((s) => s.addItems);
  const { maxSizeBytes } = useUploadConfig();
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
    assets: CapturedAsset[],
  ): Promise<{ validated: PrescriptionItem[]; hadTooLarge: boolean }> => {
    const validated: PrescriptionItem[] = [];
    let hadTooLarge = false;
    for (const asset of assets) {
      const item = await validatePrescriptionFile(
        asset,
        onError,
        (sizeMB) => {
          hadTooLarge = true;
          onSizeExceeded?.(sizeMB);
        },
        maxSizeBytes,
      );
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
        if (existingKeys.has(key)) skippedCount.existing++;
        else skippedCount.internal++;
        if (!firstDuplicate) firstDuplicate = f;
      } else {
        uniqueInSelection.push(f);
        seenKeys.add(key);
      }
    }

    // Trim to the free slots rather than dropping the batch: picking 11 must
    // still load 10, not nothing.
    const remainingSlots = Math.max(MAX_FILES - currentItems.length, 0);
    const overLimit = uniqueInSelection.length > remainingSlots;
    const accepted = overLimit
      ? uniqueInSelection.slice(0, remainingSlots)
      : uniqueInSelection;

    // Deferred until the duplicate notice is dismissed, so the preview
    // screen never appears underneath it before the user has
    // acknowledged the duplicate.
    const goToPreview = () => {
      if (accepted.length === 0) return;
      addItems(accepted);
      isProceeding.current = true;
      router.push("/(prescription)/preview");
    };

    if (overLimit) {
      // Preview opens only once the notice is dismissed, so it never renders under it.
      showErr(
        "Limit Reached",
        accepted.length > 0
          ? `Maximum ${MAX_FILES} prescriptions allowed. Only the first ${accepted.length} were added.`
          : `Maximum ${MAX_FILES} prescriptions allowed.`,
        accepted.length > 0 ? goToPreview : undefined,
      );
      return;
    }

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

  const {
    takePhoto,
    chooseFromGallery: pickImage,
    pickPdf,
    pickDocument,
  } = usePrescriptionUploadService({
    onAssetsReady: async (assets) => {
      const { validated, hadTooLarge } = await processAssets(assets);
      handlePicked(validated, hadTooLarge);
    },
    onError: (msg) => showErr("Error", msg),
  });

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
