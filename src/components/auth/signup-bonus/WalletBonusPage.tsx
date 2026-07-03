import { Touchable } from "@/src/components/ui/Touchable";
import { SignupBonusData, SignupBonusPopupContent } from "@/src/types/signupBonus";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";
import { BadgeIcon, BenefitBadges } from "./BenefitBadges";
import { CARD_WIDTH } from "./constants";

interface WalletBonusPageProps {
  content?: SignupBonusPopupContent;
  bonusData: SignupBonusData;
  hasWallet: boolean;
  hasCoins: boolean;
  onCta: () => void;
}

export const WalletBonusPage: React.FC<WalletBonusPageProps> = ({
  content,
  bonusData,
  hasWallet,
  hasCoins,
  onCta,
}) => (
  <LinearGradient
    colors={["#F3F9FF", "#FDF5FF", "#F1E6FF"]}
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
        {content?.greeting || "Hi there!"}
      </Text>
      <Text
        className="font-inter-extrabold text-[#222222]"
        style={{ fontSize: moderateScale(19), marginTop: exactScale(2) }}
      >
        {content?.title || "Welcome to CareSure"}
      </Text>
      <Text
        className="font-inter text-[#6A6A6A]"
        style={{ fontSize: moderateScale(12), marginTop: exactScale(3) }}
      >
        {content?.subtitle || "You've got rewards waiting for you"}
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
          <RadialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E9D5FF" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#E9D5FF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect
          width={exactScale(200)}
          height={exactScale(200)}
          fill="url(#giftGlow)"
        />
      </Svg>

      {!!content?.giftImage && (
        <Image
          source={{ uri: content.giftImage }}
          style={{
            position: "absolute",
            top: exactScale(-6),
            right: exactScale(-8),
            width: exactScale(145),
            height: exactScale(115),
          }}
          resizeMode="contain"
        />
      )}
    </View>

    {/* Wallet card */}
    <View
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(4),
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
        {content?.walletTitle || "Your Wallet"}
      </Text>

      {content?.coinImage && (
        <Image
          source={{ uri: content.coinImage }}
          style={{
            position: "absolute",
            top: exactScale(-28),
            right: exactScale(14),
            width: exactScale(56),
            height: exactScale(56),
          }}
          resizeMode="contain"
        />
      )}

      <View
        className="flex-row"
        style={{ gap: exactScale(10), marginBottom: exactScale(12) }}
      >
        {hasCoins && (
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFF8EC",
              borderRadius: exactScale(14),
              padding: exactScale(12),
              borderWidth: 1,
              borderColor: "#FFE9BF",
            }}
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: exactScale(36),
                  height: exactScale(36),
                  borderRadius: exactScale(18),
                  backgroundColor: "#FFE9BF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: exactScale(8),
                }}
              >
                {!!content?.coinsIcon && (
                  <Image
                    source={{ uri: content.coinsIcon }}
                    style={{ width: exactScale(38), height: exactScale(38) }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View>
                <Text
                  className="font-inter-medium text-[#222222]"
                  style={{ fontSize: moderateScale(10), letterSpacing: 1 }}
                >
                  {(content?.coinsLabel || "COINS").toUpperCase()}
                </Text>
                <Text
                  className="font-inter-extrabold "
                  style={{
                    fontSize: moderateScale(22),
                    lineHeight: moderateScale(26),
                    color: "#E28F1C",
                  }}
                >
                  {bonusData.coins}
                </Text>
              </View>
            </View>
          </View>
        )}

        {hasWallet && (
          <View
            style={{
              flex: 1,
              backgroundColor: "#D8FFE6",
              borderRadius: exactScale(14),
              padding: exactScale(12),
              borderWidth: 1,
              borderColor: "#A6F0C0",
            }}
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: exactScale(36),
                  height: exactScale(36),
                  borderRadius: exactScale(16),
                  backgroundColor: "#D8FFE6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: exactScale(8),
                }}
              >
                {!!content?.balanceIcon && (
                  <Image
                    source={{ uri: content.balanceIcon }}
                    style={{ width: exactScale(38), height: exactScale(38) }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View>
                <Text
                  className="font-inter-medium text-[#222222]"
                  style={{ fontSize: moderateScale(10), letterSpacing: 1 }}
                >
                  {(content?.balanceLabel || "BALANCE").toUpperCase()}
                </Text>
                <Text
                  className="font-inter-bold text-[#0F7635]"
                  style={{
                    fontSize: moderateScale(22),
                    lineHeight: moderateScale(26),
                  }}
                >
                  ₹{Number(bonusData.wallet).toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Feature highlights — API-driven only, no local fallback */}
      {!!content?.badges?.length && (
        <BenefitBadges
          badges={content.badges.map((b) => ({
            icon: <BadgeIcon icon={b.icon} />,
            label: b.label,
            description: b.description,
          }))}
        />
      )}
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
          backgroundColor: "#0F7635",
          paddingVertical: exactScale(13),
          borderRadius: exactScale(12),
        }}
      >
        <Text
          className="font-inter-bold text-white"
          style={{ fontSize: moderateScale(15) }}
        >
          {content?.buttonText || "Start Shopping"}
        </Text>
      </Touchable>
    </View>
  </LinearGradient>
);
