import React from "react";
import { View, Text } from "react-native";
import { trustBadgeStyles as s } from "../../search.styles";
import { LinearGradient } from "expo-linear-gradient";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { moderateScale } from "@/src/utils/exactScale";

interface TrustBadgeProps {
  searchedName: string;
  recommendedName: string;
  searchedManufacturer: string;
  recommendedManufacturer: string;
  searchedUnitPrice?: string;
  recommendedUnitPrice?: string;
}

export const TrustBadge = ({
  searchedName,
  recommendedName,
  searchedManufacturer,
  recommendedManufacturer,
  searchedUnitPrice,
  recommendedUnitPrice,
}: TrustBadgeProps) => {
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
            <View className="flex-row items-start justify-between gap-x-3">
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-text flex-1"
                numberOfLines={2}
              >
                {searchedName}
              </Text>
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-primary flex-1 text-right"
                numberOfLines={2}
              >
                {recommendedName}
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
            <View className="flex-row items-start justify-between gap-x-3">
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-text flex-1"
                numberOfLines={2}
              >
                {searchedManufacturer}
              </Text>
              <Text
                style={s.value}
                className="font-inter-semibold text-[#009989] flex-1 text-right"
                numberOfLines={2}
              >
                {recommendedManufacturer}
              </Text>
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
                style={s.value}
              >
                {searchedUnitPrice ? `₹${searchedUnitPrice}` : "—"}
              </Text>
              <Text
                style={s.value}
                className="font-inter-semibold text-brand-primary"
              >
                {recommendedUnitPrice ? `₹${recommendedUnitPrice}` : "—"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
