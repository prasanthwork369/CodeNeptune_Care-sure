import React from "react";
import { Text, View } from "react-native";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface WalletInfoModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const WalletInfoModal: React.FC<WalletInfoModalProps> = ({
  isVisible,
  onClose,
}) => {
  const adjustedBottom = useAdjustedBottomInset();

  return (
    <GorhomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          padding: exactScale(32),
          paddingBottom: Math.max(
            adjustedBottom + exactScale(24),
            exactScale(40),
          ),
        }}
      >
        <Text
          className="font-inter-bold text-[#212B36]"
          style={{ fontSize: moderateScale(18), marginBottom: exactScale(24) }}
        >
          How Your Balance Is Used
        </Text>

        <View style={{ gap: exactScale(16) }}>
          <View className="flex-row items-start">
            <Text
              className="font-inter text-[#6A6A6A]"
              style={{
                fontSize: moderateScale(16),
                marginTop: exactScale(-2),
                marginRight: exactScale(8),
              }}
            >
              •
            </Text>
            <Text
              className="font-inter text-[#6A6A6A] flex-1"
              style={{
                fontSize: moderateScale(12),
                lineHeight: moderateScale(24),
              }}
            >
              Your added money is used first when placing an order Corporate
              credits are applied after that
            </Text>
          </View>
        </View>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
