import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

// Tinted callout box with orange dots, matching the web side-effects card.
export const BulletListSection: React.FC<{ points: string[] }> = ({
  points,
}) => (
  <View
    className="bg-[#FFFAF0] border border-[#FFEDD5] rounded-[12px]"
    style={{ padding: exactScale(16) }}
  >
    {points.map((point, index) => (
      <View
        key={`${point}-${index}`}
        className="flex-row items-start"
        style={{ marginTop: index === 0 ? 0 : exactScale(8) }}
      >
        <View
          className="rounded-full bg-[#FB923C]"
          style={{
            width: exactScale(6),
            height: exactScale(6),
            marginTop: exactScale(6),
            marginRight: exactScale(10),
          }}
        />
        <Text
          className="flex-1 font-inter-medium text-[#6B7280]"
          style={{
            fontSize: moderateScale(13),
            lineHeight: moderateScale(19),
          }}
        >
          {point}
        </Text>
      </View>
    ))}
  </View>
);
