import {
  DuplicateFileModal,
  FileTooLargeModal,
  InfoModal,
} from "@/src/components/prescription/preview/sections";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { usePrescriptionPicker } from "@/src/hooks/ui/usePrescriptionPicker";
import { useNav } from "@/src/hooks/useNav";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import React, { useEffect, useState } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { maxSizeLabel, validityLabel } = useUploadConfig();
  const [duplicateFile, setDuplicateFile] = useState<{
    name: string;
    size?: number;
    proceed: () => void;
  } | null>(null);
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
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Every pixel the sheet is allowed to use: everything down from just under
  // the status bar. Derived rather than a flat percentage so a short screen, or
  // one whose 3-button nav bar eats height, still gets the full room available
  // and can show "Before You Upload" outright instead of falling back to a
  // scroll. The sheet only grows this far when the content actually needs it.
  const maxSheetHeight = screenHeight - insets.top - exactScale(12);

  // Toggling the section changes the content height, and the sheet resizes to
  // match — so there is no snap point to drive here any more.
  const handleToggleBeforeUpload = () => setShowBeforeUpload((v) => !v);

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
        maxSizeLabel={maxSizeLabel}
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

      {/* Content-sized, not percentage-sized. The content is laid out in fixed
          Figma pixels, so a "65%" snap point resolves to fewer pixels than it
          needs on a short device and clips the bottom of "Before You Upload".
          Sizing to the content instead fits every screen, and the sheet grows
          on its own when the section expands. */}
      <GorhomBottomSheet
        isVisible={isVisible}
        onClose={onClose}
        maxDynamicContentSize={maxSheetHeight}
        backgroundStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: exactScale(12),
          borderTopRightRadius: exactScale(12),
        }}
      >
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
          <View className="flex-row" style={{ gap: exactScale(8) }}>
            <Touchable
              activeOpacity={0.85}
              onPress={handleUploadFile}
              accessibilityRole="button"
              accessibilityLabel="Upload image"
              style={{
                borderColor: "#919EAB33",
                borderRadius: exactScale(8),
                minHeight: exactScale(96),
                paddingVertical: exactScale(8),
              }}
              className="flex-1 items-center justify-center border bg-white"
            >
              <View
                className="items-center justify-center"
                style={{
                  width: exactScale(48),
                  height: exactScale(48),
                  borderRadius: exactScale(24),
                  marginBottom: exactScale(8),
                  backgroundColor: "#E6F4EA",
                }}
              >
                <icons.upload_file
                  width={exactScale(24)}
                  height={exactScale(24)}
                />
              </View>
              <Text
                className="font-inter-medium text-brand-text"
                style={{
                  fontSize: moderateScale(14),
                  lineHeight: moderateScale(20),
                }}
              >
                Upload Image
              </Text>
            </Touchable>

            <Touchable
              activeOpacity={0.85}
              onPress={() => {
                onClose();
                setTimeout(handleTakePhoto, 400);
              }}
              accessibilityRole="button"
              accessibilityLabel="Take a photo"
              style={{
                borderColor: "#919EAB33",
                borderRadius: exactScale(8),
                minHeight: exactScale(96),
                paddingVertical: exactScale(8),
              }}
              className="flex-1 items-center justify-center border bg-white"
            >
              <View
                className="items-center justify-center"
                style={{
                  width: exactScale(48),
                  height: exactScale(48),
                  borderRadius: exactScale(24),
                  marginBottom: exactScale(8),
                  backgroundColor: "#E6F4EA",
                }}
              >
                <icons.photo_camera_green
                  width={exactScale(24)}
                  height={exactScale(24)}
                />
              </View>
              <Text
                className="font-inter-medium text-brand-text"
                style={{
                  fontSize: moderateScale(14),
                  lineHeight: moderateScale(20),
                }}
              >
                Take a Photo
              </Text>
            </Touchable>

            <Touchable
              activeOpacity={0.85}
              onPress={handleUploadPdf}
              accessibilityRole="button"
              accessibilityLabel="Upload PDF"
              style={{
                borderColor: "#919EAB33",
                borderRadius: exactScale(8),
                minHeight: exactScale(96),
                paddingVertical: exactScale(8),
              }}
              className="flex-1 items-center justify-center border bg-white"
            >
              <View
                className="items-center justify-center"
                style={{
                  width: exactScale(48),
                  height: exactScale(48),
                  borderRadius: exactScale(24),
                  marginBottom: exactScale(8),
                  backgroundColor: "#E6F4EA",
                }}
              >
                <icons.upload_pdf
                  width={exactScale(24)}
                  height={exactScale(24)}
                />
              </View>
              <Text
                className="font-inter-medium text-brand-text"
                style={{
                  fontSize: moderateScale(14),
                  lineHeight: moderateScale(20),
                }}
              >
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
            accessibilityRole="button"
            accessibilityLabel="Select from My Prescriptions, faster verification"
            style={{
              borderWidth: 1,
              borderColor: "#00000014",
              backgroundColor: "#FFFFFF",
              borderRadius: exactScale(8),
              paddingHorizontal: exactScale(16),
              paddingVertical: exactScale(16),
              marginTop: exactScale(16),
            }}
            className="flex-row items-center"
          >
            <View
              className="items-center justify-center"
              style={{
                width: exactScale(48),
                height: exactScale(48),
                borderRadius: exactScale(24),
                backgroundColor: "#E6F4EA",
              }}
            >
              <icons.prescription_green
                width={exactScale(24)}
                height={exactScale(24)}
              />
            </View>
            <View className="flex-1" style={{ marginLeft: exactScale(12) }}>
              <Text
                className="font-inter-medium text-[#0F2B22]"
                style={{
                  fontSize: moderateScale(15),
                  lineHeight: moderateScale(22),
                }}
              >
                Select from My Prescriptions
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: moderateScale(10),
                  paddingHorizontal: exactScale(12),
                  paddingVertical: exactScale(4),
                  borderRadius: exactScale(8),
                  marginTop: exactScale(4),
                }}
                className="self-start bg-[#F3FAF7] font-inter-semibold tracking-wider"
              >
                FASTER VERIFICATION
              </Text>
            </View>
            <icons.arrow_forward_ios
              width={exactScale(14)}
              height={exactScale(14)}
              fill="#9CA3AF"
            />
          </Touchable>

          {/* Before You Upload header */}
          <Touchable
            activeOpacity={0.8}
            onPress={handleToggleBeforeUpload}
            accessibilityRole="button"
            accessibilityLabel="Before You Upload"
            accessibilityState={{ expanded: showBeforeUpload }}
            className="flex-row items-center"
            style={{
              minHeight: exactScale(48),
              marginTop: exactScale(16),
            }}
          >
            <Text
              className="font-inter-semibold text-brand-text"
              style={{
                fontSize: moderateScale(16),
                lineHeight: moderateScale(24),
              }}
            >
              Before You Upload
            </Text>
            <View
              style={{
                transform: [{ rotate: showBeforeUpload ? "0deg" : "-90deg" }],
                marginLeft: exactScale(6),
              }}
            >
              <icons.down_arrow
                width={exactScale(14)}
                height={exactScale(14)}
                fill="#1A1C1E"
              />
            </View>
          </Touchable>

          {showBeforeUpload && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={{
                borderColor: "#0F763522",
                borderRadius: exactScale(16),
                padding: exactScale(16),
                marginTop: exactScale(12),
              }}
              className="border"
            >
              <View className="flex-row">
                <View
                  className="items-center justify-center border border-[#919EAB33]"
                  style={{
                    width: exactScale(130),
                    height: exactScale(130),
                    borderRadius: exactScale(12),
                    backgroundColor: "#F2FFFA",
                  }}
                >
                  <Image
                    source={HOME_IMAGES.samplePrescription}
                    style={{ width: exactScale(120), height: exactScale(120) }}
                    contentFit="contain"
                  />
                </View>
                <View className="flex-1" style={{ marginLeft: exactScale(16) }}>
                  <Text
                    className="font-inter-semibold text-brand-text"
                    style={{
                      fontSize: moderateScale(14),
                      marginBottom: exactScale(8),
                    }}
                  >
                    Valid prescription includes:
                  </Text>
                  {VALID_ITEMS.map((label, idx) => (
                    <View
                      key={label}
                      className="flex-row items-center"
                      style={{ marginBottom: exactScale(6) }}
                    >
                      <View
                        className="items-center justify-center"
                        style={{
                          width: exactScale(18),
                          height: exactScale(18),
                          borderRadius: exactScale(9),
                          marginRight: exactScale(8),
                          backgroundColor: "#0F7635",
                        }}
                      >
                        <Text
                          className="font-inter-bold text-white"
                          style={{ fontSize: moderateScale(10) }}
                        >
                          {idx + 1}
                        </Text>
                      </View>
                      <Text
                        className="font-inter-medium text-brand-text"
                        style={{ fontSize: moderateScale(12) }}
                      >
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

              {/* Same three rules the web shows, from the same backend config. */}
              <Text
                className="font-inter text-brand-subtext"
                style={{
                  fontSize: moderateScale(12),
                  marginBottom: exactScale(4),
                }}
              >
                File size should be less than {maxSizeLabel}
              </Text>
              <Text
                className="font-inter text-brand-subtext"
                style={{
                  fontSize: moderateScale(12),
                  marginBottom: exactScale(4),
                }}
              >
                Supported formats: PDF, JPG, JPEG, PNG
              </Text>
              <Text
                className="font-inter text-brand-subtext"
                style={{
                  fontSize: moderateScale(12),
                  marginBottom: exactScale(4),
                }}
              >
                Prescription should be less than {validityLabel} old
              </Text>
            </Animated.View>
          )}
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    </>
  );
};
