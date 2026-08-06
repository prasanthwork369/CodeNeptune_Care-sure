import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useNav } from "@/src/hooks/useNav";
import { useSubstituteRequest } from "@/src/hooks/queries/useSubstituteRequest";
import { moderateScale } from "@/src/utils/exactScale";
import {
  cartCounterStyles as cc,
  searchCardStyles as s,
} from "./search.styles";


interface SearchNoSubstituteCardProps {
  data: {
    id: string;
    productId?: string;
    searched: {
      name: string;
      manufacturer?: string;
      description?: string;
      price: number | null; // absent when the backend omits a price
      status: string;
    };
  };
}

export const SearchNoSubstituteCard: React.FC<SearchNoSubstituteCardProps> = ({
  data,
}) => {
  const router = useNav();
  const { requestSubstitute, isPending, isSuccess } = useSubstituteRequest();

  const handleCardPress = () => {
    router.push({
      pathname: "/product/[id]",
      params: { id: data.productId ?? data.id, fromNoSubstitute: "true" },
    });
  };

  const handleRequest = () => {
    requestSubstitute(data.id ?? data.productId);
  };

  return (
    <Touchable
      activeOpacity={0.5}
      onPress={handleCardPress}
      style={{ borderWidth: 1, borderColor: "#919EAB33" }}
      className="w-full rounded-[12px] bg-white overflow-hidden mb-5"
    >
      {/* Top Section: Split */}
      <View className="flex-row w-full">
        {/* Left Side — searched product */}
        <View className="flex-1 p-4">
          <View className="mb-6">
            <Text
              style={s.name}
              className="font-inter-semibold text-brand-text mb-1 leading-snug tracking-tight"
            >
              {data.searched.name}
            </Text>
            {data.searched.description ? (
              <Text
                style={s.desc}
                className="font-inter-medium text-brand-subtext mt-0.5"
                numberOfLines={1}
              >
                {data.searched.description}
              </Text>
            ) : null}
            {data.searched.manufacturer ? (
              <Text
                style={s.desc}
                className="font-inter-medium text-brand-subtext mt-0.5"
                numberOfLines={1}
              >
                {data.searched.manufacturer}
              </Text>
            ) : null}
          </View>
          <View className="mt-auto">
            {data.searched.price != null && (
              <Text
                style={s.price}
                className="font-inter-extrabold text-brand-text mb-1.5 tracking-tight"
              >
                ₹{Number(data.searched.price).toFixed(2)}
              </Text>
            )}
            <Text
              style={s.savings}
              className="font-inter-semibold text-[#FF383C] mt-1"
            >
              {data.searched.status}
            </Text>
          </View>
        </View>

        {/* Right Side — no substitute message */}
        <View className="flex-1 p-4 bg-[#FEF1F1] justify-start">
          <Text
            className="font-inter-bold text-[#730404]"
            style={{
              fontSize: moderateScale(14),
              lineHeight: moderateScale(20),
            }}
          >
            Sorry! We couldn&apos;t find a substitute
          </Text>
        </View>
      </View>

      {/* Horizontal Divider Line */}
      <View className="h-[1px] w-full bg-[#EAEAEA]" />

      {/* Bottom Section: Uniform Actions Row */}
      <View className="flex-row justify-between items-center px-4 py-3.5 bg-white">
        <View className="flex-row items-center flex-1 min-w-0">
          <icons.info_error width={18} height={18} />
          <Text
            numberOfLines={2}
            style={[s.sameComp, { flexShrink: 1 }]}
            className="font-inter-semibold text-brand-text ml-3"
          >
            No substitute available
          </Text>
        </View>

        <Touchable
          onPress={handleRequest}
          disabled={isPending || isSuccess}
          activeOpacity={0.85}
          style={[
            cc.addBtn,
            {
              borderColor: isSuccess ? "#10B981" : "#FF383C",
              backgroundColor: isSuccess ? "#ECFDF5" : "transparent",
              flexShrink: 0,
            },
          ]}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#FF383C" />
          ) : (
            <Text
              style={[s.label, { color: isSuccess ? "#10B981" : "#FF383C" }]}
              className="font-inter-bold"
            >
              {isSuccess ? "Requested" : "Request"}
            </Text>
          )}
        </Touchable>
      </View>
    </Touchable>
  );
};
