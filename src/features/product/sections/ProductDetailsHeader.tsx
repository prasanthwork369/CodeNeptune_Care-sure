import { asError } from "@/src/api/errors";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { productWebUrl } from "@/src/constants/urls";
import { colors } from "@/src/theme";
import { useCartCount } from "@/src/features/cart/hooks/useCartRead";
import { useNav } from "@/src/hooks/useNav";
import { ProductDetailsHeaderProps } from "@/src/features/product/types";
import React from "react";
import { Alert, Share, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./ProductDetailsHeader.styles";

export const ProductDetailsHeader: React.FC<ProductDetailsHeaderProps> =
  React.memo(
    ({
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
      const cartCount = useCartCount();
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

            const detailsText =
              details.length > 0 ? `\n${details.join("\n")}` : "";
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
          style={[
            s.root,
            {
              backgroundColor: backgroundColor || "transparent",
              paddingTop: Math.max(insets.top, 20) + 8,
            },
            showBorder && s.borderBottom,
          ]}
        >
          <View style={s.row}>
            <Touchable
              onPress={handleBack}
              style={s.roundBtn}
              activeOpacity={0.7}
            >
              <icons.arrow_back width={18} height={18} fill={colors.text} />
            </Touchable>

            <View style={s.actionsRow}>
              <Touchable
                onPress={() => router.push("/search")}
                style={s.roundBtn}
                activeOpacity={0.7}
              >
                <icons.search width={22} height={22} />
              </Touchable>

              <Touchable
                onPress={() => router.push("/(commerce)/cart")}
                style={s.roundBtn}
                activeOpacity={0.7}
              >
                <icons.cart_svg width={24} height={24} />
                {cartCount > 0 && (
                  <View style={s.cartBadge}>
                    <Text style={s.cartBadgeText}>
                      {cartCount}
                    </Text>
                  </View>
                )}
              </Touchable>

              <Touchable
                onPress={handleShare}
                style={s.roundBtn}
                activeOpacity={0.7}
              >
                <icons.share width={22} height={22} />
              </Touchable>
            </View>
          </View>
        </View>
      );
    },
  );

ProductDetailsHeader.displayName = "ProductDetailsHeader";
