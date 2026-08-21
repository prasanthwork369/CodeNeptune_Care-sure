import React from "react"; // Re-saved to trigger Metro resolver

import { moderateScale } from "@/src/utils/exactScale";
import { Text, View } from "react-native";
import Svg, {
  Defs,
  Stop,
  LinearGradient as SvgLinearGradient,
  Text as SvgText,
} from "react-native-svg";

export const SearchColumnHeaders = ({ colWidth }: { colWidth: number }) => {
  // Safety check for colWidth to prevent native crashes on Android
  const safeColWidth = Math.max(0, colWidth || 0);

  return (
    <View style={{ backgroundColor: "#FBFBFB" }} className="flex-row mx-4">
      <View className="flex-1 items-center justify-center py-3">
        <Text
          style={{ letterSpacing: 0.5, fontSize: moderateScale(11) }}
          className="font-inter-bold text-brand-subtext uppercase"
        >
          YOU SEARCHED
        </Text>
      </View>
      <View className="flex-1 items-center justify-center py-3">
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
