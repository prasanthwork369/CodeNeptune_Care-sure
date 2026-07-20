import React, { memo, ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { OfferShine } from "./OfferShine";

export interface OfferBadgeProps {
  children: ReactNode;
  borderRadius?: number;
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Preserves a badge's existing visual styles while adding only its gloss. */
export const OfferBadge = memo(function OfferBadge({
  children,
  borderRadius = 0,
  enabled = true,
  style,
}: OfferBadgeProps) {
  return (
    <View style={[{ position: "relative", overflow: "hidden", borderRadius }, style]}>
      {children}
      <OfferShine borderRadius={borderRadius} enabled={enabled} />
    </View>
  );
});
