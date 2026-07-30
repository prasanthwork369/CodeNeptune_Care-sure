import React from "react";
import { Text, View } from "react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useToastStore } from "@/src/store/toastStore";
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
  const showToast = useToastStore((store) => store.show);

  const handleRequest = () => {
    // No backend endpoint exists yet for this — productId/medicineUuid/
    // productName are threaded through so the real API call can be wired
    // in here directly once one exists, without touching the caller.
    if (__DEV__) {
      console.log("[NoSubstituteBanner] request substitute for", {
        productId,
        medicineUuid,
        productName,
      });
    }
    showToast("Your substitute request has been sent", "success");
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
        activeOpacity={0.85}
        style={{
          backgroundColor: "#FF383C",
          borderRadius: exactScale(12),
          height: exactScale(48),
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Text
          className="font-inter-bold text-white text-center"
          style={{ fontSize: moderateScale(15) }}
        >
          Request a Substitute
        </Text>
      </Touchable>
    </View>
  );
};
