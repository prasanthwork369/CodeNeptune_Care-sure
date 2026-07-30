import React from "react";
import { ActivityIndicator, View, TextInput, Text } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { colors } from "@/src/constants/theme";
import { CouponInputProps } from "@/src/types/cart";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const CouponInput: React.FC<CouponInputProps> = ({
  value,
  onChangeText,
  onApply,
  loading,
}) => {
  return (
    <View
      className="bg-white flex-row items-center"
      style={{
        height: exactScale(55),
        borderRadius: exactScale(12),
        borderWidth: 1,
        borderColor: "#919EAB33",
        paddingHorizontal: exactScale(10),
        paddingLeft: exactScale(16),
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter Code"
        placeholderTextColor="#6A6A6A"
        className="flex-1 font-inter-medium text-brand-text"
        style={{
          height: exactScale(40),
          fontSize: moderateScale(15),
          paddingVertical: 0,
        }}
        autoCapitalize="characters"
        // A coupon code must match the backend string exactly, so autocorrect can only corrupt it.
        autoCorrect={false}
        spellCheck={false}
        editable={!loading}
      />
      <Touchable
        onPress={onApply}
        disabled={loading}
        style={{
          width: exactScale(55),
          height: exactScale(28),
          borderRadius: exactScale(4),
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text
            className="font-inter-bold text-white"
            style={{
              fontSize: moderateScale(13),
              lineHeight: moderateScale(17),
            }}
          >
            APPLY
          </Text>
        )}
      </Touchable>
    </View>
  );
};
