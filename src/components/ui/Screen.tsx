import React from "react";
import { ViewStyle } from "react-native";
import { SafeAreaView, Edge } from "react-native-safe-area-context";

interface ScreenProps {
  children: React.ReactNode;
  edges?: Edge[];
  style?: ViewStyle;
  className?: string;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  edges = ["bottom"],
  style,
  className,
}) => (
  <SafeAreaView
    edges={edges}
    style={[{ flex: 1 }, style]}
    className={className}
  >
    {children}
  </SafeAreaView>
);
