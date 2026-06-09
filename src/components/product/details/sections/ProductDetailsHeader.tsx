import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { useCart } from "@/src/hooks/queries/useCart";
import { ProductDetailsHeaderProps } from "@/src/types/product";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Alert, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({
  title,
  backgroundColor,
  showBorder = true,
  onBack,
}) => {
  const { totalItems: cartCount } = useCart();
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  const handleShare = async () => {
    try {
      await Share.share({
        message: title
          ? `Check out ${title} on CareSure!`
          : "Check out this product on CareSure!",
      });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View
      style={{
        backgroundColor: backgroundColor || "transparent",
        paddingTop: Math.max(insets.top, 20) + 8,
        ...(showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: "#919EAB33",
        }),
      }}
      className="px-4 pb-2 z-20"
    >
      <View className="flex-row items-center justify-between" style={{ height: 48 }}>
        <Touchable
          onPress={handleBack}
          className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
          style={{ width: 44, height: 44 }}
          activeOpacity={0.7}
        >
          <icons.arrow_back width={18} height={18} fill={colors.text} />
        </Touchable>

        <View className="flex-row items-center gap-x-3">
          <Touchable
            onPress={() => router.push("/search")}
            className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
            style={{ width: 44, height: 44 }}
            activeOpacity={0.7}
          >
            <icons.search width={22} height={22} />
          </Touchable>

          <Touchable
            onPress={() => router.push("/(modal)/cart")}
            className="bg-white rounded-full border border-[#919EAB33] items-center justify-center relative"
            style={{ width: 44, height: 44 }}
            activeOpacity={0.7}
          >
            <icons.cart_svg width={24} height={24} />
            {cartCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: "#FF3B30",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 3,
                }}
              >
                <Text className="text-[10px] font-inter-bold text-white leading-none">
                  {cartCount}
                </Text>
              </View>
            )}
          </Touchable>

          <Touchable
            onPress={handleShare}
            className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
            style={{ width: 44, height: 44 }}
            activeOpacity={0.7}
          >
            <icons.share width={22} height={22} />
          </Touchable>
        </View>
      </View>
    </View>
  );
};
