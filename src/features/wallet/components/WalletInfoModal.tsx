import React from "react";
import { Text, View } from "react-native";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import { styles as s } from "./WalletInfoModal.styles";

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
      backgroundStyle={s.sheetBackground}
    >
      <BottomSheetView
        style={[
          s.contentContainer,
          {
            paddingBottom: Math.max(
              adjustedBottom + exactScale(24),
              exactScale(40),
            ),
          },
        ]}
      >
        <Text style={s.title}>
          How Your Balance Is Used
        </Text>

        <View style={s.listContainer}>
          <View style={s.listItemRow}>
            <Text style={s.bulletPoint}>
              •
            </Text>
            <Text style={s.bulletText}>
              Your added money is used first when placing an order Corporate
              credits are applied after that
            </Text>
          </View>
        </View>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
