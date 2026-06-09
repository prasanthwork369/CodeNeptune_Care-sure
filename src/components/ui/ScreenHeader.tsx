import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  backgroundColor?: string;
  showBorder?: boolean;
  rightSlot?: React.ReactNode;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  backgroundColor,
  showBorder = true,
  rightSlot,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={{
        ...(showBorder && {
          borderBottomWidth: 1,
          borderBottomColor: "#919EAB33",
        }),
        ...(backgroundColor && { backgroundColor }),
        paddingTop: Math.max(insets.top, 20) + 8,
      }}
      className="px-4 pb-2"
    >
      <View style={{ height: 48 }} className="flex-row items-center">
        <Touchable
          onPress={handleBack}
          className="mr-3 bg-white rounded-full border border-[#919EAB33] items-center justify-center"
          style={{ width: 44, height: 44 }}
        >
          <icons.arrow_back width={18} height={18} fill={colors.text} />
        </Touchable>
        <Text
          className="text-[18px] font-inter-bold flex-1"
          style={{ color: "#333232" }}
          numberOfLines={1}
        >
          {title}
        </Text>
        {rightSlot}
      </View>
    </View>
  );
};
