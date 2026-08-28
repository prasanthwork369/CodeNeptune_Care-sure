import React from "react"; // Re-saved to trigger Metro resolver

import { moderateScale } from "@/src/utils/exactScale";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText,
} from "react-native-svg";
import { styles as s } from "./SearchColumnHeaders.styles";

export const SearchColumnHeaders = ({ colWidth }: { colWidth: number }) => {
  // Safety check for colWidth to prevent native crashes on Android
  const safeColWidth = Math.max(0, colWidth || 0);

  return (
    <View style={s.headerRow}>
      <View style={s.headerCell}>
        <Text style={s.youSearchedText}>YOU SEARCHED</Text>
      </View>
      <View style={s.headerCell}>
        <Svg height={14} width={safeColWidth}>
          <Defs>
            <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#C22923" stopOpacity="1" />
              <Stop offset="1" stopColor="#FF8A00" stopOpacity="1" />
            </SvgLinearGradient>
          </Defs>
          <SvgText
            fill="url(#grad)"
            stroke="url(#grad)"
            strokeWidth={0.3}
            fontSize={moderateScale(11)}
            fontWeight="700"
            letterSpacing={0.5}
            x={safeColWidth / 2}
            y={12}
            textAnchor="middle"
          >
            OUR RECOMMENDED
          </SvgText>
        </Svg>
      </View>
    </View>
  );
};
