import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./ViewAllCard.styles";

interface ViewAllCardProps {
  width: number;
  onPress: () => void;
  onPressIn?: () => void;
  /** Measured row height, so the card stands level with the product cards. */
  height?: number;
  /** Section theme colour — matches the product cards beside it. */
  accentColor?: string;
  /** Catalogue size from the backend; the subtitle is hidden without it. */
  totalCount?: number;
}

const DEFAULT_ACCENT = "#0F7635";

export const ViewAllCard: React.FC<ViewAllCardProps> = ({
  width,
  onPress,
  onPressIn,
  height,
  accentColor = DEFAULT_ACCENT,
  totalCount,
}) => (
  <Touchable
    onPress={onPress}
    onPressIn={onPressIn}
    activeOpacity={0.85}
    accessibilityRole="button"
    style={[
      s.cardRoot,
      {
        width,
        height: height || undefined,
      },
    ]}
  >
    <View
      style={[
        s.iconCircle,
        {
          backgroundColor: `${accentColor}1A`,
        },
      ]}
    >
      <icons.arrow_right
        width={exactScale(30)}
        height={exactScale(30)}
        color={accentColor}
      />
    </View>

    <Text
      style={[
        s.titleText,
        { color: accentColor },
      ]}
    >
      View All
    </Text>

    {totalCount != null && (
      <Text style={s.subtitleText}>
        See {totalCount}+ Products
      </Text>
    )}
  </Touchable>
);
