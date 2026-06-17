import React from "react";
import { Text, View } from "react-native";

export const ComparisonTabHeader: React.FC = () => (
  <View
    style={{
      flexDirection: "row",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: "#E5E7EB",
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
          fontSize: 13,
          fontFamily: "Inter-Medium",
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
          fontSize: 13,
          fontFamily: "Inter-SemiBold",
          color: "#0F7635",
        }}
      >
        Our Recommendation
      </Text>
    </View>
  </View>
);
