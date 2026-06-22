import { ReminderSheet } from "@/src/components/prescription/ReminderSheet";
import { RxOrdersSkeleton } from "@/src/components/profile/orders/PrescriptionSkeleton";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  PRESCRIPTION_STATUS,
  PRESCRIPTION_STATUS_LABELS,
} from "@/src/constants/prescription-status";
import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";
import { useNav } from "@/src/hooks/useNav";
import { downloadFile } from "@/src/utils/fileDownload";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, FlatList, Share, Text, View } from "react-native";
import Svg, {
  Defs,
  Stop,
  LinearGradient as SvgGradient,
  Text as SvgText,
} from "react-native-svg";
import { orderStyles as s } from "./orders.styles";

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

interface Prescription {
  id: string;
  rxId: string;
  prescriptionOrderId: string | null;
  status: string;
  date: string;
  patient: string;
  doctor: string;
  imageUrls: string[];
}

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

const OptionsPanel: React.FC<{
  onClose: () => void;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
  onDelete: () => void;
}> = ({ onClose, onView, onDownload, onShare, onDelete }) => (
  <>
    {/* invisible full-card tap-away */}
    <Touchable
      activeOpacity={1}
      onPress={onClose}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9,
      }}
    />
    {/* floating popover */}
    <View
      style={{
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
    >
      <Touchable
        activeOpacity={0.7}
        onPress={onView}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 10,
        }}
      >
        <icons.eye width={20} height={20} fill="#6A6A6A" />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#222222",
            marginLeft: 12,
          }}
        >
          View Prescription
        </Text>
      </Touchable>

      <Touchable
        activeOpacity={0.7}
        onPress={onDownload}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <icons.download_gray width={20} height={20} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#222222",
            marginLeft: 12,
          }}
        >
          Download
        </Text>
      </Touchable>

      <Touchable
        activeOpacity={0.7}
        onPress={onShare}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <icons.share_gray width={20} height={20} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#222222",
            marginLeft: 12,
          }}
        >
          Share
        </Text>
      </Touchable>

      <View style={{ height: 1, backgroundColor: "#F0F0F0" }} />

      <Touchable
        activeOpacity={0.7}
        onPress={onDelete}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <icons.delete_red width={20} height={20} />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: "#C22307",
            marginLeft: 12,
          }}
        >
          Delete
        </Text>
      </Touchable>
    </View>
  </>
);

const PrescriptionCard = ({
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
              fontSize: 11,
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
          <Ionicons name="ellipsis-vertical" size={20} color="#6A6A6A" />
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
        <OptionsPanel
          onClose={() => setShowOptions(false)}
          onView={handleView}
          onDownload={handleDownload}
          onShare={handleShare}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
};

export const RxOrdersLayout: React.FC = () => {
  const { prescriptions, loading, refreshing, refetch } = usePrescriptions({
    category: 2,
  });

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const mapItem = (item: any): Prescription => ({
    id: item.id,
    rxId: item.prescriptionOrderId ?? `#${item.id}`,
    prescriptionOrderId: item.prescriptionOrderId ?? null,
    status:
      PRESCRIPTION_STATUS_LABELS[
        item.status as keyof typeof PRESCRIPTION_STATUS_LABELS
      ] ?? PRESCRIPTION_STATUS_LABELS[PRESCRIPTION_STATUS.NEW],
    date: formatDate(item.createdAt),
    patient: [item.customer?.firstName, item.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim(),
    doctor: item.doctorName ?? "",
    imageUrls: item.imageUrls ?? [],
  });

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Prescriptions" backgroundColor="#FFFFFF" />
      {loading ? (
        <RxOrdersSkeleton />
      ) : (
        <FlatList
          data={prescriptions.map(mapItem)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PrescriptionCard
              item={item}
              onDownloadPress={(url, fileName) => downloadFile(url, fileName)}
            />
          )}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text
                style={s.labelMd}
                className="font-inter-medium text-[#6A6A6A]"
              >
                No prescriptions found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
