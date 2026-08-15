import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { PrescriptionHistoryItemProps } from "@/src/features/prescription/types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { PrescriptionRejectedModal } from "./PrescriptionRejectedModal";

// Normally the page-URL array, but older records can carry a bare string.
type HistoryImage = string[] | string | null | undefined;

const firstUrl = (image: HistoryImage): string | undefined =>
  (typeof image === "string" ? image : image?.[0]) || undefined;

const resolveImageSource = (image: HistoryImage) => {
  const uri = firstUrl(image);
  return uri ? { uri } : undefined;
};

const isPdf = (image: HistoryImage): boolean =>
  firstUrl(image)?.toLowerCase().endsWith(".pdf") ?? false;

const hasImage = (image: HistoryImage): boolean => !!firstUrl(image);

const STATUS_CONFIG = {
  Verified: {
    text: "text-[#0F7635]",
    icon: icons.check_circle,
    description: "Prescription verified",
  },
  Pending: {
    text: "text-[#F26E01]",
    icon: icons.hourglass_bottom,
    description: "Under pharmacist review",
  },
  Rejected: {
    text: "text-[#C22307]",
    icon: icons.cancel_circle,
    description: "Please re-upload a clearer image",
  },
} as const;

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    text: "text-gray-600",
    icon: icons.hourglass_bottom,
    description: "",
  };

export const PrescriptionHistoryItem: React.FC<
  PrescriptionHistoryItemProps
> = ({ item }) => {
  const router = useNav();
  const [showReasons, setShowReasons] = useState(false);
  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;
  const imageSource = resolveImageSource(item.image);
  const pdf = isPdf(item.image);
  const showImage = hasImage(item.image) && !pdf;

  const isRejected = item.status === "Rejected";
  // Per-file reasons when OCR rejected it; otherwise a pharmacist's single note.
  const reasons = item.rejectionReasons?.length
    ? item.rejectionReasons
    : item.reviewNotes?.trim()
      ? [item.reviewNotes.trim()]
      : [];
  // Prefer the real reason from the reviewer/OCR over the generic fallback.
  const description = (isRejected && reasons[0]) || statusConfig.description;
  const canViewMore = isRejected && reasons.length > 0;

  const handleView = () => {
    router.push({
      pathname: "/(prescription)/prescription-viewer",
      params: {
        prescriptionId: item.rawId,
        imageUrls: JSON.stringify(
          Array.isArray(item.image) ? item.image : [item.image],
        ),
        doctorName: item.doctorName,
        patientName: item.patientName,
        uploadedDate: item.uploadedDate,
        source: item.source,
        toPay: item.toPay,
        // Pass status and order ID to the viewer page so it can show the verified banner
        status: item.status,
        prescriptionOrderId: item.prescriptionOrderId ?? "",
      },
    });
  };

  return (
    <View
      className="mb-4 rounded-xl bg-white p-4"
      style={{
        borderWidth: 1.05,
        borderColor: "#919EAB33",
      }}
    >
      {/* Top row: thumbnail + id/patient + status */}
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-start flex-1">
          <View className="w-14 h-14 rounded-sm border border-[#919EAB1A] bg-[#F1F0F5] items-center justify-center overflow-hidden mr-3">
            {showImage ? (
              <Image
                source={imageSource}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
              />
            ) : (
              <icons.pill_gray width={22} height={22} />
            )}
          </View>

          <View className="flex-1">
            <Text
              className="font-inter-bold text-[#222222]"
              style={{ fontSize: moderateScale(15) }}
              numberOfLines={1}
            >
              {item.id}
            </Text>
            <Text
              className="font-inter-medium text-[#6A6A6A] mt-0.5"
              style={{ fontSize: moderateScale(13) }}
              numberOfLines={1}
            >
              {item.patientName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 ml-2">
          <Text
            className={`${statusConfig.text} font-inter-semibold`}
            style={{ fontSize: moderateScale(12) }}
          >
            {item.status}
          </Text>
          <StatusIcon width={14} height={14} />
        </View>
      </View>

      {/* Status description */}
      {!!description && (
        <View
          // Rejected shows wrapped text plus a link, so it aligns to the top;
          // the single-line statuses sit centred against the icon.
          className={`flex-row mt-4 ${canViewMore ? "items-start" : "items-center"}`}
          style={{ gap: exactScale(10) }}
        >
          <View
            className="items-center justify-center"
            style={{
              width: exactScale(24),
              height: exactScale(24),
              borderRadius: exactScale(4),
              backgroundColor: "#F1F0F5",
              padding: exactScale(4),
            }}
          >
            <icons.pill_gray width={exactScale(14)} height={exactScale(14)} />
          </View>
          {/* The reason text and the link both open the modal. */}
          <Touchable
            className="flex-1"
            activeOpacity={canViewMore ? 0.6 : 1}
            disabled={!canViewMore}
            onPress={canViewMore ? () => setShowReasons(true) : undefined}
          >
            <Text
              className="font-inter-medium text-[#4A4A4A]"
              style={{
                fontSize: moderateScale(13),
                lineHeight: moderateScale(16),
              }}
              // Reasons can be long; the full text lives in the modal.
              numberOfLines={isRejected ? 2 : undefined}
            >
              {description}
            </Text>
            {canViewMore && (
              <Text
                className="font-inter-semibold text-[#C22307]"
                style={{
                  fontSize: moderateScale(12),
                  marginTop: exactScale(4),
                }}
              >
                View More
              </Text>
            )}
          </Touchable>
        </View>
      )}

      {/* Divider */}
      <View
        style={{
          marginVertical: exactScale(20),
          borderTopWidth: 1,
          borderColor: "#E5E7EB",
          borderStyle: "dashed",
        }}
      />

      {/* View prescription button */}
      <Touchable
        activeOpacity={0.8}
        onPress={handleView}
        className="flex-row items-center justify-center py-3.5"
        style={{
          backgroundColor: "#F1FEF8",
          borderWidth: 1,
          borderColor: "#0F763522",
          borderRadius: exactScale(14),
        }}
      >
        <Text
          className="text-[#0F7635] font-inter-bold tracking-wider mr-1.5"
          style={{ fontSize: moderateScale(13) }}
        >
          VIEW PRESCRIPTION
        </Text>
        <icons.arrow_forward_green width={14} height={14} />
      </Touchable>

      {/* Uploaded date */}
      <Text
        className="pt-2 font-inter-medium text-[#6A6A6A] mt-2.5"
        style={{ fontSize: moderateScale(12) }}
      >
        Uploaded on {item.uploadedDate}
      </Text>

      <PrescriptionRejectedModal
        visible={showReasons}
        onClose={() => setShowReasons(false)}
        reasons={reasons}
      />
    </View>
  );
};
