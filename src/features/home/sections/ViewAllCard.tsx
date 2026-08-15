import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";

interface ViewAllCardProps {
  width: number;
  onPress: () => void;
  /** Measured row height, so the card stands level with the product cards. */
  height?: number;
  /** Section theme colour — matches the product cards beside it. */
  accentColor?: string;
  /** Catalogue size from the backend; the subtitle is hidden without it. */
  totalCount?: number;
}

const DEFAULT_ACCENT = "#0F7635";

// Trailing card in a horizontal product list, so the last scroll lands on a
// way into the full catalogue instead of dead space.
export const ViewAllCard: React.FC<ViewAllCardProps> = ({
  width,
  onPress,
  height,
  accentColor = DEFAULT_ACCENT,
  totalCount,
}) => (
  <Touchable
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    className="bg-white rounded-[12px] items-center justify-center"
    style={{
      width,
      // Measured from the row so the card stands level with the product cards.
      height: height || undefined,
      // Border matches the product cards beside it.
      borderWidth: 0.77,
      borderColor: "#919EAB33",
      paddingHorizontal: exactScale(12),
    }}
  >
    <View
      className="items-center justify-center"
      style={{
        width: exactScale(64),
        height: exactScale(64),
        borderRadius: exactScale(32),
        // Same tint the product cards use for their discount badge.
        backgroundColor: `${accentColor}1A`,
        marginBottom: exactScale(14),
      }}
    >
      {/* fill="currentColor" in the SVG, so `color` tints it. */}
      <icons.arrow_right
        width={exactScale(30)}
        height={exactScale(30)}
        color={accentColor}
      />
    </View>

    <Text
      className="font-inter-bold text-center"
      style={{ fontSize: moderateScale(16), color: accentColor }}
    >
      View All
    </Text>

    {totalCount != null && (
      <Text
        className="font-inter-medium text-brand-subtext text-center"
        style={{ fontSize: moderateScale(13), marginTop: exactScale(6) }}
      >
        See {totalCount}+ Products
      </Text>
    )}
  </Touchable>
);
