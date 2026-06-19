import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cartStyles as s } from "./cart.styles";

interface BillDetailsSheetProps {
  isVisible: boolean;
  onClose: () => void;
  linesCount: number;
  mrpTotal: number;
  productSavings: number;
  couponDiscount: number;
  walletDiscount: number;
  coinsDiscount: number;
  deliveryFee: number;
  handlingCharge: number;
  toPay: number;
}

export const BillDetailsSheet: React.FC<BillDetailsSheetProps> = ({
  isVisible,
  onClose,
  linesCount,
  mrpTotal,
  productSavings,
  couponDiscount,
  walletDiscount,
  coinsDiscount,
  deliveryFee,
  handlingCharge,
  toPay,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <GorhomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: Math.max(insets.bottom, 16) + 16,
        }}
      >
        <Text
          style={s.billSheetTitle}
          className="font-inter-bold text-brand-text mb-6"
        >
          Bill Details
        </Text>

        <View>
          <View className="flex-row justify-between">
            <Text
              style={s.billSheetLabel}
              className="font-inter-medium text-[#6A6A6A]"
            >
              Item Total ({linesCount} Items)
            </Text>
            <Text
              style={s.billSheetLabel}
              className="font-inter-medium text-[#6A6A6A]"
            >
              ₹{Number(mrpTotal).toFixed(2)}
            </Text>
          </View>

          {productSavings > 0 && (
            <View className="flex-row justify-between mt-4">
              <Text className="text-[14px] font-inter text-[#6A6A6A]">
                Product Discount
              </Text>
              <Text
                style={s.billSheetLabel}
                className="font-inter-semibold text-[#0F7635]"
              >
                - ₹{Number(productSavings).toFixed(2)}
              </Text>
            </View>
          )}

          {couponDiscount > 0 && (
            <View className="flex-row justify-between mt-4">
              <Text className="text-[14px] font-inter text-[#6A6A6A]">
                Coupon Discount
              </Text>
              <Text
                style={s.billSheetLabel}
                className="font-inter-semibold text-[#0F7635]"
              >
                - ₹{Number(couponDiscount).toFixed(2)}
              </Text>
            </View>
          )}

          {walletDiscount > 0 && (
            <View className="flex-row justify-between mt-4">
              <Text className="text-[14px] font-inter text-[#6A6A6A]">
                CareSure Wallet
              </Text>
              <Text
                style={s.billSheetLabel}
                className="font-inter-semibold text-[#0F7635]"
              >
                - ₹{Number(walletDiscount).toFixed(2)}
              </Text>
            </View>
          )}

          {coinsDiscount > 0 && (
            <View className="flex-row justify-between mt-4">
              <Text className="text-[14px] font-inter text-[#6A6A6A]">
                CareSure Coins
              </Text>
              <Text
                style={s.billSheetLabel}
                className="font-inter-semibold text-[#0F7635]"
              >
                - ₹{Number(coinsDiscount).toFixed(2)}
              </Text>
            </View>
          )}

          <View className="flex-row justify-between mt-4">
            <Text className="text-[14px] font-inter text-[#6A6A6A]">
              Delivery Fee
            </Text>
            <Text className="text-[14px] font-inter text-[#6A6A6A]">
              {deliveryFee > 0 ? `₹${Number(deliveryFee).toFixed(2)}` : "FREE"}
            </Text>
          </View>

          <View className="flex-row justify-between mt-4">
            <Text className="text-[14px] font-inter text-[#6A6A6A]">
              Handling Charge
            </Text>
            <Text className="text-[14px] font-inter text-[#6A6A6A]">
              ₹{Number(handlingCharge).toFixed(2)}
            </Text>
          </View>
        </View>

        <View
          style={{
            marginVertical: 20,
            borderTopWidth: 1,
            borderColor: "#E5E7EB",
            borderStyle: "dashed",
          }}
        />

        <View className="flex-row justify-between items-center">
          <Text
            style={s.billSheetTotal}
            className="font-inter-bold text-[#1A1C1E]"
          >
            To Pay
          </Text>
          <Text
            style={s.billSheetGrand}
            className="font-inter-extrabold text-[#1A1C1E]"
          >
            ₹{Number(toPay).toFixed(2)}
          </Text>
        </View>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
