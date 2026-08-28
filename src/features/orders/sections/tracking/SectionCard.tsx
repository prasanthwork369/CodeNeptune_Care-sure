import type { StyleProp, ViewStyle } from "react-native";
import React from "react";
import { View } from "react-native";
import { styles as s } from "./tracking.styles";

export function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[s.sectionCard, style]}>
      {children}
    </View>
  );
}
