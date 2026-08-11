import React from "react";
import { StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

interface StickyFooterProps {
  children: React.ReactNode;
  safeAreaBottom?: number;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Shared bottom action area. It owns safe-area spacing and keeps a lone CTA
 * at the 340px design width while remaining fluid on smaller devices.
 */
export const StickyFooter: React.FC<StickyFooterProps> = ({
  children,
  safeAreaBottom = 0,
  style,
  contentStyle,
  testID,
}) => (
  <View
    testID={testID}
    style={[
      styles.footer,
      { paddingBottom: safeAreaBottom + exactScale(12) },
      style,
    ]}
  >
    <View style={[styles.content, contentStyle]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  footer: {
    backgroundColor: "#FFFFFF",
    borderTopColor: "#F3F4F6",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingHorizontal: 16,
    shadowColor: "#919EAB",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 12,
  },
  content: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 340,
  },
});
