import React from "react";
import { View, Text, Image } from "react-native";
import { cartStyles as s } from "../cart.styles";
import { HOME_IMAGES } from "@/src/constants/images";
import { CustomSwitch } from "@/src/components/ui/CustomSwitch";
import { CartCorporateCreditsSectionProps } from "@/src/features/cart/types";
import { moderateScale } from "@/src/utils/exactScale";

export const CartCorporateCreditsSection: React.FC<
  CartCorporateCreditsSectionProps
> = ({
  value,
  balance,
  onToggle,
  eligible = true,
  remainingForEligibility = 0,
  hasRemainingAmount = true,
  discountApplied = 0,
}) => {
  // discountApplied is 0 whenever the toggle is off, so this shows the full
  // balance until it's in use, then the remainder left after this order.
  const displayBalance = balance - discountApplied;
  return (
    <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4">
      <View className="py-3.5 flex-row items-center">
        <Image
          source={HOME_IMAGES.corporateCredit}
          style={s.walletIcon}
          resizeMode="contain"
        />
        <View className="flex-1 ml-3">
          <Text
            style={s.walletTitle}
            className="font-inter-semibold text-brand-[#0F1724]"
          >
            Corporate Credits
          </Text>
          <Text
            style={s.walletSub}
            className="font-inter-medium text-brand-subtext mt-0.5"
          >
            Available Balance: ₹{Number(displayBalance).toFixed(2)}
          </Text>
        </View>
        {eligible ? (
          <CustomSwitch
            value={value}
            onValueChange={onToggle}
            disabled={!value && !hasRemainingAmount}
            accessibilityLabel="Use Corporate Credits"
          />
        ) : null}
      </View>
      {!eligible && (
        <Text
          className="font-inter-medium text-[#B45309] pb-3.5"
          style={{ fontSize: moderateScale(12) }}
        >
          Add ₹{Number(remainingForEligibility).toFixed(2)} more to use
          Corporate Credits
        </Text>
      )}
    </View>
  );
};
