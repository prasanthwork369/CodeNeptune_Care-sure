import { HOME_IMAGES } from "@/src/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

interface SavingsBannerProps {
  amount: number;
}

export const SavingsBanner: React.FC<SavingsBannerProps> = ({ amount }) => (
  <LinearGradient
    colors={["#D0EBFE", "#D7FFEA"]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={{
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    }}
  >
    <Image
      source={HOME_IMAGES.discountTag}
      style={{ width: 32, height: 32 }}
      resizeMode="contain"
    />
    <Text
      style={{ fontSize: moderateScale(14), fontWeight: "600", color: "#0A0A0A" }}
    >
      {"You saved  "}
      <Text style={{ fontWeight: "800" }}>
        ₹{Number(amount).toFixed(0)}
      </Text>
      {" on this Order"}
    </Text>
  </LinearGradient>
);
