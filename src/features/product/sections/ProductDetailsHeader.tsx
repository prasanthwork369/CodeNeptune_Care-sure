import { asError } from "@/src/api/errors";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { productWebUrl } from "@/src/constants/urls";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { colors } from "@/src/theme";
import { useCart } from "@/src/hooks/queries/useCart";
import { useNav } from "@/src/hooks/useNav";
import { ProductDetailsHeaderProps } from "@/src/features/product/types";
import React from "react";
import { Alert, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> = ({
  title,
  backgroundColor,
  showBorder = true,
  onBack,
  productId,
  productType,
  slug,
  packLabel,
  price,
  manufacturer,
  dosageForm,
}) => {
  const { totalItems: cartCount } = useCart();
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  const handleShare = async () => {
    try {
      let message = title
        ? `Check out ${title} on CareSure!`
        : "Check out this product on CareSure!";

      if (productId) {
        const details = [];
        if (dosageForm) details.push(`Dosage Form: ${dosageForm}`);
        if (packLabel) details.push(`Pack Size: ${packLabel}`);
        if (price) details.push(`Price: ₹${price}`);
        if (manufacturer) details.push(`Manufacturer: ${manufacturer}`);

        const detailsText = details.length > 0 ? `\n${details.join("\n")}` : "";
        // One https link only. Messaging apps linkify http(s) but not custom
        // schemes, so a caresure:// line would render as unpressable grey text.
        // Once App Links are verified this URL opens the app; until then it opens
        // the web — one link handles both, which is the point of App Links.
        message = `💊 *${title}* on CareSure\n${detailsText}\n\n${productWebUrl(productId, productType, slug)}`;
      }

      await Share.share({
        message,
      });
    } catch (e) {
      Alert.alert("Error", asError(e).message);
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
      <View
        className="flex-row items-center justify-between"
        style={{ height: exactScale(48) }}
      >
        <Touchable
          onPress={handleBack}
          className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
          style={{ width: exactScale(44), height: exactScale(44) }}
          activeOpacity={0.7}
        >
          <icons.arrow_back width={18} height={18} fill={colors.text} />
        </Touchable>

        <View className="flex-row items-center gap-x-3">
          <Touchable
            onPress={() => router.push("/search")}
            className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
            style={{ width: exactScale(44), height: exactScale(44) }}
            activeOpacity={0.7}
          >
            <icons.search width={22} height={22} />
          </Touchable>

          <Touchable
            onPress={() => router.push("/(stack)/cart")}
            className="bg-white rounded-full border border-[#919EAB33] items-center justify-center relative"
            style={{ width: exactScale(44), height: exactScale(44) }}
            activeOpacity={0.7}
          >
            <icons.cart_svg width={24} height={24} />
            {cartCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  minWidth: exactScale(16),
                  height: exactScale(16),
                  borderRadius: exactScale(8),
                  backgroundColor: "#FF3B30",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingHorizontal: 3,
                }}
              >
                <Text
                  className="font-inter-bold text-white leading-none"
                  style={{ fontSize: moderateScale(10) }}
                >
                  {cartCount}
                </Text>
              </View>
            )}
          </Touchable>

          <Touchable
            onPress={handleShare}
            className="bg-white rounded-full border border-[#919EAB33] items-center justify-center"
            style={{ width: exactScale(44), height: exactScale(44) }}
            activeOpacity={0.7}
          >
            <icons.share width={22} height={22} />
          </Touchable>
        </View>
      </View>
    </View>
  );
};
