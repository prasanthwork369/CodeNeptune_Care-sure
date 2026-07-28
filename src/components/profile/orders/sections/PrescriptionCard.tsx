import { PrescriptionRejectedModal } from "@/src/components/prescription/history/sections/PrescriptionRejectedModal";
import { ReminderSheet } from "@/src/components/prescription/ReminderSheet";
import { formatReminderDateShort } from "@/src/utils/reminderDate";
import { CardOptionsMenu } from "@/src/components/ui/CardOptionsMenu";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useRefillReminder } from "@/src/hooks/useRefillReminder";
import { PrescriptionReminder } from "@/src/types/prescription";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Share, Text, View } from "react-native";
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { orderStyles as s } from "../orders.styles";

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
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [anim, value]);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 18],
  });
  return (
    <Touchable onPress={onToggle} activeOpacity={0.85}>
      <View
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          backgroundColor: value ? "#0F7635" : "#D1D5DB",
          justifyContent: "center",
          padding: 2,
        }}
      >
        <Animated.View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: "#FFFFFF",
            transform: [{ translateX }],
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.15,
            shadowRadius: 2,
            elevation: 2,
          }}
        />
      </View>
    </Touchable>
  );
};

const optionRowStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingHorizontal: 16,
  paddingVertical: 12,
};

const optionTextStyle = {
  fontSize: moderateScale(14),
  fontWeight: "500" as const,
  color: "#222222",
  marginLeft: 12,
};

export const PrescriptionCard = ({
  item,
  onDownloadPress,
}: {
  item: Prescription;
  onDownloadPress: (url: string, fileName: string) => void;
}) => {
  const router = useNav();
  // Server-backed refill reminder; undefined lets the hook fetch it when the
  // list response didn't include the reminder field.
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
        // Pass status and order ID so the prescription viewer knows if it is verified
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
  // Per-file reasons when OCR rejected it; otherwise a pharmacist's single note.
  const reasons = item.rejectionReasons?.length
    ? item.rejectionReasons
    : item.reviewNotes?.trim()
      ? [item.reviewNotes.trim()]
      : [];
  const showReason = item.status === "Rejected" && reasons.length > 0;

  return (
    <View
      className="bg-white mb-4 overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: "#DFE3E8",
        borderRadius: 12,
      }}
    >
      {/* Keep the status badge and overflow menu in their original top row. */}
      <View
        className="flex-row items-center justify-between"
        style={{ paddingHorizontal: 10, paddingTop: 12, paddingBottom: 4 }}
      >
        <View
          style={{
            backgroundColor: statusStyle.bg,
            borderRadius: 5,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(11),
              fontWeight: "600",
              color: statusStyle.text,
            }}
          >
            {item.status}
          </Text>
        </View>
        <Touchable
          activeOpacity={0.7}
          className="p-1"
          onPress={() => setShowOptions(true)}
        >
          <icons.ellipsis_vertical width={20} height={20} color="#6A6A6A" />
        </Touchable>
      </View>

      {/* Prescription icon and reference. */}
      <View
        className="flex-row items-center"
        style={{ paddingHorizontal: 10, paddingTop: 4, paddingBottom: 12 }}
      >
        <View
          className="w-10 h-10 items-center justify-center mr-3"
          style={{ backgroundColor: "#E8F6ED", borderRadius: 10 }}
        >
          <icons.note_book width={22} height={22} />
        </View>
        <View className="flex-1">
          <Text
            style={s.labelXl}
            className="font-inter-bold text-[#0F1724]"
            numberOfLines={1}
          >
            {item.rxId}
          </Text>
          {refill.isActive && refill.nextRemindDate && (
            <View className="mt-0.5">
              <ReminderText
                date={formatReminderDateShort(refill.nextRemindDate)}
              />
            </View>
          )}
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          paddingBottom: 16,
          gap: 16,
        }}
      >
        <View className="flex-row items-center">
          <icons.calendar_today width={17} height={17} fill="#6A6A6A" />
          <Text
            style={s.labelSm}
            className="font-inter-medium text-[#6A6A6A] ml-2.5"
          >
            {item.date}
          </Text>
        </View>
        {/* A rejected prescription was never read, so patient and doctor are
            always empty — the reason below is all there is to show. */}
        {!showReason && (
          <>
            <View className="flex-row items-center">
              <icons.person_outline width={17} height={17} fill="#6A6A6A" />
              <Text
                className="font-inter-medium ml-2.5"
                style={[
                  s.labelSm,
                  { color: item.patient ? "#6A6A6A" : "#C0C0C0" },
                ]}
              >
                {item.patient || "—"}
              </Text>
            </View>
            <View className="flex-row items-center">
              <icons.stethoscope width={16} height={16} fill="#6A6A6A" />
              <Text
                className="font-inter-medium ml-2.5"
                style={[
                  s.labelSm,
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
          style={{ paddingHorizontal: 10, paddingBottom: 16 }}
        >
          <Text
            className="font-inter-bold text-[#C22307]"
            style={{ fontSize: moderateScale(13), letterSpacing: 0.3 }}
          >
            CANCELLATION REASON
          </Text>
          <Text
            className="font-inter-medium text-[#222222] mt-1.5"
            style={{
              fontSize: moderateScale(14),
              lineHeight: moderateScale(20),
            }}
            // Full text lives in the modal so the card stays a fixed height.
            numberOfLines={2}
          >
            {reasons[0]}
          </Text>
          <Text
            className="font-inter-semibold text-[#C22307] mt-1.5"
            style={{ fontSize: moderateScale(12) }}
          >
            View More
          </Text>
        </Touchable>
      )}

      {/* Nothing to remind about or reorder once a prescription is rejected. */}
      {!showReason && (
        <>
          <View
            style={{
              height: 1,
              backgroundColor: "#E1E5E8",
              marginHorizontal: 10,
            }}
          />

          <View
            className="flex-row items-center justify-between"
            style={{ paddingHorizontal: 10, paddingVertical: 14 }}
          >
            <View className="flex-row items-center">
              <Toggle
                value={refill.isActive}
                onToggle={() => {
                  if (!refill.isActive) setShowReminder(true);
                  else refill.cancelReminder();
                }}
              />
              <Text
                style={s.labelMd}
                className="font-inter-semibold text-[#222222] ml-2.5"
              >
                Enable Reminder
              </Text>
            </View>
            <Touchable
              activeOpacity={0.85}
              className="bg-[#0F7635] px-5 py-2.5"
              disabled={!item.prescriptionOrderId}
              style={{
                opacity: item.prescriptionOrderId ? 1 : 0.4,
                borderRadius: 10,
              }}
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
              <Text style={s.labelSm} className="font-inter-semibold text-white">
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
          popoverStyle={{
            position: "absolute",
            top: 48,
            right: 8,
            width: 210,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "#919EAB33",
            zIndex: 10,
          }}
          items={[
            {
              key: "view",
              icon: <icons.eye width={20} height={20} fill="#6A6A6A" />,
              label: "View Prescription",
              rowStyle: { ...optionRowStyle, paddingVertical: 10 },
              textStyle: optionTextStyle,
              onPress: handleView,
            },
            {
              key: "download",
              icon: <icons.download_gray width={20} height={20} />,
              label: "Download",
              rowStyle: optionRowStyle,
              textStyle: optionTextStyle,
              onPress: handleDownload,
            },
            {
              key: "share",
              icon: <icons.share_gray width={20} height={20} />,
              label: "Share",
              rowStyle: optionRowStyle,
              textStyle: optionTextStyle,
              onPress: handleShare,
            },
          ]}
        />
      )}
    </View>
  );
};
