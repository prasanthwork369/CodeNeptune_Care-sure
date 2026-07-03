import { ReminderSheet } from "@/src/components/prescription/ReminderSheet";
import { CardOptionsMenu } from "@/src/components/ui/CardOptionsMenu";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, Share, Text, View } from "react-native";
import Svg, {
  Defs,
  Stop,
  LinearGradient as SvgGradient,
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
}

const GradientText: React.FC<{ text: string }> = ({ text }) => {
  const width = text.length * 7;
  return (
    <Svg height={16} width={width}>
      <Defs>
        <SvgGradient id="rg" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#C22923" />
          <Stop offset="1" stopColor="#FF8A00" />
        </SvgGradient>
      </Defs>
      <SvgText
        fill="url(#rg)"
        stroke="url(#rg)"
        strokeWidth={0.3}
        fontWeight="700"
        x={0}
        y={12}
      >
        {text}
      </SvgText>
    </Svg>
  );
};

const formatReminderDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `NEXT REMINDER: ${day} ${months[date.getMonth()]}`;
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
  }, [value]);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });
  return (
    <Touchable onPress={onToggle} activeOpacity={0.85}>
      <View
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
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
  const [reminder, setReminder] = useState(false);
  const [reminderDate, setReminderDate] = useState<Date | null>(null);
  const [showReminder, setShowReminder] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

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

  const handleDelete = () => {
    setShowOptions(false);
    Alert.alert(
      "Delete Prescription",
      "Are you sure you want to delete this prescription?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {} },
      ],
    );
  };

  const statusStyle = getStatusStyle(item.status);

  return (
    <View
      className="bg-white rounded-lg mb-4 p-2"
      style={{ borderWidth: 1, borderColor: "#919EAB33" }}
    >
      {/* Top row: status badge (left) + three dots (right) */}
      <View className="flex-row items-center justify-between px-3 pt-3 pb-1">
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

      {/* Icon + RxId row */}
      <View className="flex-row items-center px-4 pt-2 ">
        <View
          className="w-10 h-10 rounded-sm items-center justify-center mr-3"
          style={{ backgroundColor: "#E8F6ED" }}
        >
          <icons.note_book width={22} height={22} />
        </View>
        <View className="flex-1 py-1">
          <Text
            style={s.labelXl}
            className="font-inter-bold text-[#0F1724]"
            numberOfLines={1}
          >
            {item.rxId}
          </Text>
          {reminder && reminderDate && (
            <View className="mt-0.5">
              <GradientText text={formatReminderDate(reminderDate)} />
            </View>
          )}
        </View>
      </View>

      <View className="px-4 pb-4 gap-y-1 py-2">
        <View className="flex-row items-center">
          <icons.calendar_today width={17} height={17} fill="#6A6A6A" />
          <Text
            style={s.labelSm}
            className="font-inter-medium text-[#6A6A6A] ml-2.5"
          >
            {item.date}
          </Text>
        </View>
        <View className="flex-row items-center py-2">
          <icons.person_outline width={17} height={17} fill="#6A6A6A" />
          <Text
            className="font-inter-medium ml-2.5"
            style={[s.labelSm, { color: item.patient ? "#6A6A6A" : "#C0C0C0" }]}
          >
            {item.patient || "—"}
          </Text>
        </View>
        <View className="flex-row items-center">
          <icons.stethoscope width={16} height={16} fill="#6A6A6A" />
          <Text
            className="font-inter-medium ml-2.5"
            style={[s.labelSm, { color: item.doctor ? "#6A6A6A" : "#C0C0C0" }]}
          >
            {item.doctor || "—"}
          </Text>
        </View>
      </View>

      <View className="h-px bg-[#919EAB33] mx-4" />

      <View className="flex-row items-center justify-between px-4 py-3.5">
        <View className="flex-row items-center">
          <Toggle
            value={reminder}
            onToggle={() => {
              if (!reminder) setShowReminder(true);
              else setReminder(false);
            }}
          />
          <Text
            style={s.labelMd}
            className="font-inter-semibold text-[#222222] ml-3"
          >
            Enable Reminder
          </Text>
        </View>
        <Touchable
          activeOpacity={0.85}
          className="bg-[#0F7635] rounded-md px-5 py-2.5"
          disabled={!item.prescriptionOrderId}
          style={{ opacity: item.prescriptionOrderId ? 1 : 0.4 }}
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

      <ReminderSheet
        isVisible={showReminder}
        onClose={() => setShowReminder(false)}
        onConfirm={(date) => {
          setReminderDate(date);
          setReminder(true);
        }}
      />

      {showOptions && (
        <CardOptionsMenu
          onClose={() => setShowOptions(false)}
          backdropStyle={{ zIndex: 9 }}
          popoverStyle={{
            position: "absolute",
            top: 64,
            right: 8,
            width: 210,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            zIndex: 10,
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 8,
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
            {
              key: "delete",
              icon: <icons.delete_red width={20} height={20} />,
              label: "Delete",
              rowStyle: optionRowStyle,
              textStyle: { ...optionTextStyle, color: "#C22307" },
              dividerStyle: { height: 1, backgroundColor: "#F0F0F0" },
              onPress: handleDelete,
            },
          ]}
        />
      )}
    </View>
  );
};
