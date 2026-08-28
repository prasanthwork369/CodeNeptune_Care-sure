import React, { useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useSubstituteRequest } from "@/src/features/search/hooks/useSubstituteRequest";
import { usePrefetchProduct } from "@/src/features/product/hooks/useProduct";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./SearchNoSubstituteCard.styles";

interface SearchNoSubstituteCardProps {
  data: {
    id: string;
    productId?: string;
    searched: {
      name: string;
      manufacturer?: string;
      description?: string;
      price: number | null;
      status: string;
    };
  };
  onBeforeNavigate?: () => void;
}

export const SearchNoSubstituteCard: React.FC<SearchNoSubstituteCardProps> = ({
  data,
  onBeforeNavigate,
}) => {
  const router = useNav();
  const { requestSubstitute, isPending, isSuccess } = useSubstituteRequest();
  const prefetchProduct = usePrefetchProduct();

  const handlePrefetch = useCallback(() => {
    const productId = data.productId ?? data.id;
    if (productId) prefetchProduct(productId);
  }, [prefetchProduct, data.productId, data.id]);

  const handleCardPress = () => {
    onBeforeNavigate?.();
    router.push({
      pathname: "/product/[id]",
      params: {
        id: data.productId ?? data.id,
        fromNoSubstitute: "true",
        previewName: data.searched.name,
        previewBrand: data.searched.manufacturer || undefined,
      },
    });
  };

  const handleRequest = () => {
    requestSubstitute(data.id ?? data.productId);
  };

  return (
    <Touchable
      activeOpacity={0.5}
      onPress={handleCardPress}
      onPressIn={handlePrefetch}
      style={s.cardRoot}
    >
      {/* Top Section: Split */}
      <View style={s.splitRow}>
        {/* Left Side — searched product */}
        <View style={s.leftSide}>
          <View style={s.titleCol}>
            <Text style={s.name} numberOfLines={2}>
              {data.searched.name}
            </Text>
            {data.searched.description ? (
              <Text style={s.desc} numberOfLines={1}>
                {data.searched.description}
              </Text>
            ) : null}
            {data.searched.manufacturer ? (
              <Text style={s.desc} numberOfLines={1}>
                {data.searched.manufacturer}
              </Text>
            ) : null}
          </View>
          <View style={s.priceCol}>
            {data.searched.price != null && (
              <Text style={s.searchedPrice}>
                ₹{Number(data.searched.price).toFixed(2)}
              </Text>
            )}
            <Text style={s.searchedStatus}>{data.searched.status}</Text>
          </View>
        </View>

        {/* Right Side — no substitute message */}
        <View style={s.rightSide}>
          <Text style={s.noSubText}>
            Sorry! We couldn&apos;t find a substitute
          </Text>
        </View>
      </View>

      {/* Horizontal Divider Line */}
      <View style={s.dividerLine} />

      {/* Bottom Section */}
      <View style={s.bottomSection}>
        <View style={s.noSubRow}>
          <icons.info_error width={exactScale(18)} height={exactScale(18)} />
          <Text numberOfLines={2} style={s.noSubLabel}>
            No substitute available
          </Text>
        </View>

        <Touchable
          onPress={handleRequest}
          disabled={isPending || isSuccess}
          activeOpacity={0.85}
          style={[
            s.addBtn,
            {
              borderColor: isSuccess ? "#10B981" : "#FF383C",
              backgroundColor: isSuccess ? "#ECFDF5" : "transparent",
            },
          ]}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#FF383C" />
          ) : (
            <Text style={[s.requestText, { color: isSuccess ? "#10B981" : "#FF383C" }]}>
              {isSuccess ? "Requested" : "Request"}
            </Text>
          )}
        </Touchable>
      </View>
    </Touchable>
  );
};
