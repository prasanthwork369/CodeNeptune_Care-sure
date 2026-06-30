import { HOME_IMAGES } from "@/src/constants/images";
import { CartSavingsBannerProps } from "@/src/types/cart";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

export const CartSavingsBanner: React.FC<CartSavingsBannerProps> = ({
  totalSavings,
}) => {
  if (totalSavings <= 0) return null;

  return (
    <LinearGradient
      colors={["#D0EBFE", "#D7FFEA"]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
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
        <Text className="font-inter-extrabold text-[#0A0A0A]">
          ₹{parseFloat(totalSavings.toFixed(2))}
        </Text>
        {" on this Order"}
      </Text>
    </LinearGradient>
  );
};
