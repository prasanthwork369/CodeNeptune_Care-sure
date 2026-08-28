import { HOME_IMAGES } from "@/src/constants/images";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text } from "react-native";
import { styles as s } from "./medicine-comparison.styles";

interface SavingsBannerProps {
  amount: number;
}

export const SavingsBanner: React.FC<SavingsBannerProps> = ({ amount }) => (
  <LinearGradient
    colors={["#D0EBFE", "#D7FFEA"]}
    start={{ x: 0, y: 0.5 }}
    end={{ x: 1, y: 0.5 }}
    style={s.savingsBannerGradient}
  >
    <Image
      source={HOME_IMAGES.discountTag}
      style={s.savingsTagIcon}
      resizeMode="contain"
    />
    <Text style={s.savingsText}>
      {"You saved  "}
      <Text style={s.savingsAmountBold}>₹{Number(amount).toFixed(0)}</Text>
      {" on this Order"}
    </Text>
  </LinearGradient>
);
