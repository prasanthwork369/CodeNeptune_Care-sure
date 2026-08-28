import React from "react";
import { View, Text } from "react-native";
import { styles as s } from "./SearchEmptyState.styles";

export const SearchEmptyState = ({ query }: { query: string }) => (
  <View style={s.container}>
    <Text style={s.text}>
      No results for &quot;{query}&quot;
    </Text>
  </View>
);
