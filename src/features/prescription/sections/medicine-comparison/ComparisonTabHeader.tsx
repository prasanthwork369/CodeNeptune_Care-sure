import React from "react";
import { Text, View } from "react-native";
import { styles as s } from "./medicine-comparison.styles";

export const ComparisonTabHeader: React.FC = () => (
  <View style={s.tabHeaderRoot}>
    <View style={s.tabHeaderLeft}>
      <Text style={s.tabHeaderLeftText}>
        Medicine in Prescription
      </Text>
    </View>
    <View style={s.tabHeaderRight}>
      <Text style={s.tabHeaderRightText}>
        Our Recommendation
      </Text>
    </View>
  </View>
);
