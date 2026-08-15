import React from "react";
import { View, Text } from "react-native";
import { RequiresPrescriptionWarningProps } from "@/src/features/prescription/types";
import { moderateScale } from "@/src/utils/exactScale";

const formatMedicineLabel = (label: string) =>
  label
    .replace(/\s*-\s*/g, " – ")
    .replace(/(\d)\s*(mcg|mg|ml|g)\b/gi, "$1 $2")
    .replace(
      /\b(\d+)\s+Tablets?\b/gi,
      (_, count: string) =>
        `${count} ${Number(count) === 1 ? "tablet" : "tablets"}`,
    )
    .replace(/\bInjection\b/g, "injection");

export const RequiresPrescriptionWarning: React.FC<
  RequiresPrescriptionWarningProps
> = ({ itemCount, items }) => {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#919EAB22",
        borderWidth: 1,
      }}
      className="p-3 rounded-md"
    >
      <View className="flex-row items-center mb-2">
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 10,
            backgroundColor: "#E56F07",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 8,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: moderateScale(12),
              fontWeight: "700",
              lineHeight: moderateScale(14),
            }}
          >
            i
          </Text>
        </View>
        <Text
          style={{ color: "#E56F07", fontSize: moderateScale(13) }}
          className="font-inter-bold"
        >
          {itemCount} {itemCount === 1 ? "item requires" : "items require"} a
          prescription
        </Text>
      </View>
      {items.map((item) => (
        <View key={item.id} className="flex-row items-start ml-1 mb-0.5">
          <Text
            style={{
              color: "#6A6A6A",
              marginRight: 6,
              lineHeight: moderateScale(18),
            }}
          >
            {"•"}
          </Text>
          <Text
            style={{
              color: "#6A6A6A",
              fontSize: moderateScale(12),
              lineHeight: moderateScale(18),
            }}
            className="font-inter-medium flex-1"
          >
            {formatMedicineLabel(String(item.medicineName ?? ""))}
          </Text>
        </View>
      ))}
    </View>
  );
};
