import { DuplicateFileModal, FileTooLargeModal, InfoModal } from "@/src/components/prescription/preview/sections";
import { MAX_SIZE_BYTES } from "@/src/utils/prescription";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { usePrescriptionPicker } from "@/src/hooks/ui/usePrescriptionPicker";
import { useNav } from "@/src/hooks/useNav";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UploadPrescriptionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  toPay?: string;
  patientMemberId?: string;
  onUploadFile?: () => void;
  onTakePhoto?: () => void;
  onUploadPdf?: () => void;
  onSelectExisting?: () => void;
}

const VALID_ITEMS = [
  "Doctor's details",
  "Date of prescription",
  "Patient's details",
  "Medicine details",
];

// Tracks the sheet's animated snap position (rendered as a child of
// BottomSheetModal) so the "Before You Upload" section toggles live as the
// user drags, instead of only after the drag settles.
const BeforeUploadSync: React.FC<{ onExpandChange: (expanded: boolean) => void }> = ({
  onExpandChange,
}) => {
  const { animatedIndex } = useBottomSheet();

  useAnimatedReaction(
    () => animatedIndex.value,
    (current, previous) => {
      if (previous !== null && current === previous) return;
      runOnJS(onExpandChange)(current > 0.5);
    },
  );

  return null;
};

export const UploadPrescriptionSheet: React.FC<
  UploadPrescriptionSheetProps
> = ({
  isVisible,
  onClose,
  toPay,
  patientMemberId,
  onUploadFile,
  onTakePhoto,
  onUploadPdf,
  onSelectExisting,
}) => {
  const router = useNav();
  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
    onDismiss?: () => void;
  } | null>(null);
  const [tooLargeSizeMB, setTooLargeSizeMB] = useState<string | null>(null);
  const [duplicateFile, setDuplicateFile] = useState<{ name: string; size?: number } | null>(null);
  const { pickImages, pickPdf, takePhoto } = usePrescriptionPicker(
    onClose,
    toPay,
    patientMemberId,
    (title, message, onDismiss) => setInfoModal({ title, message, onDismiss }),
    setTooLargeSizeMB,
    (name, size) => setDuplicateFile({ name, size }),
  );

  const handleUploadFile = onUploadFile ?? pickImages;
  const handleTakePhoto = onTakePhoto ?? takePhoto;
  const handleUploadPdf = onUploadPdf ?? pickPdf;
  const [showBeforeUpload, setShowBeforeUpload] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowBeforeUpload(false);
    }
  }, [isVisible]);

  const { bottom } = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);

  const handleToggleBeforeUpload = () => {
    // Expand to the larger snap point when showing the extra content,
    // shrink back to the normal one when hiding it. `showBeforeUpload`
    // itself is kept in sync via BeforeUploadSync below, so it also
    // updates live as the user manually drags between snap points.
    sheetRef.current?.snapToIndex(showBeforeUpload ? 0 : 1);
  };

  return (
    <>
      {infoModal && (
        <InfoModal
          title={infoModal.title}
          message={infoModal.message}
          onClose={() => setInfoModal(null)}
          onDismiss={infoModal.onDismiss}
        />
      )}

      <FileTooLargeModal
        visible={!!tooLargeSizeMB}
        selectedSizeLabel={`${tooLargeSizeMB} MB`}
        maxSizeLabel={`${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB`}
        onClose={() => setTooLargeSizeMB(null)}
      />

      <DuplicateFileModal
        fileName={duplicateFile?.name ?? ""}
        fileSizeLabel={
          duplicateFile?.size != null
            ? `${(duplicateFile.size / (1024 * 1024)).toFixed(1)} MB`
            : undefined
        }
        onClose={() => setDuplicateFile(null)}
      />

      <GorhomBottomSheet
        ref={sheetRef}
        isVisible={isVisible}
        onClose={onClose}
        snapPoints={["40%", "65%"]}
        closeButtonOffset="40%"
        backgroundStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        }}
      >
        <BeforeUploadSync onExpandChange={setShowBeforeUpload} />
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: bottom + 16,
          }}
        >
          {/* Top action cards */}
          <View className="flex-row gap-3">
            <Touchable
              activeOpacity={0.85}
              onPress={handleUploadFile}
              style={{ borderColor: "#919EAB33" }}
              className="flex-1 items-center border rounded-[8px] py-5 bg-white"
            >
              <View
                className="w-12 h-12 rounded-[6px] items-center justify-center mb-2"
                style={{ backgroundColor: "#E6F4EA" }}
              >
                <icons.upload_file width={24} height={24} />
              </View>
              <Text className="text-[13px] font-inter-medium text-brand-text">
                Upload Images
              </Text>
            </Touchable>

            <Touchable
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                setTimeout(handleTakePhoto, 400);
              }}
              style={{ borderColor: "#919EAB33" }}
              className="flex-1 items-center border rounded-[8px] py-5 bg-white"
            >
              <View
                className="w-12 h-12 rounded-[6px] items-center justify-center mb-2"
                style={{ backgroundColor: "#E6F4EA" }}
              >
                <icons.photo_camera_green width={24} height={24} />
              </View>
              <Text className="text-[13px] font-inter-medium text-brand-text">
                Take a Photo
              </Text>
            </Touchable>

            <Touchable
              activeOpacity={0.85}
              onPress={handleUploadPdf}
              style={{ borderColor: "#919EAB33" }}
              className="flex-1 items-center border rounded-[8px] py-5 bg-white"
            >
              <View
                className="w-12 h-12 rounded-[6px] items-center justify-center mb-2"
                style={{ backgroundColor: "#E6F4EA" }}
              >
                <icons.upload_pdf width={24} height={24} />
              </View>
              <Text className="text-[13px] font-inter-medium text-brand-text">
                Upload PDF
              </Text>
            </Touchable>
          </View>

          {/* Select from My Prescriptions */}
          <Touchable
            onPress={() => {
              onClose();
              if (onSelectExisting) onSelectExisting();
              router.push({
                pathname: "/prescription-history",
                params: toPay ? { toPay, source: "cart" } : {},
              });
            }}
            activeOpacity={0.85}
            style={{
              borderWidth: 1,
              borderColor: "#00000014",
              backgroundColor: "#FFFFFF",
            }}
            className="flex-row items-center rounded-[6px] px-4 py-3.5 mt-4"
          >
            <View
              className="w-12 h-12 rounded-[8px] items-center justify-center"
              style={{ backgroundColor: "#E6F4EA" }}
            >
              <icons.prescription_green width={24} height={24} />
            </View>
            <View className="flex-1 ml-3">
              <Text className="text-[14px] font-inter-medium text-[#0F2B22]">
                Select from My Prescriptions
              </Text>
              <Text
                style={{ color: colors.primary }}
                className="self-start text-[10px] bg-[#F3FAF7] px-3 py-1 rounded-lg font-inter-semibold tracking-wider mt-1"
              >
                FASTER VERIFICATION
              </Text>
            </View>
            <icons.arrow_forward_ios width={14} height={14} fill="#9CA3AF" />
          </Touchable>

          {/* Before You Upload header */}
          <Touchable
            activeOpacity={0.8}
            onPress={handleToggleBeforeUpload}
            className="flex-row items-center mt-5"
          >
            <Text className="text-[14px] font-inter-semibold text-brand-text">
              Before You Upload
            </Text>
            <View
              style={{
                transform: [{ rotate: showBeforeUpload ? "0deg" : "-90deg" }],
                marginLeft: 6,
              }}
            >
              <icons.down_arrow width={14} height={14} fill="#1A1C1E" />
            </View>
          </Touchable>

          {showBeforeUpload && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={{ borderColor: "#0F763522" }}
              className="border rounded-2xl p-4 mt-3"
            >
              <View className="flex-row">
                <View
                  className="w-[130px] h-[130px] rounded-xl border border-[#919EAB33] items-center justify-center"
                  style={{ backgroundColor: "#F2FFFA" }}
                >
                  <Image
                    source={HOME_IMAGES.samplePrescription}
                    style={{ width: 120, height: 120 }}
                    resizeMode="contain"
                  />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-[14px] font-inter-semibold text-brand-text mb-2">
                    Valid prescription includes:
                  </Text>
                  {VALID_ITEMS.map((label, idx) => (
                    <View key={label} className="flex-row items-center mb-1.5">
                      <View
                        className="w-[18px] h-[18px] rounded-full items-center justify-center mr-2"
                        style={{ backgroundColor: "#0F7635" }}
                      >
                        <Text className="text-[10px] font-inter-bold text-white">
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="text-[12px] font-inter-medium text-brand-text">
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View
                className="mt-3 mb-3"
                style={{
                  borderTopWidth: 1,
                  borderColor: "#0F763544",
                  borderStyle: "dotted",
                }}
              />

              <Text className="text-[12px] font-inter text-brand-subtext mb-1">
                File size should be less than 5 MB
              </Text>
              <Text className="text-[12px] font-inter text-brand-subtext mb-1">
                Supported formats: PDF, JPG, JPEG, PNG
              </Text>
            </Animated.View>
          )}
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    </>
  );
};
