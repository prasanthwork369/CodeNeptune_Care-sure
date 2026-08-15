import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { useNav } from "@/src/hooks/useNav";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { PrescriptionItem } from "@/src/features/prescription/types";
import { validatePrescriptionFile } from "@/src/utils/prescription";
import {
  usePrescriptionUploadService,
  CapturedAsset,
} from "@/src/features/prescription/scanner";

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
  const addItems = usePrescriptionDraftStore((s) => s.addItems);
  const { maxSizeBytes } = useUploadConfig();

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
        if (existingKeys.has(key)) skippedCount.existing++;
        else skippedCount.internal++;
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
      router.replace({
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
    assets: CapturedAsset[],
  ): Promise<PrescriptionItem[]> => {
    const validated: PrescriptionItem[] = [];
    for (const asset of assets) {
      const item = await validatePrescriptionFile(
        asset,
        onError,
        onSizeExceeded,
        maxSizeBytes,
      );
      if (item) validated.push(item);
    }
    return validated;
  };

  const {
    takePhoto: _takePhoto,
    chooseFromGallery: _pickImages,
    pickPdf: _pickPdf,
  } = usePrescriptionUploadService({
    onAssetsReady: async (assets) => {
      const validated = await processAssets(assets);
      if (validated.length > 0) navigate(validated);
    },
    onError: (msg) => showErr("Error", msg),
  });

  const pickImages = () => {
    onClose();
    setTimeout(_pickImages, 400);
  };
  const pickPdf = () => {
    onClose();
    setTimeout(_pickPdf, 400);
  };

  const takePhoto = _takePhoto;

  return { pickImages, pickPdf, takePhoto };
}
