import { asError } from "@/src/api/errors";
import { PrescriptionReviewSheet } from "@/src/features/prescription/components/PrescriptionReviewSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { UploadPrescriptionSheet } from "../components/UploadPrescriptionSheet";
import { HOME_IMAGES } from "@/src/constants/images";
import { PRESCRIPTION_CATEGORY } from "@/src/features/prescription/constants/prescription-category";
import {
  CapturedAsset,
  usePrescriptionUploadService,
} from "../scanner";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import {
  uploadKeyOf,
  usePrescriptionUploader,
} from "../hooks/usePrescriptionUploader";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "@/src/services/prescription.service";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { useUIStore } from "@/src/store/uiStore";
import { PrescriptionItem } from "@/src/features/prescription/types";
import { logger } from "@/src/utils/logger";
import { requireInternet } from "@/src/utils/offline";
import { validatePrescriptionFile } from "../utils/prescription";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BackHandler, View, useWindowDimensions } from "react-native";
import {
  DuplicateFileModal,
  FileTooLargeModal,
  InfoModal,
  PendingPrescriptionModal,
  PreviewDisplay,
  PreviewSuccessModal,
  PreviewThumbnails,
  RemoveConfirmModal,
  UploadProgressPanel,
} from "../sections/preview";

const FOLDER = "customers/prescriptions";

export const PreviewLayout: React.FC = () => {
  const router = useNav();
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
  const items = usePrescriptionDraftStore((s) => s.items);
  const addItems = usePrescriptionDraftStore((s) => s.addItems);
  const removeFromStore = usePrescriptionDraftStore((s) => s.removeItem);
  const clearItems = usePrescriptionDraftStore((s) => s.clearItems);
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
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);
  const [showReviewSheet, setShowReviewSheet] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
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
  // Hosted image URLs produced at Preview for the order flow. The prescription
  // record itself is NOT created here anymore — it's created at the final
  // Place Order step — so we stash the URLs to carry forward to payment.
  const deferredImageUrls = useRef<string[]>([]);
  const activeItem = items[activeIndex] ?? items[0];

  // React Compiler memoizes these automatically — stable identities for
  // React.memo(PreviewDisplay) without a manual dependency array to drift.
  const goPrev = () => setActiveIndex((prev) => prev - 1);
  const goNext = () => setActiveIndex((prev) => prev + 1);

  // Averaged across files so one large upload can't dominate the bar. Failed
  // files contribute 0 rather than freezing the percentage at their last value.
  const uploadTotals = useMemo(() => {
    const total = items.length;
    let done = 0;
    let failed = 0;
    let sum = 0;
    for (const item of items) {
      const state = uploader.states[uploadKeyOf(item)];
      if (!state) continue;
      if (state.status === "success") {
        done += 1;
        sum += 100;
      } else if (state.status === "error") {
        failed += 1;
      } else {
        sum += state.progress;
      }
    }
    return {
      total,
      done,
      failed,
      percent: total > 0 ? Math.round(sum / total) : 0,
    };
  }, [items, uploader.states]);

  const exitFlow = useCallback(() => {
    clearItems();
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
      router.replace("/(tabs)/upload");
    }
  }, [clearItems, router, source]);

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
    // Ref, not the `submitting` state: two taps in the same tick both read the
    // stale false, and the loser's finally would clear the winner's spinner.
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    if (__DEV__)
      logger.debug(
        "[Prescription] Proceed pressed! Starting upload flow for items:",
        items,
      );
    setSubmitting(true);
    uploadedSnapshot.current = [...items];
    try {
      // Null means at least one file failed; the thumbnails carry a per-file
      // Retry, so stay on this screen rather than losing the user's work.
      const uploadedUrls = await uploader.uploadAll(uploadedSnapshot.current);
      if (!uploadedUrls) return;

      if (source === "cart") {
        // Order flow: DON'T create the prescription record here. The files are
        // now hosted URLs (above); the prescription is created in one POST at
        // the final Place Order step, so any images added later on Select
        // Patient are saved together. Carry the URLs forward.
        deferredImageUrls.current = uploadedUrls;
        useUIStore.getState().setIsRxFromCartFlow(true);
        setShowConfirmed(true);
        return;
      }

      // Standalone "upload & notify" flow has no payment step, so it must
      // create the prescription record now.
      const result = await prescriptionService.upload({
        imageUrls: uploadedUrls,
        category: PRESCRIPTION_CATEGORY.ORDER,
      });
      if (!result.success) {
        showInfo(
          "Upload Failed",
          result.error ?? "Could not save prescription. Please try again.",
        );
        return;
      }
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
      submitLockRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Upload Prescription" onBack={handleBackPress} />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 8,
        }}
      >
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
        cancelLabel="Great"
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

      <PendingPrescriptionModal
        visible={showPendingModal}
        onViewPrescriptions={() => {
          setShowPendingModal(false);
          router.push("/prescription-history");
        }}
        onClose={() => {
          setShowPendingModal(false);
          router.back();
        }}
      />

      <PreviewSuccessModal
        visible={showConfirmed}
        onClose={() => setShowConfirmed(false)}
        onContinue={() => {
          router.replace({
            pathname: "/(prescription)/select-patient",
            params: {
              toPay,
              // Prescription isn't created yet in the order flow — carry the
              // hosted image URLs + category so payment can create it in one go.
              imageUrls: JSON.stringify(deferredImageUrls.current),
              category: String(PRESCRIPTION_CATEGORY.PRESCRIPTION_ORDER),
              files: JSON.stringify(uploadedSnapshot.current),
            },
          });
          setShowConfirmed(false);
          // Only after navigating: clearing while still mounted empties the
          // preview and blanks the screen behind the modal.
          clearItems();
        }}
        safeAreaBottom={adjustedBottom}
      />

      <PrescriptionReviewSheet
        isVisible={showReviewSheet}
        onClose={() => setShowReviewSheet(false)}
        onNotify={() => {
          useUIStore.getState().setHasJustUploadedPrescription(true);
          useUIStore.getState().setIsRxFromCartFlow(false);
          router.replace("/(tabs)");
          // Cleared after navigation for the same reason as the order flow above.
          clearItems();
        }}
      />
    </View>
  );
};
