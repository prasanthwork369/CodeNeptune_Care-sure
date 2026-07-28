import { Touchable } from "@/src/components/ui/Touchable";
import { moderateScale } from "@/src/utils/exactScale";
import React, { useEffect, useRef, useState } from "react";
import { StyleProp, Text, TextStyle, View } from "react-native";
import Animated, {
  Easing,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export interface SlidingTab<T extends string> {
  key: T;
  label: string;
}

interface SlidingTabsProps<T extends string> {
  tabs: SlidingTab<T>[];
  activeKey: T;
  onTabPress: (key: T) => void;
  backgroundColor?: string;
  /** Shrinks the indicator in from each edge of its tab. */
  indicatorInset?: number;
  borderColor?: string;
  inactiveColor?: string;
  paddingVertical?: number;
  labelStyle?: StyleProp<TextStyle>;
  /** Fractional tab position from a pager. When set, the indicator follows the
   *  drag instead of animating on its own. */
  progress?: SharedValue<number>;
}

const ACTIVE_COLOR = "#0F7635";
const INACTIVE_COLOR = "#6A6A6A";
const INDICATOR_HEIGHT = 4;

// Equal-width tabs sharing one indicator that slides between them, matching the
// categories sidebar. A per-tab indicator would pop in and out instead.
export function SlidingTabs<T extends string>({
  tabs,
  activeKey,
  onTabPress,
  backgroundColor = "#FFFFFF",
  indicatorInset = 0,
  borderColor = "#EEEFF1",
  inactiveColor = INACTIVE_COLOR,
  paddingVertical = 14,
  labelStyle,
  progress,
}: SlidingTabsProps<T>) {
  const [containerWidth, setContainerWidth] = useState(0);
  const translateX = useSharedValue(0);
  const isFirstPlacement = useRef(true);

  const tabWidth = tabs.length > 0 ? containerWidth / tabs.length : 0;
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.key === activeKey),
  );

  useEffect(() => {
    // A pager drives the indicator directly, so leave it alone.
    if (progress || tabWidth === 0) return;
    const target = activeIndex * tabWidth;
    // Snap once the width is known, then animate on every later change.
    if (isFirstPlacement.current) {
      translateX.value = target;
      isFirstPlacement.current = false;
    } else {
      translateX.value = withTiming(target, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [activeIndex, tabWidth, translateX, progress]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress ? progress.value * tabWidth : translateX.value },
    ],
  }));

  return (
    <View
      style={{
        backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
      }}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <View style={{ flexDirection: "row" }}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <Touchable
              key={tab.key}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
              style={{ flex: 1, alignItems: "center", paddingVertical }}
            >
              <Text
                style={[
                  { fontSize: moderateScale(14) },
                  labelStyle,
                  {
                    fontWeight: isActive ? "700" : "500",
                    color: isActive ? ACTIVE_COLOR : inactiveColor,
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Touchable>
          );
        })}
      </View>

      {tabWidth > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              width: tabWidth,
              height: INDICATOR_HEIGHT,
            },
            indicatorStyle,
          ]}
        >
          <View
            style={{
              flex: 1,
              marginHorizontal: indicatorInset,
              backgroundColor: ACTIVE_COLOR,
              borderTopLeftRadius: INDICATOR_HEIGHT,
              borderTopRightRadius: INDICATOR_HEIGHT,
            }}
          />
        </Animated.View>
      )}
    </View>
  );
}
