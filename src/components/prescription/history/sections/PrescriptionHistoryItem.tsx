import { useNav } from "@/src/hooks/useNav";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { icons } from "@/src/constants/icons";
import { PrescriptionHistoryItemProps } from "@/src/types/prescription";
import { moderateScale } from "@/src/utils/exactScale";

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
      className="mb-4 rounded-xl bg-white overflow-hidden"
      style={{
        borderWidth: 1.05,
        borderColor: "#919EAB33",
      }}
    >
      {/* Top row: edge-to-edge thumbnail on the left, ID/patient/status on the right */}
      <View className="flex-row items-stretch">
        {/* Left: grey block with image */}
        <View
          style={{
            width: 80,
            backgroundColor: "#F5F6FA",
            alignItems: "center",
            justifyContent: "center",
            borderRightWidth: 1,
            borderRightColor: "#919EAB1A",
          }}
        >
          {showImage ? (
            <Image
              source={imageSource}
              style={{
                width: 56,
                height: 56,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
              contentFit="cover"
            />
          ) : (
            <icons.pill_gray width={24} height={24} />
          )}
        </View>

        {/* Right: ID, Patient name, and Status */}
        <View className="flex-1 flex-row justify-between items-start" style={{ padding: 16 }}>
          <View className="flex-1 pr-2">
            <Text
              className="font-inter-bold text-[#222222]"
              style={{ fontSize: moderateScale(15) }}
              numberOfLines={1}
            >
              #{item.id}
            </Text>
            <Text
              className="font-inter-medium text-[#6A6A6A] mt-1"
              style={{ fontSize: moderateScale(13) }}
              numberOfLines={1}
            >
              {item.patientName}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <Text
              className={`${statusConfig.text} font-inter-semibold`}
              style={{ fontSize: moderateScale(12) }}
            >
              {item.status}
            </Text>
            <StatusIcon width={14} height={14} />
          </View>
        </View>
      </View>

      {/* Rest of the content wrapped in padding */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        {/* Status description */}
        {!!statusConfig.description && (
          <View className="flex-row items-center gap-2 mt-4">
            <View className="w-6 h-6 rounded bg-[#F4F6F8] items-center justify-center" style={{ borderRadius: 4 }}>
              <icons.pill_gray width={14} height={14} />
            </View>
            <Text className="font-inter-medium text-[#6A6A6A]" style={{ fontSize: moderateScale(13) }}>
              {statusConfig.description}
            </Text>
          </View>
        )}

        {/* Divider */}
        <View
          style={{
            marginVertical: 16,
            borderTopWidth: 1,
            borderColor: "#E5E7EB",
            borderStyle: "dashed",
          }}
        />

        {/* View prescription button */}
        <Touchable
          activeOpacity={0.8}
          onPress={handleView}
          className="flex-row items-center justify-center rounded-lg bg-[#F1FEF8] border border-[#E8F6ED] py-3"
        >
          <Text className="text-[#0F7635] font-inter-bold tracking-wider mr-1.5" style={{ fontSize: moderateScale(13) }}>
            VIEW PRESCRIPTION
          </Text>
          <icons.arrow_forward_green width={14} height={14} />
        </Touchable>

        {/* Uploaded date */}
        <Text className="pt-2 font-inter-medium text-[#6A6A6A] mt-2.5" style={{ fontSize: moderateScale(12) }}>
          Uploaded on {item.uploadedDate}
        </Text>
      </View>
    </View>
  );
};
