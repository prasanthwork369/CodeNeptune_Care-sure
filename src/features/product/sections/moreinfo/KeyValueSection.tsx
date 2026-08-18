import { KeyValueRow } from "@/src/features/product/types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

// Label/value rows on a warm tint, matching the web fact box.
export const KeyValueSection: React.FC<{ rows: KeyValueRow[] }> = ({
  rows,
}) => (
  <View>
    {rows.map((row, index) => (
      <View
        key={row.label}
        className="flex-row items-center justify-between bg-[#FDFBF6] rounded-[8px]"
        style={{
          padding: exactScale(14),
          marginTop: index === 0 ? 0 : exactScale(8),
        }}
      >
        <Text
          className="font-inter-medium text-[#6B7280]"
          style={{ fontSize: moderateScale(13), flex: 1 }}
        >
          {row.label}
        </Text>
        <Text
          className="font-inter-bold text-brand-text text-right"
          style={{ fontSize: moderateScale(13), flex: 1 }}
        >
          {row.value}
        </Text>
      </View>
    ))}
  </View>
);
