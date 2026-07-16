import React from "react";
import { Text, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

export const ComparisonTabHeader: React.FC = () => (
  <View
    style={{
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#E5E7EB",
      // Opaque so no sub-pixel seam lets the page background show as a hairline
      // against the white bar above.
      backgroundColor: "#fff",
    }}
  >
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text
        style={{
          fontSize: moderateScale(13),
          fontWeight: "500",
          color: "#6B7280",
        }}
      >
        Medicine in Prescription
      </Text>
    </View>
    <View
      style={{
        flex: 1,
        paddingVertical: 12,
        alignItems: "center",
        backgroundColor: "#E8F5EC",
      }}
    >
      <Text
        style={{
          fontSize: moderateScale(13),
          fontWeight: "600",
          color: "#0F7635",
        }}
      >
        Our Recommendation
      </Text>
    </View>
  </View>
);
