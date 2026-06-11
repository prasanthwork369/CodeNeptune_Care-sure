import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { cartStyles as s } from './cart.styles';
import { HOME_IMAGES } from "@/src/constants/images";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  availableCoins = 100,
  savedAmount = 50,
  coinValue = 1,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <GorhomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
    >
      <BottomSheetView style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
      <View className="border border-[#919EAB33] rounded-[20px] overflow-hidden bg-white">
        {/* Header Part with Gradient */}
        <LinearGradient
          colors={["#FDF5FF", "#E7F3FF"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-5 pt-5 pb-7 flex-row items-center justify-between relative"
        >
          <View className="flex-1 pr-12">
            <Text style={s.coinsSheetTitle} className="font-inter-extrabold text-[#222222]">
              My CareSure Coins
            </Text>
            <Text style={s.coinsSheetSub} className="font-inter-bold text-[#222222] mt-1">
              1 CareSure Coins = ₹{coinValue}
            </Text>
          </View>

          <Image
            source={HOME_IMAGES.moneyBag}
            style={[s.coinsSheetBag, { position: "absolute", right: 0, bottom: 0 }]}
            resizeMode="contain"
          />
        </LinearGradient>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: "#919EAB1F" }} />

        {/* Info Part */}
        <View className="px-5 py-5 bg-white">
          <View className="flex-row items-center">
            <Text style={s.coinsSheetLabel} className="font-inter-medium text-[#222222]">
              Available Coins:
            </Text>
            <View className="flex-row items-center ml-2">
              <Image
                source={HOME_IMAGES.dollarCoins}
                style={s.coinsSheetCoinImg}
                resizeMode="contain"
              />
              <Text style={s.coinsSheetLabel} className="font-inter-bold text-[#000000] ml-2">
                {availableCoins}
              </Text>
            </View>
          </View>

          <Text style={s.coinsSheetSaved} className="font-inter-semibold text-[#0F7635] mt-2">
            Saved ₹{Number(savedAmount).toFixed(2)} Using {Math.round(savedAmount / coinValue)} CareSure Coins
          </Text>
        </View>
      </View>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
