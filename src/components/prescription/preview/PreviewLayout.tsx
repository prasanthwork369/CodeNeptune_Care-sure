import { storageApi } from "@/src/api/storage.api";
import { PrescriptionReviewSheet } from "@/src/components/prescription/PrescriptionReviewSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { UploadPrescriptionSheet } from "@/src/components/upload/UploadPrescriptionSheet";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "@/src/services/prescription.service";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { useUIStore } from "@/src/store/uiStore";
import { PrescriptionItem } from "@/src/types/prescription";
import { MAX_FILES, validatePrescriptionFile } from "@/src/utils/prescription";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  DuplicateFileModal,
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
  const insets = useSafeAreaInsets();
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
  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState<number | null>(null);
  const showInfo = (title: string, message: string) =>
    setInfoModal({ title, message });
  const [createdPrescriptionId, setCreatedPrescriptionId] = useState("");
  const uploadedSnapshot = useRef<PrescriptionItem[]>([]);
  const activeItem = items[activeIndex] ?? items[0];

  const processAndAdd = async (
    assets: (
      | DocumentPicker.DocumentPickerAsset
      | ImagePicker.ImagePickerAsset
    )[],
  ) => {
    const newItems: PrescriptionItem[] = [];
    const currentItems = usePrescriptionDraftStore.getState().items;
    for (const asset of assets) {
      const item = await validatePrescriptionFile(asset, showInfo);
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
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        const url = await storageApi.upload(
          { uri: item.localUri, name: item.name, type: item.type },
          FOLDER,
        );
        uploadedUrls.push(url);
      }
      const category =
        source === "cart"
          ? PRESCRIPTION_CATEGORY.PRESCRIPTION_ORDER
          : PRESCRIPTION_CATEGORY.ORDER;
      const result = await prescriptionService.upload({
        imageUrls: uploadedUrls,
        category,
      });
      if (!result.success) {
        showInfo(
          "Upload Failed",
          result.error ?? "Could not save prescription. Please try again.",
        );
        return;
      }
      setCreatedPrescriptionId(result.data?.id ?? "");
      clearItems();
      if (source === "cart") {
        useUIStore.getState().setIsRxFromCartFlow(true);
        setShowConfirmed(true);
      } else {
        setShowReviewSheet(true);
      }
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
      <ScreenHeader title="Upload Prescription" />

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
        safeAreaBottom={insets.bottom}
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
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.9,
              });
              if (!result.canceled && result.assets.length > 0)
                await processAndAdd(result.assets);
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

      <DuplicateFileModal
        fileName={duplicateFileName}
        onClose={() => setDuplicateFileName("")}
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
          setShowConfirmed(false);
          router.replace({
            pathname: "/(prescription)/select-patient",
            params: {
              toPay,
              prescriptionId: createdPrescriptionId,
              files: JSON.stringify(uploadedSnapshot.current),
            },
          });
        }}
        safeAreaBottom={insets.bottom}
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
