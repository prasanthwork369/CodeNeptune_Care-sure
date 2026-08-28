import { KeyValueRow } from "@/src/features/product/types";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./moreinfo.styles";

// Label/value rows on a warm tint, matching the web fact box.
export const KeyValueSection: React.FC<{ rows: KeyValueRow[] }> = ({
  rows,
}) => (
  <View>
    {rows.map((row, index) => (
      <View
        key={row.label}
        style={[
          s.keyValueRow,
          { marginTop: index === 0 ? 0 : exactScale(8) },
        ]}
      >
        <Text style={s.keyValueLabel}>
          {row.label}
        </Text>
        <Text style={s.keyValueVal}>
          {row.value}
        </Text>
      </View>
    ))}
  </View>
);
