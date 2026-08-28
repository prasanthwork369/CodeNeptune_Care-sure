import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useSubstituteRequest } from "@/src/features/search/hooks/useSubstituteRequest";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./product-sections.styles";

interface NoSubstituteBannerProps {
  productId: string;
  medicineUuid?: string;
  productName?: string;
  safeAreaBottom: number;
}

export const NoSubstituteBanner: React.FC<NoSubstituteBannerProps> = ({
  productId,
  medicineUuid,
  safeAreaBottom,
}) => {
  const { requestSubstitute, isPending, isSuccess } = useSubstituteRequest();

  const handleRequest = () => {
    const targetId = medicineUuid || productId;
    requestSubstitute(targetId);
  };

  return (
    <View
      style={[
        s.noSubRoot,
        { paddingBottom: safeAreaBottom + exactScale(16) },
      ]}
    >
      {/* Top Row: Icon + Label */}
      <View style={s.noSubTopRow}>
        <icons.info_error width={22} height={22} />
        <Text style={s.noSubTitle}>
          No substitute available
        </Text>
      </View>

      {/* Bottom Row: Full-width Request Button */}
      <Touchable
        onPress={handleRequest}
        disabled={isPending || isSuccess}
        activeOpacity={0.85}
        style={[
          s.noSubBtn,
          { backgroundColor: isSuccess ? "#10B981" : "#FF383C" },
        ]}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={s.noSubBtnText}>
            {isSuccess ? "Substitute Requested" : "Request a Substitute"}
          </Text>
        )}
      </Touchable>
    </View>
  );
};
