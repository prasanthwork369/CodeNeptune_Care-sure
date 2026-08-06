import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useSubstituteRequest } from "@/src/hooks/queries/useSubstituteRequest";
import { exactScale, moderateScale } from "@/src/utils/exactScale";


interface NoSubstituteBannerProps {
  productId: string;
  medicineUuid?: string;
  productName?: string;
  safeAreaBottom: number;
}

export const NoSubstituteBanner: React.FC<NoSubstituteBannerProps> = ({
  productId,
  medicineUuid,
  productName,
  safeAreaBottom,
}) => {
  const { requestSubstitute, isPending, isSuccess } = useSubstituteRequest();

  const handleRequest = () => {
    const targetId = medicineUuid || productId;
    requestSubstitute(targetId);
  };

  return (
    <View
      style={{
        paddingBottom: safeAreaBottom + 16,
        shadowColor: "#919EAB33",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 12,
      }}
      className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-4 border-t border-[#F3F4F6]"
    >
      {/* Top Row: Icon + Label */}
      <View className="flex-row items-center mb-4">
        <icons.info_error width={22} height={22} />
        <Text
          className="font-inter-bold text-[#111827] ml-2.5"
          style={{ fontSize: moderateScale(16) }}
        >
          No substitute available
        </Text>
      </View>

      {/* Bottom Row: Full-width Request Button */}
      <Touchable
        onPress={handleRequest}
        disabled={isPending || isSuccess}
        activeOpacity={0.85}
        style={{
          backgroundColor: isSuccess ? "#10B981" : "#FF383C",
          borderRadius: exactScale(12),
          height: exactScale(48),
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text
            className="font-inter-bold text-white text-center"
            style={{ fontSize: moderateScale(15) }}
          >
            {isSuccess ? "Substitute Requested" : "Request a Substitute"}
          </Text>
        )}
      </Touchable>
    </View>
  );
};
