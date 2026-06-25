import { useNav } from "@/src/hooks/useNav";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Image, Text, View } from "react-native";
import { icons } from "@/src/constants/icons";
import { PrescriptionHistoryItemProps } from "@/src/types/prescription";

const resolveImageSource = (image: any) => {
  if (typeof image === "string") return { uri: image };
  if (Array.isArray(image) && image.length > 0) return { uri: image[0] };
  return image;
};

const isPdf = (image: any): boolean => {
  if (typeof image === "string") return image.toLowerCase().endsWith(".pdf");
  if (Array.isArray(image) && image.length > 0)
    return image[0].toLowerCase().endsWith(".pdf");
  return false;
};

const hasImage = (image: any): boolean => {
  if (typeof image === "string") return image.length > 0;
  if (Array.isArray(image)) return image.length > 0;
  return false;
};

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
  const statusConfig = getStatusConfig(item.status);
  const StatusIcon = statusConfig.icon;
  const imageSource = resolveImageSource(item.image);
  const pdf = isPdf(item.image);
  const showImage = hasImage(item.image) && !pdf;

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
          <View className="w-14 h-14 rounded-sm border border-[#919EAB1A] bg-[#F5F6FA] items-center justify-center overflow-hidden mr-3">
            {showImage ? (
              <Image
                source={imageSource}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <icons.pill_gray width={22} height={22} />
            )}
          </View>

          <View className="flex-1">
            <Text
              className="text-[15px] font-inter-bold text-[#222222]"
              numberOfLines={1}
            >
              #{item.id}
            </Text>
            <Text
              className="text-[13px] font-inter-medium text-[#6A6A6A] mt-0.5"
              numberOfLines={1}
            >
              {item.patientName}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 ml-2">
          <Text
            className={`${statusConfig.text} text-[12px] font-inter-semibold`}
          >
            {item.status}
          </Text>
          <StatusIcon width={14} height={14} />
        </View>
      </View>

      {/* Status description */}
      {!!statusConfig.description && (
        <View className="flex-row items-center gap-2 mt-3">
          <View className="w-4 h-4 rounded-sm bg-[#D9D9D9] items-center justify-center">
            <icons.pill_gray width={12} height={12} />
          </View>
          <Text className="text-[13px] font-inter-medium text-[#6A6A6A]">
            {statusConfig.description}
          </Text>
        </View>
      )}

      {/* Divider */}
      <View
        style={{
          marginVertical: 20,
          borderTopWidth: 1,
          borderColor: "#E5E7EB",
          borderStyle: "dashed",
        }}
      />

      {/* View prescription button */}
      <Touchable
        activeOpacity={0.8}
        onPress={handleView}
        className="flex-row items-center justify-center rounded-lg bg-[#F1FEF8] border border-[#919EAB33] py-3"
      >
        <Text className="text-[#0F7635] text-[13px] font-inter-bold tracking-wider mr-1.5">
          VIEW PRESCRIPTION
        </Text>
        <icons.arrow_forward_green width={14} height={14} />
      </Touchable>

      {/* Uploaded date */}
      <Text className="text-[12px] pt-2 font-inter-medium text-[#6A6A6A] mt-2.5">
        Uploaded on {item.uploadedDate}
      </Text>
    </View>
  );
};
