import React from "react";
import { View, Text } from "react-native";
import { RequiresPrescriptionWarningProps } from "@/src/features/prescription/types";
import { styles as s } from "./choose-method.styles";

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
    <View style={s.warningCard}>
      <View style={s.warningHeaderRow}>
        <View style={s.warningIconBox}>
          <Text style={s.warningIconText}>
            i
          </Text>
        </View>
        <Text style={s.warningHeaderText}>
          {itemCount} {itemCount === 1 ? "item requires" : "items require"} a
          prescription
        </Text>
      </View>
      {items.map((item) => (
        <View key={item.id} style={s.warningItemRow}>
          <Text style={s.warningBulletText}>
            {"•"}
          </Text>
          <Text style={s.warningItemName}>
            {formatMedicineLabel(String(item.medicineName ?? ""))}
          </Text>
        </View>
      ))}
    </View>
  );
};
