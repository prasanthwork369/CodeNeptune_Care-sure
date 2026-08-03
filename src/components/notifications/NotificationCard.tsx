import type { ImageSource } from "expo-image";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { icons } from "../../constants/icons";
import { styles as s } from "./notifications.styles";

interface NotificationCardProps {
  title: string;
  date: string;
  amount: string;
  iconType: "plus" | "coin_group";
  amountImage?: ImageSource;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  title,
  date,
  amount,
  iconType,
  amountImage,
}) => {
  const Icon = icons[iconType];

  return (
    <View className="bg-white rounded-2xl border border-[#919EAB33] p-4 mb-3">
      <View className="flex-row items-center">
        {/* Icon Circle */}
        <View
          style={[
            s.cardIconBox,
            {
              borderRadius: 999,
              backgroundColor: "#E9F6ED",
              alignItems: "center",
              justifyContent: "center",
              marginRight: exactScale(12),
            },
          ]}
        >
          <Icon
            width={s.cardIcon.width}
            height={s.cardIcon.height}
            fill="#0F7635"
          />
        </View>

        {/* Text Content */}
        <View className="flex-1">
          <Text
            style={s.cardTitle}
            className="font-inter-semibold text-brand-text mb-1"
          >
            {title}
          </Text>
          <Text style={s.cardDate} className="font-inter-medium text-[#6A6A6A]">
            {date}
          </Text>
        </View>

        {/* Right Amount Content */}
        <View className="flex-row items-center">
          {amountImage && (
            <Image
              source={amountImage}
              style={s.cardAmtImg}
              contentFit="contain"
            />
          )}
          <Text
            style={s.cardAmount}
            className={`font-inter-bold text-[#0F7635] ${amountImage ? "ml-1.5" : ""}`}
          >
            {amount}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default NotificationCard;
