import { Touchable } from "@/src/components/ui/Touchable";
import ArrowForwardIosWhite from "@/assets/icons/arrow_forward_ios_white.svg";
import { PaymentFooterProps } from "@/src/types/payment";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

export const PaymentFooter: React.FC<PaymentFooterProps> = ({
  onPress,
  loading,
  hasAddress,
  safeAreaBottom,
}) => {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: safeAreaBottom + 10,
        backgroundColor: "#fff",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: "#919EAB33",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 20,
      }}
    >
      <Touchable
        activeOpacity={0.88}
        onPress={onPress}
        disabled={loading}
        style={{ borderRadius: 20, overflow: "hidden" }}
      >
        <LinearGradient
          colors={["#0F7635", "#16A34A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingVertical: 18,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "700",
                  color: "#fff",
                }}
              >
                {hasAddress ? "Confirm Order" : "Set Delivery Address"}
              </Text>
              <ArrowForwardIosWhite
                width={14}
                height={14}
              />
            </>
          )}
        </LinearGradient>
      </Touchable>
    </View>
  );
};
