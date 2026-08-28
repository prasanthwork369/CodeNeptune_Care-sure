import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useLocationStore } from "@/src/store/locationStore";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./product-sections.styles";

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
  const storeLocation = useLocationStore((st) => st.location);
  const storePincode = useLocationStore((st) => st.pincode);

  // Prioritize the location label (like 'Home', 'Office'), then fallback to the pincode, and finally 'Select Location'
  const displayLabel =
    storeLocation?.label || pincode || storePincode || "Select ";

  return (
    <View style={s.logisticsRoot}>
      <View style={s.logisticsLeft}>
        <icons.shopping_bag width={20} height={20} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={s.logisticsText}
        >
          Get by{" "}
          <Text style={s.logisticsTimeBold}>
            {deliveryTime}
          </Text>
        </Text>
      </View>
      <Touchable
        onPress={onChangeLocation}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Change delivery location, current ${displayLabel}`}
        style={s.logisticsRight}
      >
        <icons.location width={18} height={18} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={s.logisticsLocationLabel}
        >
          {displayLabel}
        </Text>
        <Text style={s.logisticsChangeText}>
          Change
        </Text>
      </Touchable>
    </View>
  );
};
