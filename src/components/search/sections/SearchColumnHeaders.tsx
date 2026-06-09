import React from 'react'; // Re-saved to trigger Metro resolver

import { View, Text } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';

export const SearchColumnHeaders = ({ colWidth }: { colWidth: number }) => {
    // Safety check for colWidth to prevent native crashes on Android
    const safeColWidth = Math.max(0, colWidth || 0);

    return (
        <View className="flex-row mx-4 mt-2">
            <View className="flex-1 items-center justify-center pb-3">
                <Text style={{ letterSpacing: 0.5 }} className="text-[11px] font-inter-bold text-brand-subtext uppercase">
                    YOU SEARCHED
                </Text>
            </View>
            <View className="flex-1 items-center justify-center pb-3">
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
                        strokeWidth={0.5}
                        fontSize={11}
                        fontFamily="Inter-Bold"
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
