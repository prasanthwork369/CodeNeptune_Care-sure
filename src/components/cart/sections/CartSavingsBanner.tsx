import { HOME_IMAGES } from "@/src/constants/images";
import { OfferShine } from "@/src/components/ui/offerShine";
import { CartSavingsBannerProps } from "@/src/types/cart";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

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
        justifyContent: "center",
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(12),
        gap: exactScale(10),
        overflow: "hidden",
      }}
      accessible
      accessibilityRole="summary"
      accessibilityLabel={`You saved ₹${Number(totalSavings).toFixed(2)} on this order`}
    >
      <Image
        source={HOME_IMAGES.discountTag}
        style={{ width: exactScale(32), height: exactScale(32) }}
        contentFit="contain"
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
      <OfferShine />
    </LinearGradient>
  );
};
