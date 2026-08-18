import { HOME_IMAGES } from "@/src/constants/images";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useWalletBalance } from "@/src/features/wallet/hooks/useWallet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import { profileStyles as s } from "../profile.styles";

export const ProfileCoinsCard: React.FC = () => {
  const { balance } = useWalletBalance();
  const { profile } = useProfile();

  const coins = balance != null ? balance.coinsBalance : "—";
  const memberYear = profile?.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : "—";

  return (
    <View
      className="mx-4 mt-[14px] rounded-xl overflow-hidden"
      style={{
        borderTopWidth: 1,
        borderRightWidth: 1,
        borderBottomWidth: 0,
        borderLeftWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <LinearGradient
        colors={["#FDF5FF", "#E7F3FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="flex-row items-center justify-between px-5 pt-5 pb-7"
        style={{ minHeight: 104, padding: 10 }}
      >
        <View className="flex-1 pr-20 ">
          <Text
            style={s.coinsTitle}
            className="font-inter-extrabold text-[#222222]"
          >
            My CareSure Coins
          </Text>
          <Text
            style={s.coinsSub}
            className="font-inter-bold text-[#222222] mt-1"
          >
            1 CareSure Coins = ₹1
          </Text>
        </View>
        <Image
          source={HOME_IMAGES.moneyBag}
          style={{
            width: 105,
            height: 96,
            position: "absolute",
            right: -3,
            bottom: -5,
          }}
          contentFit="cover"
        />
      </LinearGradient>
      <View className="bg-white px-5 py-4">
        <View className="flex-row items-center">
          <Text
            style={s.coinsLabel}
            className="font-inter-medium text-[#222222]"
          >
            Available Coins:
          </Text>
          <Image
            source={HOME_IMAGES.dollarCoins}
            style={{ width: 24, height: 24, marginHorizontal: 8 }}
            contentFit="contain"
          />
          <Text style={s.coinsBold} className="font-inter-bold text-[#000000]">
            {coins}
          </Text>
        </View>
        <Text
          style={s.coinsSaved}
          className="font-inter-medium text-[#0F7635] mt-2"
        >
          Member since {memberYear}
        </Text>
      </View>
    </View>
  );
};
