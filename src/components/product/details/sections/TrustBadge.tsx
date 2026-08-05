import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";

interface TrustBadgeProps {
  searchedName: string;
  recommendedName?: string;
  searchedManufacturer?: string;
  recommendedManufacturer?: string;
  searchedUnitPrice?: string | number;
  recommendedUnitPrice?: string | number;
}

const Divider = () => (
  <View
    style={{
      borderTopWidth: 1,
      borderColor: "#E5E7EB",
      borderStyle: "dashed",
      marginVertical: 16,
    }}
  />
);

export const TrustBadge: React.FC<TrustBadgeProps> = ({
  searchedName,
  recommendedName,
  searchedManufacturer,
  recommendedManufacturer,
  searchedUnitPrice,
  recommendedUnitPrice,
}) => {
  const recName = recommendedName ?? searchedName;
  const recManufacturer = recommendedManufacturer ?? searchedManufacturer;

  return (
    <LinearGradient
      colors={["#F0F8FF", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.8 }}
      style={{
        paddingTop: exactScale(24),
        paddingBottom: exactScale(24),
      }}
    >
      <View className="px-4 mb-6">
        <Text
          className="font-inter-bold text-brand-text mb-4 text-center"
          style={{ fontSize: moderateScale(14) }}
        >
          Medicine Comparison
        </Text>

        <View className="bg-white rounded-[16px] p-5 border border-[#919EAB33]">
          {/* MEDICINE */}
          <View>
            <Text
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2 text-center"
              style={{ fontSize: moderateScale(12) }}
            >
              MEDICINE
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="font-inter-semibold text-brand-text"
                style={{ flex: 1, marginRight: 8, fontSize: moderateScale(14) }}
                numberOfLines={2}
              >
                {searchedName}
              </Text>
              <Text
                className="font-inter-semibold text-brand-primary"
                style={{
                  flex: 1,
                  textAlign: "right",
                  fontSize: moderateScale(14),
                }}
                numberOfLines={2}
              >
                {recName}
              </Text>
            </View>
          </View>
          <Divider />

          {/* MANUFACTURER */}
          <View>
            <Text
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2 text-center"
              style={{ fontSize: moderateScale(12) }}
            >
              MANUFACTURER
            </Text>
            <View className="flex-row items-center justify-between">
              <Text
                className="font-inter-semibold text-brand-text"
                style={{ flex: 1, marginRight: 8, fontSize: moderateScale(13) }}
                numberOfLines={2}
              >
                {searchedManufacturer || "—"}
              </Text>
              <Text
                className="font-inter-semibold text-brand-primary"
                style={{
                  flex: 1,
                  textAlign: "right",
                  fontSize: moderateScale(13),
                }}
                numberOfLines={2}
              >
                {recManufacturer || "—"}
              </Text>
            </View>
          </View>
          <Divider />

          {/* SALT COMPOSITION & STRENGTH */}
          <View>
            <Text
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2 text-center"
              style={{ fontSize: moderateScale(12) }}
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
          <Divider />

          {/* MEDICINAL EFFECT */}
          <View>
            <Text
              className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2 text-center"
              style={{ fontSize: moderateScale(12) }}
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

          {/* PRICE/UNIT — only show when both unit prices are available */}
          {(searchedUnitPrice != null || recommendedUnitPrice != null) && (
            <>
              <Divider />
              <View>
                <Text
                  className="font-inter-semibold text-brand-subtext uppercase tracking-[1px] mb-2 text-center"
                  style={{ fontSize: moderateScale(12) }}
                >
                  PRICE/UNIT
                </Text>
                <View className="flex-row items-center justify-between">
                  <Text
                    className="font-inter-semibold text-[#111827]"
                    style={{ fontSize: moderateScale(14) }}
                  >
                    {searchedUnitPrice != null
                      ? `₹${Number(searchedUnitPrice).toFixed(2)}`
                      : "—"}
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-primary"
                    style={{ fontSize: moderateScale(14) }}
                  >
                    {recommendedUnitPrice != null
                      ? `₹${Number(recommendedUnitPrice).toFixed(2)}`
                      : "—"}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};
