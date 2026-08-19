import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

// Non-interactive verified badge indicator
export const VerifiedBadge: React.FC = () => (
  <View
    pointerEvents="none"
    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
  >
    <icons.check_circle width={16} height={16} fill={colors.primary} />
    <Text
      style={{
        fontSize: moderateScale(12),
        fontWeight: "600",
        color: colors.primary,
      }}
    >
      Verified
    </Text>
  </View>
);
