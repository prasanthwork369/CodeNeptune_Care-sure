import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";

const BADGE_ICON_BG = ["#FDF5FF", "#FFF8EC", "#E9F5FF"];

// Badge icons are always remote URLs from the CMS -- no local fallback.
export const BadgeIcon = ({ icon }: { icon: string }) => (
  <Image
    source={{ uri: icon }}
    style={{ width: exactScale(16), height: exactScale(16) }}
    resizeMode="contain"
  />
);

export const BenefitBadges = ({
  badges,
  colors = ["#FDF5FF", "#F3F9FF"],
}: {
  badges: { icon: React.ReactNode; label: string; description: string }[];
  colors?: [string, string, ...string[]];
}) => (
  <LinearGradient
    colors={colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{
      borderRadius: exactScale(8),
      marginTop: exactScale(2),
      borderWidth: 1,
      borderColor: "#919EAB33",
    }}
  >
    <View
      className="flex-row items-center"
      style={{
        paddingVertical: exactScale(10),
        paddingHorizontal: exactScale(8),
      }}
    >
      {badges.map((badge, index, arr) => (
        <React.Fragment key={index}>
          <View className="flex-1 items-center">
            <View
              style={{
                width: exactScale(28),
                height: exactScale(28),
                borderRadius: exactScale(10),
                backgroundColor: BADGE_ICON_BG[index % BADGE_ICON_BG.length],
                alignItems: "center",
                justifyContent: "center",
                marginBottom: exactScale(4),
              }}
            >
              {badge.icon}
            </View>
            <Text
              className="font-inter-semibold text-[#222222] text-center"
              style={{ fontSize: moderateScale(11) }}
              numberOfLines={1}
            >
              {badge.label}
            </Text>
            <Text
              className="font-inter-medium text-[#6A6A6A] text-center"
              style={{ fontSize: moderateScale(9), marginTop: exactScale(1) }}
              numberOfLines={1}
            >
              {badge.description}
            </Text>
          </View>

          {index < arr.length - 1 && (
            <View
              style={{
                width: 1,
                height: exactScale(32),
                backgroundColor: "#919EAB33",
                marginHorizontal: exactScale(6),
              }}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  </LinearGradient>
);
