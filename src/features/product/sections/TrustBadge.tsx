import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./product-sections.styles";

interface TrustBadgeProps {
  searchedName: string;
  recommendedName?: string;
  searchedManufacturer?: string;
  recommendedManufacturer?: string;
  searchedUnitPrice?: string | number;
  recommendedUnitPrice?: string | number;
}

const Divider = () => <View style={s.trustBadgeDashedDivider} />;

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
      style={s.trustBadgeRoot}
    >
      <View style={s.trustBadgeInner}>
        <Text style={s.trustBadgeTitle}>
          Medicine Comparison
        </Text>

        <View style={s.trustBadgeCard}>
          {/* MEDICINE */}
          <View>
            <Text style={s.trustBadgeFieldLabel}>
              MEDICINE
            </Text>
            <View style={s.trustBadgeRow}>
              <Text
                style={s.trustBadgeSearchedText}
                numberOfLines={2}
              >
                {searchedName}
              </Text>
              <Text
                style={s.trustBadgeRecommendedText}
                numberOfLines={2}
              >
                {recName}
              </Text>
            </View>
          </View>
          <Divider />

          {/* MANUFACTURER */}
          <View>
            <Text style={s.trustBadgeFieldLabel}>
              MANUFACTURER
            </Text>
            <View style={s.trustBadgeRow}>
              <Text
                style={s.trustBadgeSearchedText}
                numberOfLines={2}
              >
                {searchedManufacturer || "—"}
              </Text>
              <Text
                style={s.trustBadgeRecommendedText}
                numberOfLines={2}
              >
                {recManufacturer || "—"}
              </Text>
            </View>
          </View>
          <Divider />

          {/* SALT COMPOSITION & STRENGTH */}
          <View>
            <Text style={s.trustBadgeFieldLabel}>
              SALT COMPOSITION & STRENGTH
            </Text>
            <View style={s.trustBadgeMatchBox}>
              <icons.check_circle
                width={14}
                height={14}
                color={colors.primary}
              />
              <Text style={s.trustBadgeMatchText}>
                100% Match
              </Text>
            </View>
          </View>
          <Divider />

          {/* PRICE COMPARISON */}
          <View>
            <Text style={s.trustBadgeFieldLabel}>
              PRICE COMPARISON
            </Text>
            <View style={s.trustBadgeRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.trustBadgeSearchedText}>
                  {searchedUnitPrice ? `₹${searchedUnitPrice}` : "—"}
                </Text>
                <Text style={{ fontSize: 11, color: "#6B7280" }}>
                  per unit
                </Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={s.trustBadgeRecommendedText}>
                  {recommendedUnitPrice ? `₹${recommendedUnitPrice}` : "—"}
                </Text>
                <Text style={{ fontSize: 11, color: "#0F7635" }}>
                  per unit
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
