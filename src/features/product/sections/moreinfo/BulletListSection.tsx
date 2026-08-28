import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./moreinfo.styles";

// Tinted callout box with orange dots, matching the web side-effects card.
export const BulletListSection: React.FC<{ points: string[] }> = ({
  points,
}) => (
  <View style={s.bulletContainer}>
    {points.map((point, index) => (
      <View
        key={`${point}-${index}`}
        style={[
          s.bulletRow,
          { marginTop: index === 0 ? 0 : exactScale(8) },
        ]}
      >
        <View style={s.bulletDot} />
        <Text style={s.bulletText}>
          {point}
        </Text>
      </View>
    ))}
  </View>
);
