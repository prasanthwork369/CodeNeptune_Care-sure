import { Touchable } from "@/src/components/ui/Touchable";
import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { BenefitBadges } from "./BenefitBadges";
import { CARD_WIDTH, DEFAULT_CORPORATE_BADGES } from "./constants";

interface CorporateBenefitsPageProps {
  creditsBalance: number;
  onCta: () => void;
}

export const CorporateBenefitsPage: React.FC<CorporateBenefitsPageProps> = ({
  creditsBalance,
  onCta,
}) => (
  <LinearGradient
    colors={["#FFFFFF", "#EAF2FF"]}
    start={{ x: 0, y: 1 }}
    end={{ x: 1, y: 0 }}
    style={{ width: CARD_WIDTH }}
  >
    {/* Header */}
    <View
      style={{
        paddingHorizontal: exactScale(20),
        paddingTop: exactScale(18),
        paddingBottom: exactScale(6),
        minHeight: exactScale(76),
      }}
    >
      <Text
        className="font-medium text-[#222222]"
        style={{ fontSize: moderateScale(14) }}
      >
        Hello!
      </Text>
      <Text
        className="font-inter-extrabold text-[#222222]"
        style={{ fontSize: moderateScale(18), marginTop: exactScale(2) }}
      >
        Healthcare Benefits
      </Text>
      <Text
        className="font-inter-medium text-[#6A6A6A]"
        style={{ fontSize: moderateScale(12), marginTop: exactScale(3) }}
      >
        Healthcare benefits made simple
      </Text>

      <Svg
        width={exactScale(200)}
        height={exactScale(200)}
        style={{
          position: "absolute",
          top: exactScale(-50),
          right: exactScale(-70),
        }}
      >
        <Defs>
          <RadialGradient id="corpGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#BFDBFE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect
          width={exactScale(200)}
          height={exactScale(200)}
          fill="url(#corpGlow)"
        />
      </Svg>

      <Image
        source={HOME_IMAGES.corporateBenefits}
        style={{
          position: "absolute",
          top: exactScale(6),
          right: exactScale(10),
          width: exactScale(110),
          height: exactScale(90),
        }}
        resizeMode="contain"
      />
    </View>

    {/* Corporate wallet card */}
    <View
      style={{
        marginHorizontal: exactScale(14),
        marginTop: exactScale(8),
        marginBottom: exactScale(12),
        backgroundColor: "#fff",
        borderRadius: exactScale(20),
        padding: exactScale(14),
        borderWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <Text
        className="font-inter-semibold text-[#222222]"
        style={{ fontSize: moderateScale(14), marginBottom: exactScale(10) }}
      >
        Your Corporate Wallet
      </Text>

      <View
        className="flex-row"
        style={{ gap: exactScale(10), marginBottom: exactScale(12) }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#F1F5FE",
            borderRadius: exactScale(8),
            padding: exactScale(10),
            borderWidth: 1,
            borderColor: "#E7EFFF",
          }}
        >
          <View className="flex-row items-center">
            <View>
              <Image
                source={HOME_IMAGES.taxBuilding}
                style={{ width: exactScale(22), height: exactScale(22) }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: exactScale(6) }}>
              <Text
                className="font-inter-medium text-[#222222]"
                style={{ fontSize: moderateScale(12), letterSpacing: 1 }}
              >
                CREDITS
              </Text>
              <Text
                className="font-inter-extrabold"
                style={{
                  fontSize: moderateScale(22),
                  lineHeight: moderateScale(26),
                  color: "#0047CC",
                }}
              >
                ₹{Number(creditsBalance).toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#F3FFF7",
            borderRadius: exactScale(8),
            padding: exactScale(10),
            borderWidth: 1,
            borderColor: "#D8FFE6",
          }}
        >
          <View className="flex-row items-center">
            <View>
              <Image
                source={HOME_IMAGES.giftBoxGreen}
                style={{ width: exactScale(22), height: exactScale(22) }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: exactScale(6) }}>
              <Text
                className="font-inter-medium text-[#222222]"
                style={{ fontSize: moderateScale(12), letterSpacing: 1 }}
              >
                REDEEM
              </Text>
              <Text
                className="font-inter-bold text-[#6A6A6A]"
                style={{
                  fontSize: moderateScale(10),
                  lineHeight: moderateScale(12),
                  marginTop: exactScale(2),
                }}
                numberOfLines={2}
              >
                Order medicines with your credits
              </Text>
            </View>
          </View>
        </View>
      </View>

      <BenefitBadges
        colors={["#FFFFFF", "#FFFFFF"]}
        badges={DEFAULT_CORPORATE_BADGES.map((b) => ({
          icon: (
            <Image
              source={b.icon}
              style={{ width: exactScale(18), height: exactScale(18) }}
              resizeMode="contain"
            />
          ),
          label: b.label,
          description: b.description,
        }))}
      />
    </View>

    {/* CTA */}
    <View
      style={{
        paddingHorizontal: exactScale(16),
        paddingBottom: exactScale(16),
      }}
    >
      <Touchable
        onPress={onCta}
        activeOpacity={0.85}
        className="w-full items-center"
        style={{
          backgroundColor: "#1D4ED8",
          paddingVertical: exactScale(13),
          borderRadius: exactScale(12),
        }}
      >
        <Text
          className="font-inter-bold text-white"
          style={{ fontSize: moderateScale(15) }}
        >
          Start Shopping
        </Text>
      </Touchable>
    </View>
  </LinearGradient>
);
