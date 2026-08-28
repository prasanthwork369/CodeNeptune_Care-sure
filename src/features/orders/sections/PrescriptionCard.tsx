import { PrescriptionRejectedModal } from "@/src/features/prescription/sections/history/PrescriptionRejectedModal";
import { ReminderSheet } from "@/src/features/prescription/components/ReminderSheet";
import { formatReminderDateShort } from "@/src/utils/reminderDate";
import { CardOptionsMenu } from "@/src/components/ui/CardOptionsMenu";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useRefillReminder } from "@/src/features/prescription/hooks/useRefillReminder";
import { PrescriptionReminder } from "@/src/features/prescription/types";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useState } from "react";
import { Alert, Share, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { orderStyles } from "../orders.styles";
import { styles as s } from "./PrescriptionCard.styles";

export interface Prescription {
  id: string;
  rxId: string;
  prescriptionOrderId: string | null;
  status: string;
  date: string;
  patient: string;
  doctor: string;
  imageUrls: string[];
  /** One reason per file when rejected; empty otherwise. */
  rejectionReasons?: string[];
  reviewNotes?: string | null;
  reminder?: PrescriptionReminder | null;
}

const ReminderText: React.FC<{ date: string }> = ({ date }) => {
  const text = `NEXT REMINDER: ${date.toUpperCase()}`;
  const width = Math.max(130, text.length * moderateScale(6.8));

  return (
    <Svg width={width} height={moderateScale(16)}>
      <Defs>
        <SvgGradient id="reminderGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#C92A2A" />
          <Stop offset="58%" stopColor="#E4471A" />
          <Stop offset="100%" stopColor="#F57C00" />
        </SvgGradient>
      </Defs>
      <SvgText
        x={0}
        y={moderateScale(12.5)}
        fill="url(#reminderGradient)"
        fontFamily="Inter"
        fontSize={moderateScale(11)}
        fontWeight="800"
        letterSpacing={0.35}
      >
        {text}
      </SvgText>
    </Svg>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case "Verified":
      return { bg: "#F1FEF8", text: "#0F7635" };
    case "Pending":
      return { bg: "#FFF3E6", text: "#F26E01" };
    case "Rejected":
      return { bg: "#FFF6F4", text: "#C22307" };
    default:
      return { bg: "#F3F4F6", text: "#6A6A6A" };
  }
};

const Toggle = ({
  value,
  onToggle,
}: {
  value: boolean;
  onToggle: () => void;
}) => {
  const offset = useSharedValue(value ? 18 : 0);

  useEffect(() => {
    offset.value = withSpring(value ? 18 : 0, {
      damping: 15,
      stiffness: 120,
    });
  }, [offset, value]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <Touchable onPress={onToggle} activeOpacity={0.85}>
      <View
        style={[
          s.toggleTrack,
          { backgroundColor: value ? "#0F7635" : "#D1D5DB" },
        ]}
      >
        <Animated.View
          style={[
            s.toggleThumb,
            thumbStyle,
          ]}
        />
      </View>
    </Touchable>
  );
};

export const PrescriptionCard = React.memo(function PrescriptionCard({
  item,
  onDownloadPress,
}: {
  item: Prescription;
  onDownloadPress: (url: string, fileName: string) => void;
}) {
  const router = useNav();
  const refill = useRefillReminder({
    prescriptionId: item.id,
    initialReminder: item.reminder,
  });
  const [showReminder, setShowReminder] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [showReasons, setShowReasons] = useState(false);

  const handleView = () => {
    setShowOptions(false);
    router.push({
      pathname: "/(prescription)/prescription-viewer",
      params: {
        prescriptionId: item.id,
        imageUrls: JSON.stringify(item.imageUrls),
        doctorName: item.doctor,
        patientName: item.patient,
        uploadedDate: item.date,
        source: "view_only",
        status: item.status,
        prescriptionOrderId: item.prescriptionOrderId ?? "",
      },
    });
  };

  const handleDownload = () => {
    setShowOptions(false);
    if (item.imageUrls && item.imageUrls.length > 0) {
      const sanitizedName = `prescription_${item.rxId.replace(/[^a-zA-Z0-9-_]/g, "_")}`;
      onDownloadPress(item.imageUrls[0], sanitizedName);
    } else {
      Alert.alert(
        "Download Error",
        "No file available to download for this prescription.",
      );
    }
  };

  const handleShare = async () => {
    setShowOptions(false);
    try {
      const url = item.imageUrls?.[0];
      if (!url) {
        Alert.alert(
          "Share Error",
          "No file available to share for this prescription.",
        );
        return;
      }
      await Share.share({ message: `Prescription ${item.rxId}\n${url}`, url });
    } catch {
      Alert.alert("Share Error", "Failed to share prescription.");
    }
  };

  const statusStyle = getStatusStyle(item.status);
  const reasons = item.rejectionReasons?.length
    ? item.rejectionReasons
    : item.reviewNotes?.trim()
      ? [item.reviewNotes.trim()]
      : [];
  const showReason = item.status === "Rejected" && reasons.length > 0;

  return (
    <View style={s.card}>
      {/* Top row: status badge and overflow menu */}
      <View style={s.headerRow}>
        <View
          style={[
            s.statusBadge,
            { backgroundColor: statusStyle.bg },
          ]}
        >
          <Text
            style={[
              s.statusText,
              { color: statusStyle.text },
            ]}
          >
            {item.status}
          </Text>
        </View>
        <Touchable
          activeOpacity={0.7}
          style={s.menuBtn}
          onPress={() => setShowOptions(true)}
        >
          <icons.ellipsis_vertical width={20} height={20} color="#6A6A6A" />
        </Touchable>
      </View>

      {/* Prescription icon and reference */}
      <View style={s.rxTitleRow}>
        <View style={s.rxIconBox}>
          <icons.note_book width={22} height={22} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={orderStyles.labelXl}
            numberOfLines={1}
          >
            {item.rxId}
          </Text>
          {refill.isActive && refill.nextRemindDate && (
            <View style={{ marginTop: 2 }}>
              <ReminderText
                date={formatReminderDateShort(refill.nextRemindDate)}
              />
            </View>
          )}
        </View>
      </View>

      <View style={s.rxDetailsList}>
        <View style={s.detailRow}>
          <icons.calendar_today width={17} height={17} fill="#6A6A6A" />
          <Text style={s.detailText}>
            {item.date}
          </Text>
        </View>
        {!showReason && (
          <>
            <View style={s.detailRow}>
              <icons.person_outline width={17} height={17} fill="#6A6A6A" />
              <Text
                style={[
                  s.detailText,
                  { color: item.patient ? "#6A6A6A" : "#C0C0C0" },
                ]}
              >
                {item.patient || "—"}
              </Text>
            </View>
            <View style={s.detailRow}>
              <icons.stethoscope width={16} height={16} fill="#6A6A6A" />
              <Text
                style={[
                  s.detailText,
                  { color: item.doctor ? "#6A6A6A" : "#C0C0C0" },
                ]}
              >
                {item.doctor || "—"}
              </Text>
            </View>
          </>
        )}
      </View>

      {showReason && (
        <Touchable
          activeOpacity={0.6}
          onPress={() => setShowReasons(true)}
          style={s.rejectionWrap}
        >
          <Text style={s.rejectionHeading}>
            CANCELLATION REASON
          </Text>
          <Text
            style={s.rejectionBody}
            numberOfLines={2}
          >
            {reasons[0]}
          </Text>
          <Text style={s.viewMoreText}>
            View More
          </Text>
        </Touchable>
      )}

      {!showReason && (
        <>
          <View style={s.divider} />
          <View style={s.footerRow}>
            <View style={s.enableReminderRow}>
              <Toggle
                value={refill.isActive}
                onToggle={() => {
                  if (!refill.isActive) setShowReminder(true);
                  else refill.cancelReminder();
                }}
              />
              <Text style={s.enableReminderText}>
                Enable Reminder
              </Text>
            </View>
            <Touchable
              activeOpacity={0.85}
              style={[
                s.reorderBtn,
                { opacity: item.prescriptionOrderId ? 1 : 0.4 },
              ]}
              disabled={!item.prescriptionOrderId}
              onPress={() => {
                if (item.prescriptionOrderId) {
                  router.push({
                    pathname: "/(prescription)/medicine-comparison",
                    params: {
                      prescriptionOrderId: item.prescriptionOrderId,
                      prescriptionId: item.id,
                    },
                  });
                }
              }}
            >
              <Text style={s.reorderBtnText}>
                Reorder
              </Text>
            </Touchable>
          </View>
        </>
      )}

      <ReminderSheet
        isVisible={showReminder}
        onClose={() => setShowReminder(false)}
        onConfirm={(input) => refill.setReminder(input)}
      />

      <PrescriptionRejectedModal
        visible={showReasons}
        onClose={() => setShowReasons(false)}
        reasons={reasons}
      />

      {showOptions && (
        <CardOptionsMenu
          onClose={() => setShowOptions(false)}
          backdropStyle={{ zIndex: 9 }}
          popoverStyle={s.popover}
          items={[
            {
              key: "view",
              icon: <icons.eye width={20} height={20} fill="#6A6A6A" />,
              label: "View Prescription",
              rowStyle: { ...s.optionRow, paddingVertical: 10 },
              textStyle: s.optionText,
              onPress: handleView,
            },
            {
              key: "download",
              icon: <icons.download_gray width={20} height={20} />,
              label: "Download",
              rowStyle: s.optionRow,
              textStyle: s.optionText,
              onPress: handleDownload,
            },
            {
              key: "share",
              icon: <icons.share_gray width={20} height={20} />,
              label: "Share",
              rowStyle: s.optionRow,
              textStyle: s.optionText,
              onPress: handleShare,
            },
          ]}
        />
      )}
    </View>
  );
});
PrescriptionCard.displayName = "PrescriptionCard";
