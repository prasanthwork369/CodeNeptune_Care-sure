import { asError } from "@/src/api/errors";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { HOME_IMAGES } from "@/src/constants/images";
import { PrescriptionReviewSheet } from "@/src/features/prescription/components/PrescriptionReviewSheet";
import { PRESCRIPTION_CATEGORY } from "@/src/features/prescription/constants/prescription-category";
import { PrescriptionItem } from "@/src/features/prescription/types";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "../services/prescription.service";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { useUIStore } from "@/src/store/uiStore";
import { logger } from "@/src/utils/logger";
import { requireInternet } from "@/src/utils/offline";
import { useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler, View, useWindowDimensions } from "react-native";
import { UploadPrescriptionSheet } from "../components/UploadPrescriptionSheet";
import { usePrescriptionUploader } from "../hooks/usePrescriptionUploader";
import { CapturedAsset, usePrescriptionUploadService } from "../scanner";
import {
  DuplicateFileModal,
  FileTooLargeModal,
  InfoModal,
  PreviewDisplay,
  PreviewThumbnails,
  RemoveConfirmModal,
  UploadProgressPanel,
} from "../sections/preview";
import { validatePrescriptionFile } from "../utils/prescription";
import { computeUploadTotals } from "../utils/uploadProgress";
import { styles as s } from "./PreviewLayout.styles";

const FOLDER = "customers/prescriptions";

export const PreviewLayout: React.FC = () => {
  const router = useNav();
  const queryClient = useQueryClient();
  const adjustedBottom = useAdjustedBottomInset();
  const { width: screenWidth } = useWindowDimensions();
  const [previewHeight, setPreviewHeight] = useState(0);
  const { maxSizeBytes, maxSizeLabel, maxFiles } = useUploadConfig();

  const {
    takePhoto,
    chooseFromGallery: pickImages,
    pickPdf: pickPdfs,
  } = usePrescriptionUploadService({
    onAssetsReady: async (assets) => {
      await processAndAdd(assets);
    },
    onError: (msg) => showInfo("Error", msg),
  });

  const {
    uri,
    name,
    type,
    files,
    toPay = "0",
    source,
  } = useLocalSearchParams<{
    uri: string;
    name: string;
    type: string;
    files: string;
    toPay: string;
    source?: string;
    prescriptionId?: string;
  }>();

  // Field selectors — the draft store is written on every upload step.
  const items = usePrescriptionDraftStore((st) => st.items);
  const addItems = usePrescriptionDraftStore((st) => st.addItems);
  const removeFromStore = usePrescriptionDraftStore((st) => st.removeItem);
  const clearItems = usePrescriptionDraftStore((st) => st.clearItems);
  const updateItem = usePrescriptionDraftStore((st) => st.updateItem);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const seed: PrescriptionItem[] = [];
    if (files) {
      try {
        seed.push(...(JSON.parse(files) as PrescriptionItem[]));
      } catch {}
    } else if (uri) {
      seed.push({
        localUri: uri,
        name: name ?? uri.split("/").pop() ?? "prescription",
        type: type ?? "image/jpeg",
      });
    }
    if (seed.length === 0) return;
    // Merges with anything already picked; addItems dedupes and caps at the configured limit.
    addItems(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean up interrupted uploads on screen mount.
  // If an item was persisted with uploadStatus="uploading" but no uploadedUrl,
  // the upload process is gone (app was killed). Reset to "pending" so it retries.
  // Run only once per mount to avoid infinite loops.
  useEffect(() => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        item.uploadStatus === "uploading" &&
        !item.uploadedUrl
      ) {
        updateItem(i, { uploadStatus: "pending" });
      }
    }
  }, [items, updateItem]);

  const [submitting, setSubmitting] = useState(false);
  // True only while the standalone flow's POST /prescriptions is in flight,
  // after every file has already reached 100% — a distinct phase so the
  // panel can say so instead of sitting at 100% with no explanation.
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [duplicateFileName, setDuplicateFileName] = useState("");
  const [duplicateFileSize, setDuplicateFileSize] = useState<
    number | undefined
  >(undefined);
  const [tooLargeSizeMB, setTooLargeSizeMB] = useState<string | null>(null);
  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const showInfo = (title: string, message: string) =>
    setInfoModal({ title, message });
  const uploadedSnapshot = useRef<PrescriptionItem[]>([]);
  const uploader = usePrescriptionUploader(FOLDER);
  const submitLockRef = useRef(false);
  // Set once the order flow starts navigating to Select Patient, so the
  // finally below leaves the progress panel up (and Proceed locked) for the
  // transition instead of briefly restoring the idle footer.
  const isNavigatingRef = useRef(false);
  // Track if we've already cleaned up interrupted uploads on this mount
  const cleanedUpRef = useRef(false);
  const activeItem = items[activeIndex] ?? items[0];

  // React Compiler memoizes these automatically — stable identities for
  // React.memo(PreviewDisplay) without a manual dependency array to drift.
  const goPrev = () => setActiveIndex((prev) => prev - 1);
  const goNext = () => setActiveIndex((prev) => prev + 1);

  // Sync upload state from uploader to draft items whenever uploader state changes
  useEffect(() => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const key = uploader.uploadKeyOf(item);
      const state = uploader.states[key];
      if (!state) continue;

      let updates: Partial<
        Pick<PrescriptionItem, "uploadedUrl" | "uploadStatus" | "uploadError">
      > = {};

      if (state.status === "success" && state.url) {
        updates = {
          uploadedUrl: state.url,
          uploadStatus: "uploaded",
          uploadError: undefined,
        };
      } else if (state.status === "error") {
        updates = {
          uploadStatus: "error",
          uploadError: state.error,
        };
      } else if (state.status === "uploading") {
        updates = { uploadStatus: "uploading" };
      } else if (state.status === "pending") {
        updates = { uploadStatus: "pending" };
      }

      if (Object.keys(updates).length > 0) {
        updateItem(i, updates);
      }
    }
  }, [items, uploader.states, updateItem]);

  const uploadTotals = useMemo(
    () => computeUploadTotals(items, uploader.states),
    [items, uploader.states],
  );

  const exitFlow = useCallback(() => {
    // Not cleared here — clearing while the modal closes empties the items
    // list in the same render as the footer becomes visible again, flipping
    // Proceed to disabled for a frame before the screen actually leaves. The
    // unmount cleanup below clears it once nothing is rendering it anymore.
    const isFromCart =
      source === "cart" || useUIStore.getState().isRxFromCartFlow;
    useUIStore.getState().setIsRxFromCartFlow(false);
    if (isFromCart) {
      // dismissTo's name lookup wasn't reliably discarding
      // prescription-history + the viewer pushed on top of choose-method, so
      // pop the whole (prescription) stack down to its root unconditionally,
      // then land on a fresh choose-method — guarantees nothing is left
      // dangling regardless of entry path.
      router.dismissAll();
      router.replace("/(prescription)/choose-method");
    } else {
      // dismissTo pops back to the already-mounted (tabs) instance and its
      // upload tab rather than replacing into a duplicate (tabs) root stack entry.
      router.dismissTo("/(tabs)/upload");
    }
  }, [router, source]);

  // Clears the draft once this screen is actually gone — covers every exit
  // path (Leave, back, submit success) without ever touching state the
  // still-visible footer reads.
  useEffect(() => {
    return () => clearItems();
  }, [clearItems]);

  // useFocusEffect requires a memoized callback — it invokes it immediately
  // when the screen is already focused, not just on future focus events, so
  // an unstable reference here re-fires the handler right on mount.
  const handleBackPress = useCallback(() => {
    if (items.length > 0) setShowLeaveConfirm(true);
    else exitFlow();
  }, [items.length, exitFlow, setShowLeaveConfirm]);

  // Intercepts the Android hardware back button too, so it shows the same
  // warning instead of leaving (and silently dropping the draft) unprompted.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleBackPress();
          return true;
        },
      );
      return () => subscription.remove();
    }, [handleBackPress]),
  );

  const processAndAdd = async (assets: CapturedAsset[]) => {
    if (__DEV__) logger.debug("Processing and validating new assets...");
    const newItems: PrescriptionItem[] = [];
    const currentItems = usePrescriptionDraftStore.getState().items;
    for (const asset of assets) {
      const item = await validatePrescriptionFile(
        asset,
        showInfo,
        setTooLargeSizeMB,
        maxSizeBytes,
      );
      if (!item) continue;
      const isDuplicate =
        currentItems.some(
          (it) =>
            it.name === item.name &&
            (it.size === item.size || (!it.size && !item.size)) &&
            it.type === item.type,
        ) ||
        newItems.some(
          (it) =>
            it.name === item.name &&
            it.size === item.size &&
            it.type === item.type,
        );
      if (isDuplicate) {
        setDuplicateFileName(item.name);
        setDuplicateFileSize(item.size);
        continue;
      }
      if (currentItems.length + newItems.length >= maxFiles) {
        showInfo(
          "Limit Reached",
          `You can upload a maximum of ${maxFiles} prescriptions at once.`,
        );
        break;
      }
      newItems.push(item);
    }
    if (newItems.length > 0) {
      addItems(newItems);
      setActiveIndex(usePrescriptionDraftStore.getState().items.length - 1);
    }
  };

  const removeItem = (index: number) => setShowRemoveModal(index);

  const handleSubmit = async () => {
    // Was a hand-rolled isConnected check calling showOfflineAlert directly;
    // critical: true keeps that same blocking notice through the shared gate.
    if (!requireInternet({ critical: true })) return;
    // Atomic submission guard: set ref first to prevent concurrent submissions
    // Two taps in the same tick both read the stale false, and the loser's
    // finally would clear the winner's spinner — prevent this by locking first.
    if (submitting || submitLockRef.current) return;
    submitLockRef.current = true;
    if (__DEV__)
      logger.debug(
        "[Prescription] Proceed pressed! Using already-uploaded URLs from draft for items:",
        items,
      );
    setSubmitting(true);
    uploadedSnapshot.current = [...items];
    try {
      // Collect already-uploaded URLs from draft items
      // All files should be uploaded by now due to immediate upload on selection
      const uploadedUrls = items
        .map((item) => item.uploadedUrl)
        .filter(Boolean) as string[];

      // Check if any file is still uploading or failed
      const hasFailedUploads = items.some((item) => item.uploadStatus === "error");
      if (hasFailedUploads) {
        showInfo(
          "Upload Error",
          "Some files failed to upload. Please retry them before proceeding.",
        );
        return;
      }

      const hasIncompleteUploads = items.some(
        (item) =>
          item.uploadStatus === "uploading" ||
          (item.uploadStatus === "pending" && !item.uploadedUrl),
      );
      if (hasIncompleteUploads) {
        showInfo(
          "Still Uploading",
          "Some files are still uploading. Please wait for them to complete.",
        );
        return;
      }

      if (uploadedUrls.length !== items.length) {
        showInfo(
          "Upload Incomplete",
          "Some files were not uploaded. Please try again.",
        );
        return;
      }

      if (source === "cart") {
        // Order flow: DON'T create the prescription record here. The files are
        // now hosted URLs (above); the prescription is created in one POST at
        // the final Place Order step, so any images added later on Select
        // Patient are saved together. Carry the URLs forward.
        useUIStore.getState().setIsRxFromCartFlow(true);
        isNavigatingRef.current = true;
        router.replace({
          pathname: "/(prescription)/select-patient",
          params: {
            toPay,
            // Prescription isn't created yet in the order flow — carry the
            // hosted image URLs + category so payment can create it in one go.
            imageUrls: JSON.stringify(uploadedUrls),
            category: String(PRESCRIPTION_CATEGORY.PRESCRIPTION_ORDER),
            files: JSON.stringify(uploadedSnapshot.current),
          },
        });
        // Draft is cleared by this screen's unmount cleanup — clearing it here
        // would empty the still-visible list mid-transition.
        return;
      }

      // Standalone "upload & notify" flow has no payment step, so it must
      // create the prescription record now. uploadedUrls are collected in the
      // same order as uploadedSnapshot.current, so zipping by index pairs each
      // hosted url back up with the original file's name/size.
      const fileData = uploadedSnapshot.current.map((item, i) => ({
        url: uploadedUrls[i],
        name: item.name,
        size: item.size,
      }));
      setSavingPrescription(true);
      const result = await prescriptionService.upload({
        fileData,
        category: PRESCRIPTION_CATEGORY.ORDER,
      });
      if (!result.success) {
        showInfo(
          "Upload Failed",
          result.error ?? "Could not save prescription. Please try again.",
        );
        return;
      }
      // Same prefix useDismissPrescription's onSettled invalidates with —
      // QUERY_KEYS.CUSTOMER.PRESCRIPTIONS.LIST(params) trails a params
      // segment, so calling it with no args produces a trailing `undefined`
      // that fails to prefix-match cached keys built with real params.
      void queryClient.invalidateQueries({
        queryKey: ["customer", "prescriptions"],
      });
      setShowReviewSheet(true);
    } catch (e) {
      const error = asError(e);
      showInfo(
        "Upload Failed",
        error?.response?.data?.message ??
          error?.message ??
          "Upload failed. Please try again.",
      );
    } finally {
      if (!isNavigatingRef.current) {
        submitLockRef.current = false;
        setSubmitting(false);
        setSavingPrescription(false);
      }
    }
  };

  return (
    <View style={s.root}>
      <ScreenHeader title="Upload Prescription" onBack={handleBackPress} />

      <View style={s.displayContainer}>
        <PreviewDisplay
          activeItem={activeItem}
          screenWidth={screenWidth}
          previewHeight={previewHeight}
          onLayout={setPreviewHeight}
          onPrev={goPrev}
          showPrev={activeIndex > 0}
          onNext={goNext}
          showNext={activeIndex < items.length - 1}
        />
      </View>

      {submitting && (
        <UploadProgressPanel
          total={uploadTotals.total}
          done={uploadTotals.done}
          percent={uploadTotals.percent}
          failed={uploadTotals.failed}
          saving={savingPrescription}
        />
      )}

      <PreviewThumbnails
        items={items}
        activeIndex={activeIndex}
        maxFiles={maxFiles}
        onAdd={() => setShowAddSheet(true)}
        onSelect={setActiveIndex}
        onRemove={removeItem}
        onSubmit={handleSubmit}
        submitting={submitting}
        safeAreaBottom={adjustedBottom}
        uploadStates={uploader.states}
        onRetry={uploader.retryOne}
      />

      <UploadPrescriptionSheet
        isVisible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        onUploadFile={() => {
          setShowAddSheet(false);
          setTimeout(pickImages, 300);
        }}
        onTakePhoto={() => {
          setShowAddSheet(false);
          setTimeout(takePhoto, 300);
        }}
        onUploadPdf={() => {
          setShowAddSheet(false);
          setTimeout(pickPdfs, 300);
        }}
        toPay={toPay}
        fromPreview
      />

      {infoModal && (
        <InfoModal
          title={infoModal.title}
          message={infoModal.message}
          onClose={() => setInfoModal(null)}
        />
      )}

      <RemoveConfirmModal
        visible={showRemoveModal !== null}
        onConfirm={() => {
          if (showRemoveModal !== null) {
            removeFromStore(showRemoveModal);
            setActiveIndex((prev) =>
              Math.max(0, Math.min(prev, items.length - 2)),
            );
            setShowRemoveModal(null);
          }
        }}
        onCancel={() => setShowRemoveModal(null)}
      />

      <RemoveConfirmModal
        visible={showLeaveConfirm}
        title="Leave this page?"
        message="Uploaded prescriptions will be removed"
        icon={HOME_IMAGES.leaveWarning}
        iconBg="#FFF1F1"
        confirmBg="#E02D5B"
        cancelLabel="Continue"
        confirmLabel="Leave"
        onConfirm={() => {
          setShowLeaveConfirm(false);
          exitFlow();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <DuplicateFileModal
        fileName={duplicateFileName}
        fileSizeLabel={
          duplicateFileSize != null
            ? `${(duplicateFileSize / (1024 * 1024)).toFixed(1)} MB`
            : undefined
        }
        onClose={() => {
          setDuplicateFileName("");
          setDuplicateFileSize(undefined);
        }}
        onChooseAnother={() => {
          setDuplicateFileName("");
          setDuplicateFileSize(undefined);
          setShowAddSheet(true);
        }}
      />

      <FileTooLargeModal
        visible={!!tooLargeSizeMB}
        selectedSizeLabel={`${tooLargeSizeMB} MB`}
        maxSizeLabel={maxSizeLabel}
        onClose={() => setTooLargeSizeMB(null)}
        onChooseAnother={() => {
          setTooLargeSizeMB(null);
          setShowAddSheet(true);
        }}
      />

      <PrescriptionReviewSheet
        isVisible={showReviewSheet}
        onClose={() => setShowReviewSheet(false)}
        onNotify={() => {
          useUIStore.getState().setHasJustUploadedPrescription(true);
          useUIStore.getState().setIsRxFromCartFlow(false);
          router.dismissTo("/(tabs)");
          // Cleared after navigation for the same reason as the order flow above.
          clearItems();
        }}
      />
    </View>
  );
};
