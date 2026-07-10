import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useLocationStore } from "@/src/store/locationStore";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

interface LogisticsBarProps {
  deliveryTime?: string;
  pincode?: string;
  onChangeLocation?: () => void;
}

export const LogisticsBar: React.FC<LogisticsBarProps> = ({
  deliveryTime = "10pm, Tomorrow",
  pincode,
  onChangeLocation,
}) => {
  const storeLocation = useLocationStore((s) => s.location);
  const storePincode = useLocationStore((s) => s.pincode);

  // Prioritize the location label (like 'Home', 'Office'), then fallback to the pincode, and finally 'Select Location'
  const displayLabel =
    storeLocation?.label || pincode || storePincode || "Select ";

  return (
    <View className="mx-4 bg-white border border-[#919EAB33] rounded-[12px] flex-row items-center justify-between px-4 py-4 mb-6">
      <View
        className="flex-row items-center border-r border-[#F3F4F6] pr-4 flex-1"
        style={{ minWidth: 0 }}
      >
        <icons.shopping_bag width={20} height={20} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-inter text-brand-text ml-2"
          style={{ fontSize: moderateScale(12) }}
        >
          Get by{" "}
          <Text className="font-inter-bold text-brand-text">
            {deliveryTime}
          </Text>
        </Text>
      </View>
      <View className="flex-row items-center pl-4" style={{ flexShrink: 0 }}>
        <icons.location width={18} height={18} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          className="font-inter-semibold text-brand-text mx-2"
          style={{ maxWidth: exactScale(70), fontSize: moderateScale(12) }}
        >
          {displayLabel}
        </Text>
        <Touchable onPress={onChangeLocation} style={{ flexShrink: 0 }}>
          <Text
            className="font-inter-semibold text-brand-primary"
            style={{ fontSize: moderateScale(14) }}
          >
            Change
          </Text>
        </Touchable>
      </View>
    </View>
  );
};
