import React from "react";
import { View, Text, Image } from "react-native";
import { trustBadgeStyles as s } from "../../search.styles";
import { LinearGradient } from "expo-linear-gradient";
import { HOME_IMAGES } from "@/src/constants/images";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { moderateScale } from "@/src/utils/exactScale";

export const TrustBadge = () => {
  return (
    <LinearGradient
      colors={["#F0F8FF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      className="py-6"
    >
      <View className="px-4 mb-6">
        <Text
          style={s.sectionTitle}
          className="font-inter-bold text-brand-text mb-4 ml-1"
        >
          Medicine Comparison
        </Text>

        <View className="bg-white rounded-[16px] p-5 shadow-sm border border-[#919EAB33]">
          {/* MEDICINE */}
          <View className="border-b border-dashed border-[#919EAB33] pb-4 mb-4">
            <Text
              style={s.label}
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2"
            >
              MEDICINE
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-text"
              >
                Paracetamol 650mg
              </Text>
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-primary"
              >
                Paracip 650mg
              </Text>
            </View>
          </View>

          {/* MANUFACTURER */}
          <View className="border-b border-dashed border-[#919EAB33] pb-4 mb-4">
            <Text
              style={s.label}
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2"
            >
              MANUFACTURER
            </Text>
            <View className="flex-row items-center justify-between h-[30px]">
              <Image
                source={HOME_IMAGES.modiLogo}
                style={s.modiLogo}
                resizeMode="contain"
              />
              <Image
                source={HOME_IMAGES.ciplaLogo}
                style={s.ciplaLogo}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* SALT COMPOSITION & STRENGTH */}
          <View className="border-b border-dashed border-[#919EAB33] pb-4 mb-4">
            <Text
              style={s.label}
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2"
            >
              SALT COMPOSITION & STRENGTH
            </Text>
            <View className="flex-row items-center justify-center py-[10px] rounded-[6px] bg-[#F1FFF6] border border-dashed border-brand-primary">
              <icons.check_circle
                width={14}
                height={14}
                color={colors.primary}
              />
              <Text
                className="font-inter-semibold text-brand-primary ml-1.5"
                style={{ fontSize: moderateScale(14) }}
              >
                100% Match
              </Text>
            </View>
          </View>

          {/* MEDICINAL EFFECT */}
          <View className="border-b border-dashed border-[#919EAB33] pb-4 mb-4">
            <Text
              style={s.label}
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2"
            >
              MEDICINAL EFFECT
            </Text>
            <View className="flex-row items-center justify-center py-[10px] rounded-[6px] bg-[#F1FFF6] border border-dashed border-brand-primary">
              <icons.check_circle
                width={14}
                height={14}
                color={colors.primary}
              />
              <Text
                className="font-inter-semibold text-brand-primary ml-1.5"
                style={{ fontSize: moderateScale(14) }}
              >
                Same
              </Text>
            </View>
          </View>

          {/* PRICE/UNIT */}
          <View>
            <Text
              style={s.label}
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2"
            >
              PRICE/UNIT
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="font-inter-semibold text-[#111827]"
                style={{ fontSize: moderateScale(14) }}
              >
                ₹1.5
              </Text>
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-primary"
              >
                ₹1.4
              </Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
