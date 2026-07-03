import React from "react";
import { View } from "react-native";

export function SectionCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: any;
}) {
  return (
    <View
      className={`bg-white rounded-lg mx-base ${className}`}
      style={[{ borderWidth: 1, borderColor: "#F0F1F3", elevation: 0 }, style]}
    >
      {children}
    </View>
  );
}
