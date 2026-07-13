import { storageApi } from "@/src/api/storage.api";
import { PrescriptionReviewSheet } from "@/src/components/prescription/PrescriptionReviewSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { UploadPrescriptionSheet } from "@/src/components/upload/UploadPrescriptionSheet";
import { HOME_IMAGES } from "@/src/constants/images";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "@/src/services/prescription.service";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { useUIStore } from "@/src/store/uiStore";
import { PrescriptionItem } from "@/src/types/prescription";
import {
    MAX_FILES,
    MAX_SIZE_BYTES,
    validatePrescriptionFile,
    capturePrescriptionImage,
} from "@/src/utils/prescription";
import { useFocusEffect } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
} from "./sections";

const FOLDER = "customers/prescriptions";

const showPermissionAlert = (
  feature: "photo library" | "camera",
  showInfo: (t: string, m: string) => void,
) => {
  showInfo(
    "Permission Required",
    `Please allow ${feature} access in Settings to continue.`,
  );
};

export const PreviewLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { width: screenWidth } = useWindowDimensions();
  const [previewHeight, setPreviewHeight] = useState(0);
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

  const {
    items,
    addItems,
    removeItem: removeFromStore,
    clearItems,
  } = usePrescriptionDraftStore();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (usePrescriptionDraftStore.getState().items.length > 0) return;
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
    if (seed.length > 0) addItems(seed);
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
  // Hosted image URLs produced at Preview for the order flow. The prescription
  // record itself is NOT created here anymore — it's created at the final
  // Place Order step — so we stash the URLs to carry forward to payment.
  const deferredImageUrls = useRef<string[]>([]);
  const activeItem = items[activeIndex] ?? items[0];

  const handleBackPress = useCallback(() => {
    if (items.length > 0) setShowLeaveConfirm(true);
    else router.back();
  }, [items.length, router]);

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

  const processAndAdd = async (
    assets: (
      | DocumentPicker.DocumentPickerAsset
      | ImagePicker.ImagePickerAsset
    )[],
  ) => {
    const newItems: PrescriptionItem[] = [];
    const currentItems = usePrescriptionDraftStore.getState().items;
    for (const asset of assets) {
      const item = await validatePrescriptionFile(
        asset,
        showInfo,
        setTooLargeSizeMB,
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
      if (currentItems.length + newItems.length >= MAX_FILES) {
        showInfo(
          "Limit Reached",
          `You can upload a maximum of ${MAX_FILES} prescriptions at once.`,
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

  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert("photo library", showInfo);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"] as ImagePicker.MediaType[],
        quality: 0.9,
        allowsMultipleSelection: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      await processAndAdd(result.assets);
    } catch {
      showInfo("Error", "Failed to pick images. Please try again.");
    }
  };

  const pickPdfs = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert("photo library", showInfo);
        return;
      }
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: true,
      });
      if (result.canceled || result.assets.length === 0) return;
      await processAndAdd(result.assets);
    } catch {
      showInfo("Error", "Failed to pick PDF. Please try again.");
    }
  };

  const removeItem = (index: number) => setShowRemoveModal(index);

  const handleSubmit = async () => {
    if (__DEV__)
      console.log(
        "[Prescription] Proceed pressed! Starting upload flow for items:",
        items,
      );
    setSubmitting(true);
    uploadedSnapshot.current = [...items];
    try {
      const uploadedUrls: string[] = [];
      for (const item of uploadedSnapshot.current) {
        if (/^https?:\/\//i.test(item.localUri)) {
          uploadedUrls.push(item.localUri);
          continue;
        }
        const { url } = await storageApi.upload(
          { uri: item.localUri, name: item.name, type: item.type },
          FOLDER,
        );
        uploadedUrls.push(url);
      }
      if (source === "cart") {
        // Order flow: DON'T create the prescription record here. The files are
        // now hosted URLs (above); the prescription is created in one POST at
        // the final Place Order step, so any images added later on Select
        // Patient are saved together. Carry the URLs forward.
        deferredImageUrls.current = uploadedUrls;
        clearItems();
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
      clearItems();
      setShowReviewSheet(true);
    } catch (error: any) {
      showInfo(
        "Upload Failed",
        error?.response?.data?.message ??
          error?.message ??
          "Upload failed. Please try again.",
      );
    } finally {
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
          onPrev={() => setActiveIndex((prev) => prev - 1)}
          showPrev={activeIndex > 0}
          onNext={() => setActiveIndex((prev) => prev + 1)}
          showNext={activeIndex < items.length - 1}
        />
      </View>

      <PreviewThumbnails
        items={items}
        activeIndex={activeIndex}
        maxFiles={MAX_FILES}
        onAdd={() => setShowAddSheet(true)}
        onSelect={setActiveIndex}
        onRemove={removeItem}
        onSubmit={handleSubmit}
        submitting={submitting}
        safeAreaBottom={adjustedBottom}
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
          setTimeout(async () => {
            try {
              const { status, canAskAgain } =
                await ImagePicker.requestCameraPermissionsAsync();
              if (status !== "granted") {
                if (!canAskAgain) showPermissionAlert("camera", showInfo);
                return;
              }
              const scannedUri = await capturePrescriptionImage();
              if (scannedUri) {
                const filename = scannedUri.split("/").pop() || "scanned_prescription.jpg";
                const asset = {
                  uri: scannedUri,
                  name: filename,
                  fileName: filename,
                  mimeType: "image/jpeg",
                };
                await processAndAdd([asset as any]);
              }
            } catch {
              showInfo("Error", "Failed to take photo. Please try again.");
            }
          }, 300);
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
          clearItems();
          router.back();
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
        maxSizeLabel={`${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB`}
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
        }}
      />
    </View>
  );
};
