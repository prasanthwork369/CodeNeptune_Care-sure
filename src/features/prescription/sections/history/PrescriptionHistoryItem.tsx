import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { PrescriptionHistoryItemProps } from "@/src/features/prescription/types";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { PrescriptionRejectedModal } from "./PrescriptionRejectedModal";
import { styles as s } from "./history.styles";

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
    textColor: "#0F7635",
    icon: icons.check_circle,
    description: "Prescription verified",
  },
  Pending: {
    textColor: "#F26E01",
    icon: icons.hourglass_bottom,
    description: "Under pharmacist review",
  },
  Rejected: {
    textColor: "#C22307",
    icon: icons.cancel_circle,
    description: "Please re-upload a clearer image",
  },
} as const;

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? {
    textColor: "#4B5563",
    icon: icons.hourglass_bottom,
    description: "",
  };

export const PrescriptionHistoryItem = React.memo(function PrescriptionHistoryItem({
  item,
}: PrescriptionHistoryItemProps) {
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
        fromPreview: item.fromPreview,
        status: item.status,
        prescriptionOrderId: item.prescriptionOrderId ?? "",
      },
    });
  };

  return (
    <View style={s.cardRoot}>
      {/* Top row: thumbnail + id/patient + status */}
      <View style={s.topRow}>
        <View style={s.leftCol}>
          <View style={s.thumbnailBox}>
            {showImage ? (
              <Image
                source={imageSource}
                style={s.thumbImage}
                contentFit="cover"
              />
            ) : (
              <icons.pill_gray width={22} height={22} />
            )}
          </View>

          <View style={s.textCol}>
            <Text style={s.itemId} numberOfLines={1}>
              {item.id}
            </Text>
            <Text style={s.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>
          </View>
        </View>

        <View style={s.statusBadge}>
          <Text
            style={[
              s.statusText,
              { color: statusConfig.textColor },
            ]}
          >
            {item.status}
          </Text>
          <StatusIcon width={14} height={14} />
        </View>
      </View>

      {/* Status description */}
      {!!description && (
        <View
          style={[
            s.statusDescRow,
            { alignItems: canViewMore ? "flex-start" : "center" },
          ]}
        >
          <View style={s.pillIconBox}>
            <icons.pill_gray width={exactScale(14)} height={exactScale(14)} />
          </View>
          <Touchable
            style={s.descTouch}
            activeOpacity={canViewMore ? 0.6 : 1}
            disabled={!canViewMore}
            onPress={canViewMore ? () => setShowReasons(true) : undefined}
          >
            <Text
              style={s.descText}
              numberOfLines={isRejected ? 2 : undefined}
            >
              {description}
            </Text>
            {canViewMore && (
              <Text style={s.viewMoreLink}>
                View More
              </Text>
            )}
          </Touchable>
        </View>
      )}

      {/* Divider */}
      <View style={s.dashedDivider} />

      {/* View prescription button */}
      <Touchable
        activeOpacity={0.8}
        onPress={handleView}
        style={s.viewPrescriptionBtn}
      >
        <Text style={s.viewPrescriptionText}>
          VIEW PRESCRIPTION
        </Text>
        <icons.arrow_forward_green width={14} height={14} />
      </Touchable>

      {/* Uploaded date */}
      <Text style={s.uploadedDateText}>
        Uploaded on {item.uploadedDate}
      </Text>

      <PrescriptionRejectedModal
        visible={showReasons}
        onClose={() => setShowReasons(false)}
        reasons={reasons}
      />
    </View>
  );
});
