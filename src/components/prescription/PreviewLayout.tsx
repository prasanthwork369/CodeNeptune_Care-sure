import { storageApi } from "@/src/api/storage.api";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { UploadPrescriptionSheet } from "@/src/components/upload/UploadPrescriptionSheet";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { PRESCRIPTION_CATEGORY } from "@/src/constants/prescription-category";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { prescriptionService } from "@/src/services/prescription.service";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { PrescriptionItem } from "@/src/types/prescription";
import { moderateScale } from "@/src/utils/exactScale";
import { MAX_FILES, validatePrescriptionFile } from "@/src/utils/prescription";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Pdf from "react-native-pdf";

const FOLDER = "customers/prescriptions";
const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

function showPermissionAlert(feature: "photo library" | "camera") {
  Alert.alert(
    "Permission Required",
    `Please allow ${feature} access in Settings to continue.`,
    [
      { text: "Cancel", style: "cancel" },
      { text: "Open Settings", onPress: () => Linking.openSettings() },
    ],
  );
}

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
  const [showAddSheet, setShowAddSheet] = useState(false);
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
      const item = await validatePrescriptionFile(asset);
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
        Alert.alert(
          "Duplicate File",
          `"${item.name}" is already in your upload list.`,
        );
        continue;
      }
      if (currentItems.length + newItems.length >= MAX_FILES) {
        Alert.alert(
          "Limit Reached",
          `Maximum ${MAX_FILES} prescriptions allowed.`,
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
        showPermissionAlert("photo library");
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
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };
  const pickPdfs = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showPermissionAlert("photo library");
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
      Alert.alert("Error", "Failed to pick PDF. Please try again.");
    }
  };
  const removeItem = (index: number) => {
    Alert.alert("Remove", "Remove this prescription?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeFromStore(index);
          setActiveIndex((prev) =>
            Math.max(0, Math.min(prev, items.length - 2)),
          );
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    uploadedSnapshot.current = [...items];
    try {
      const uploadedUrls: string[] = [];
      for (const item of uploadedSnapshot.current) {
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
        Alert.alert(
          "Upload Failed",
          result.error ?? "Could not save prescription. Please try again.",
        );
        return;
      }
      setCreatedPrescriptionId(result.data?.id ?? "");
      setShowConfirmed(true);
      clearItems();
    } catch (error: any) {
      Alert.alert(
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
        <View style={{ flex: 1, position: "relative" }}>
          <View
            className="rounded-md overflow-hidden"
            style={{
              flex: 1,
              shadowColor: "#919EAB33",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.5,
              shadowRadius: 1,
              elevation: 0,
              borderWidth: 1,
              borderColor: "#919EAB33",
              backgroundColor: "#F9FAFB",
            }}
            onLayout={(e) => setPreviewHeight(e.nativeEvent.layout.height)}
          >
            {activeItem && isPdf(activeItem.localUri, activeItem.type) ? (
              <Pdf
                source={{ uri: activeItem.localUri, cache: true }}
                style={{
                  width: screenWidth - 48,
                  height: previewHeight,
                  backgroundColor: "#F9FAFB",
                }}
                trustAllCerts={false}
                onError={() => Alert.alert("Error", "Could not load PDF.")}
              />
            ) : activeItem ? (
              <Image
                source={{ uri: activeItem.localUri }}
                style={{ flex: 1, width: "100%" }}
                resizeMode="contain"
              />
            ) : null}
          </View>
          {activeIndex < items.length - 1 && (
            <Touchable
              onPress={() => setActiveIndex((prev) => prev + 1)}
              style={{
                position: "absolute",
                right: -20,
                top: "50%",
                marginTop: -24,
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#919EAB33",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 20,
                elevation: 8,
                shadowColor: "#919EAB33",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
              }}
            >
              <icons.arrow_forward_ios width={16} height={16} fill="#222222" />
            </Touchable>
          )}
        </View>
      </View>

      <View
        className="bg-white"
        style={{
          borderTopWidth: 1,
          borderTopColor: "#919EAB33",
          shadowColor: "#919EAB33",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 5,
        }}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            gap: 12,
          }}
        >
          {items.length < MAX_FILES && (
            <Touchable
              onPress={() => setShowAddSheet(true)}
              disabled={submitting}
              className="w-[82px] h-[82px] rounded-[14px] border border-[#919EAB33] bg-[#FCFDFF] items-center justify-center"
              style={{ opacity: submitting ? 0.5 : 1 }}
              activeOpacity={0.7}
            >
              <icons.add_photo width={28} height={28} />
            </Touchable>
          )}
          {items.map((item, index) => (
            <Touchable
              key={index}
              onPress={() => setActiveIndex(index)}
              activeOpacity={0.8}
            >
              <View
                className="w-[82px] h-[82px] rounded-lg overflow-hidden"
                style={{
                  borderWidth: activeIndex === index ? 2 : 1,
                  borderColor: activeIndex === index ? "#0F7635" : "#919EAB33",
                  backgroundColor: "#F9FAFB",
                }}
              >
                {isPdf(item.localUri, item.type) ? (
                  <View className="flex-1 items-center justify-center">
                    <icons.upload_file width={24} height={24} />
                    <Text
                      className="font-inter-bold text-[#1A1C1E] mt-1"
                      style={{ fontSize: moderateScale(8) }}
                    >
                      PDF
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: item.localUri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                  />
                )}
              </View>
              {!submitting && (
                <Touchable
                  onPress={() => removeItem(index)}
                  className="absolute top-1.5 right-1.5 bg-white rounded-full w-5 h-5 items-center justify-center border border-[#919EAB33] z-30"
                  style={{ elevation: 2 }}
                >
                  <icons.close_small width={10} height={10} fill="#222222" />
                </Touchable>
              )}
            </Touchable>
          ))}
        </ScrollView>
        <View
          className="px-3 py-4 border-t border-[#919EAB1A] flex-row items-center justify-between"
          style={{ paddingBottom: Math.max(adjustedBottom + 8, 24) }}
        >
          <Text
            className="font-inter-medium text-[#000000]"
            style={{ fontSize: moderateScale(14) }}
          >
            {items.length} / {MAX_FILES} Prescription
            {items.length !== 1 ? "s" : ""} Uploaded
          </Text>
          <Touchable
            className="bg-[#0F7635] px-6 py-3.5 rounded-md flex-row items-center gap-x-2"
            activeOpacity={0.8}
            disabled={submitting || items.length === 0}
            style={{ opacity: submitting || items.length === 0 ? 0.6 : 1 }}
            onPress={handleSubmit}
          >
            {submitting && <ActivityIndicator size="small" color="#fff" />}
            <Text
              className="text-white font-inter-semibold"
              style={{ fontSize: moderateScale(14) }}
            >
              {submitting ? "Uploading..." : "Proceed"}
            </Text>
          </Touchable>
        </View>
      </View>

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
                if (!canAskAgain) showPermissionAlert("camera");
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                quality: 0.9,
              });
              if (!result.canceled && result.assets.length > 0)
                await processAndAdd(result.assets);
            } catch {
              Alert.alert("Error", "Failed to take photo. Please try again.");
            }
          }, 300);
        }}
        onUploadPdf={() => {
          setShowAddSheet(false);
          setTimeout(pickPdfs, 300);
        }}
      />

      <Modal
        visible={showConfirmed}
        transparent
        animationType="slide"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={() => setShowConfirmed(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowConfirmed(false)}
          />
          <View className="items-center mb-4">
            <Touchable
              onPress={() => setShowConfirmed(false)}
              className="bg-[#424242] w-12 h-12 rounded-full items-center justify-center border border-white/20"
            >
              <icons.close_icon width={14} height={14} fill="#FFFFFF" />
            </Touchable>
          </View>
          <View
            className="bg-white rounded-t-[12px] items-center px-6 pt-8"
            style={{ paddingBottom: Math.max(adjustedBottom + 16, 32) }}
          >
            <DotLottie
              source={ANIMATIONS.orderPlaced}
              autoplay
              loop={false}
              style={{ width: 160, height: 160 }}
            />
            <Text
              style={{
                fontSize: moderateScale(20),
                fontWeight: "700",
                color: "#1A1C1E",
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              Prescription Uploaded!
            </Text>
            <View
              className="flex-row items-center px-4 py-2 rounded-full mb-6"
              style={{
                backgroundColor: "#F2FFFA",
                borderWidth: 1,
                borderColor: "#0F763522",
              }}
            >
              <icons.verified_user width={14} height={14} fill="#0F7635" />
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontWeight: "500",
                  color: "#0F7635",
                  marginLeft: 6,
                }}
              >
                Your prescription has been submitted successfully
              </Text>
            </View>
            <Touchable
              className="w-full items-center justify-center py-4 rounded-lg"
              style={{ backgroundColor: "#0F7635" }}
              activeOpacity={0.85}
              onPress={() => {
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
            >
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: "600",
                  color: "#fff",
                  letterSpacing: 0.5,
                }}
              >
                Continue
              </Text>
            </Touchable>
          </View>
        </View>
      </Modal>
    </View>
  );
};
