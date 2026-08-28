import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { exactScale } from "@/src/utils/exactScale";
import { GlassHeader } from "@/src/components/ui/GlassHeader";
import { styles as s } from "./ScreenHeader.styles";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  backgroundColor?: string;
  showBorder?: boolean;
  rightSlot?: React.ReactNode;
  variant?: "default" | "glass";
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  backgroundColor,
  showBorder = true,
  rightSlot,
  variant = "default",
}) => {
  if (variant === "glass") {
    return (
      <GlassHeader
        title={title}
        onBack={onBack}
        rightSlot={rightSlot}
        showBorder={showBorder}
      />
    );
  }
  const router = useNav();
  const insets = useSafeAreaInsets();
  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={[
        s.headerContainer,
        {
          ...(showBorder && {
            borderBottomWidth: 1,
            borderBottomColor: "#919EAB33",
          }),
          backgroundColor: backgroundColor || "#FFFFFF",
          paddingTop: Math.max(insets.top, exactScale(20)) + exactScale(8),
        },
      ]}
    >
      <View style={s.contentRow}>
        <Touchable
          onPress={handleBack}
          style={s.backButton}
        >
          <icons.arrow_back
            width={exactScale(18)}
            height={exactScale(18)}
            fill={colors.text}
          />
        </Touchable>
        <Text
          style={s.titleText}
          numberOfLines={1}
        >
          {title}
        </Text>
        {rightSlot}
      </View>
    </View>
  );
};
