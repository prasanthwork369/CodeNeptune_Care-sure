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
import { Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface UploadPrescriptionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onReopen?: () => void;
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
  onReopen,
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
  const [duplicateFile, setDuplicateFile] = useState<{ name: string; size?: number; proceed: () => void } | null>(null);
  const { pickImages, pickPdf, takePhoto } = usePrescriptionPicker(
    onClose,
    toPay,
    patientMemberId,
    (title, message, onDismiss) => setInfoModal({ title, message, onDismiss }),
    setTooLargeSizeMB,
    (name, size, proceed) => setDuplicateFile({ name, size, proceed }),
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

  const adjustedBottom = useAdjustedBottomInset();
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
        onChooseAnother={() => {
          setTooLargeSizeMB(null);
          onReopen?.();
        }}
      />

      <DuplicateFileModal
        fileName={duplicateFile?.name ?? ""}
        fileSizeLabel={
          duplicateFile?.size != null
            ? `${(duplicateFile.size / (1024 * 1024)).toFixed(1)} MB`
            : undefined
        }
        onClose={() => {
          const proceed = duplicateFile?.proceed;
          setDuplicateFile(null);
          proceed?.();
        }}
        onChooseAnother={() => {
          setDuplicateFile(null);
          onReopen?.();
        }}
      />

      <GorhomBottomSheet
        ref={sheetRef}
        isVisible={isVisible}
        onClose={onClose}
        snapPoints={["40%", "65%"]}
        closeButtonOffset="40%"
        backgroundStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: exactScale(12),
          borderTopRightRadius: exactScale(12),
        }}
      >
        <BeforeUploadSync onExpandChange={setShowBeforeUpload} />
        <BottomSheetScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={{
            paddingHorizontal: exactScale(16),
            paddingTop: exactScale(20),
            paddingBottom: adjustedBottom + exactScale(16),
          }}
        >
          {/* Top action cards */}
          <View className="flex-row" style={{ gap: exactScale(12) }}>
            <Touchable
              activeOpacity={0.85}
              onPress={handleUploadFile}
              style={{ borderColor: "#919EAB33", borderRadius: exactScale(8), paddingVertical: exactScale(20) }}
              className="flex-1 items-center border bg-white"
            >
              <View
                className="items-center justify-center"
                style={{ width: exactScale(64), height: exactScale(64), borderRadius: exactScale(32), marginBottom: exactScale(8), backgroundColor: "#E6F4EA" }}
              >
                <icons.upload_file width={exactScale(24)} height={exactScale(24)} />
              </View>
              <Text className="font-inter-medium text-brand-text" style={{ fontSize: moderateScale(13) }}>
                Upload Images
              </Text>
            </Touchable>

            <Touchable
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                setTimeout(handleTakePhoto, 400);
              }}
              style={{ borderColor: "#919EAB33", borderRadius: exactScale(8), paddingVertical: exactScale(20) }}
              className="flex-1 items-center border bg-white"
            >
              <View
                className="items-center justify-center"
                style={{ width: exactScale(64), height: exactScale(64), borderRadius: exactScale(32), marginBottom: exactScale(8), backgroundColor: "#E6F4EA" }}
              >
                <icons.photo_camera_green width={exactScale(24)} height={exactScale(24)} />
              </View>
              <Text className="font-inter-medium text-brand-text" style={{ fontSize: moderateScale(13) }}>
                Take a Photo
              </Text>
            </Touchable>

            <Touchable
              activeOpacity={0.85}
              onPress={handleUploadPdf}
              style={{ borderColor: "#919EAB33", borderRadius: exactScale(8), paddingVertical: exactScale(20) }}
              className="flex-1 items-center border bg-white"
            >
              <View
                className="items-center justify-center"
                style={{ width: exactScale(64), height: exactScale(64), borderRadius: exactScale(32), marginBottom: exactScale(8), backgroundColor: "#E6F4EA" }}
              >
                <icons.upload_pdf width={exactScale(24)} height={exactScale(24)} />
              </View>
              <Text className="font-inter-medium text-brand-text" style={{ fontSize: moderateScale(13) }}>
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
              borderRadius: exactScale(6),
              paddingHorizontal: exactScale(16),
              paddingVertical: exactScale(14),
              marginTop: exactScale(16),
            }}
            className="flex-row items-center"
          >
            <View
              className="items-center justify-center"
              style={{ width: exactScale(64), height: exactScale(64), borderRadius: exactScale(32), backgroundColor: "#E6F4EA" }}
            >
              <icons.prescription_green width={exactScale(24)} height={exactScale(24)} />
            </View>
            <View className="flex-1" style={{ marginLeft: exactScale(12) }}>
              <Text className="font-inter-medium text-[#0F2B22]" style={{ fontSize: moderateScale(14) }}>
                Select from My Prescriptions
              </Text>
              <Text
                style={{ color: colors.primary, fontSize: moderateScale(10), paddingHorizontal: exactScale(12), paddingVertical: exactScale(4), borderRadius: exactScale(8), marginTop: exactScale(4) }}
                className="self-start bg-[#F3FAF7] font-inter-semibold tracking-wider"
              >
                FASTER VERIFICATION
              </Text>
            </View>
            <icons.arrow_forward_ios width={exactScale(14)} height={exactScale(14)} fill="#9CA3AF" />
          </Touchable>

          {/* Before You Upload header */}
          <Touchable
            activeOpacity={0.8}
            onPress={handleToggleBeforeUpload}
            className="flex-row items-center"
            style={{ marginTop: exactScale(20) }}
          >
            <Text className="font-inter-semibold text-brand-text" style={{ fontSize: moderateScale(14) }}>
              Before You Upload
            </Text>
            <View
              style={{
                transform: [{ rotate: showBeforeUpload ? "0deg" : "-90deg" }],
                marginLeft: exactScale(6),
              }}
            >
              <icons.down_arrow width={exactScale(14)} height={exactScale(14)} fill="#1A1C1E" />
            </View>
          </Touchable>

          {showBeforeUpload && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(150)}
              style={{ borderColor: "#0F763522", borderRadius: exactScale(16), padding: exactScale(16), marginTop: exactScale(12) }}
              className="border"
            >
              <View className="flex-row">
                <View
                  className="items-center justify-center border border-[#919EAB33]"
                  style={{ width: exactScale(130), height: exactScale(130), borderRadius: exactScale(12), backgroundColor: "#F2FFFA" }}
                >
                  <Image
                    source={HOME_IMAGES.samplePrescription}
                    style={{ width: exactScale(120), height: exactScale(120) }}
                    contentFit="contain"
                  />
                </View>
                <View className="flex-1" style={{ marginLeft: exactScale(16) }}>
                  <Text className="font-inter-semibold text-brand-text" style={{ fontSize: moderateScale(14), marginBottom: exactScale(8) }}>
                    Valid prescription includes:
                  </Text>
                  {VALID_ITEMS.map((label, idx) => (
                    <View key={label} className="flex-row items-center" style={{ marginBottom: exactScale(6) }}>
                      <View
                        className="items-center justify-center"
                        style={{ width: exactScale(18), height: exactScale(18), borderRadius: exactScale(9), marginRight: exactScale(8), backgroundColor: "#0F7635" }}
                      >
                        <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(10) }}>
                          {idx + 1}
                        </Text>
                      </View>
                      <Text className="font-inter-medium text-brand-text" style={{ fontSize: moderateScale(12) }}>
                        {label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: "#0F763544",
                  borderStyle: "dotted",
                  marginTop: exactScale(12),
                  marginBottom: exactScale(12),
                }}
              />

              <Text className="font-inter text-brand-subtext" style={{ fontSize: moderateScale(12), marginBottom: exactScale(4) }}>
                File size should be less than 5 MB
              </Text>
              <Text className="font-inter text-brand-subtext" style={{ fontSize: moderateScale(12), marginBottom: exactScale(4) }}>
                Supported formats: PDF, JPG, JPEG, PNG
              </Text>
            </Animated.View>
          )}
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    </>
  );
};
