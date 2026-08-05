import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { CartDeliveringToProps } from "@/src/types/cart";
import React from "react";
import { Text, View } from "react-native";
import { cartStyles as s } from "../cart.styles";

export const CartDeliveringTo: React.FC<CartDeliveringToProps> = ({
  label,
  description,
  onChange,
  actionLabel = "Change",
  flat,
}) => {
  return (
    <View
      className={
        flat
          ? "bg-white px-4 py-4 flex-row items-center -mt-1.5"
          : "mx-4 mt-4 bg-white border border-[#919EAB33] rounded-[6px] px-4 py-4 flex-row items-center"
      }
    >
      <View
        style={[
          s.deliverIconBox,
          {
            borderRadius: 4,
            backgroundColor: "white",
            borderWidth: 1,
            borderColor: "#919EAB33",
            alignItems: "center",
            justifyContent: "center",
          },
        ]}
      >
        <icons.telegram width={20} height={20} fill="#0F7635" />
      </View>
      <View className="flex-1 ml-3.5">
        <Text style={s.deliverTitle} className="font-inter-bold text-[#000000]">
          Delivering to {label}
        </Text>
        <Text
          numberOfLines={1}
          style={s.deliverSub}
          className="font-inter-medium text-brand-subtext mt-0.5"
        >
          {description}
        </Text>
      </View>
      <Touchable
        onPress={onChange}
        className="flex-row items-center"
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
      >
        <Text
          style={s.deliverChange}
          className="font-inter-bold text-[#E16D09]"
        >
          {actionLabel}
        </Text>
      </Touchable>
    </View>
  );
};
