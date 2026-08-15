import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { HOME_IMAGES } from "@/src/constants/images";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";
import { cartStyles as s } from "../cart.styles";

interface CareSureCoinsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  availableCoins: number;
  savedAmount: number;
  coinValue?: number;
}

export const CareSureCoinsSheet: React.FC<CareSureCoinsSheetProps> = ({
  isVisible,
  onClose,
  availableCoins = 0,
  savedAmount = 0,
  // Match billing's fallback without inventing a balance when data is missing.
  coinValue = 1,
}) => {
  const adjustedBottom = useAdjustedBottomInset();
  // Admin can set coinValue to 0, which must not produce Infinity.
  const coinsSpent = coinValue > 0 ? Math.round(savedAmount / coinValue) : 0;

  return (
    <GorhomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(24),
          paddingBottom:
            Math.max(adjustedBottom, exactScale(16)) + exactScale(16),
        }}
      >
        <View
          className="border border-[#919EAB33] overflow-hidden bg-white"
          style={{ borderRadius: exactScale(20) }}
        >
          {/* Header Part with Gradient */}
          <LinearGradient
            colors={["#FDF5FF", "#E7F3FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-between relative"
            style={{
              paddingHorizontal: exactScale(20),
              paddingTop: exactScale(20),
              paddingBottom: exactScale(28),
            }}
          >
            <View className="flex-1" style={{ paddingRight: exactScale(48) }}>
              <Text
                style={s.coinsSheetTitle}
                className="font-inter-extrabold text-[#222222]"
              >
                My CareSure Coins
              </Text>
              <Text
                style={[s.coinsSheetSub, { marginTop: exactScale(4) }]}
                className="font-inter-bold text-[#222222]"
              >
                1 CareSure Coins = ₹{coinValue}
              </Text>
            </View>

            <Image
              source={HOME_IMAGES.moneyBag}
              style={[
                s.coinsSheetBag,
                { position: "absolute", right: -5, bottom: 0 },
              ]}
              resizeMode="cover"
            />
          </LinearGradient>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#919EAB1F" }} />

          {/* Info Part */}
          <View
            className="bg-white"
            style={{
              paddingHorizontal: exactScale(20),
              paddingVertical: exactScale(20),
            }}
          >
            <View className="flex-row items-center">
              <Text
                style={s.coinsSheetLabel}
                className="font-inter-medium text-[#222222]"
              >
                Available Coins:
              </Text>
              <View
                className="flex-row items-center"
                style={{ marginLeft: exactScale(8) }}
              >
                <Image
                  source={HOME_IMAGES.dollarCoins}
                  style={s.coinsSheetCoinImg}
                  resizeMode="contain"
                />
                <Text
                  style={[s.coinsSheetLabel, { marginLeft: exactScale(4) }]}
                  className="font-inter-bold text-[#000000]"
                >
                  {availableCoins}
                </Text>
              </View>
            </View>

            {coinsSpent > 0 && (
              <Text
                style={[s.coinsSheetSaved, { marginTop: exactScale(8) }]}
                className="font-inter-semibold text-[#0F7635]"
              >
                Saved ₹{parseFloat(savedAmount.toFixed(2))} Using {coinsSpent}{" "}
                CareSure Coins
              </Text>
            )}
          </View>
        </View>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
