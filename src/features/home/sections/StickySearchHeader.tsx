import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./StickySearchHeader.styles";

interface StickySearchHeaderProps {
  visible: SharedValue<number>;
  onPressSearch: () => void;
  onPressInSearch?: () => void;
  onPressUpload: () => void;
}

export const StickySearchHeader: React.FC<StickySearchHeaderProps> = React.memo(
  ({ visible, onPressSearch, onPressInSearch, onPressUpload }) => {
    const insets = useSafeAreaInsets();
    const [interactive, setInteractive] = useState(false);
    const [rendered, setRendered] = useState(false);

    useAnimatedReaction(
      () => visible.value > 0.5,
      (current, previous) => {
        if (current !== previous) runOnJS(setInteractive)(current);
      },
    );

    // Opacity 0 still keeps the blur attached, so track "fully hidden" separately
    useAnimatedReaction(
      () => visible.value > 0.01,
      (current, previous) => {
        if (current !== previous) runOnJS(setRendered)(current);
      },
    );

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: visible.value,
      transform: [{ translateY: (1 - visible.value) * -12 }],
    }));

    const searchBarBottom = insets.top + exactScale(65);

    const containerStyle = {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      zIndex: 110,
    };

    if (!rendered) {
      return (
        <Animated.View
          pointerEvents="none"
          style={[animatedStyle, containerStyle]}
        />
      );
    }

    return (
      <Animated.View
        pointerEvents={interactive ? "auto" : "none"}
        style={[animatedStyle, containerStyle]}
      >
        <BlurView
          intensity={10}
          tint="systemUltraThinMaterialLight"
          blurMethod="none"
          style={s.blurWrap}
        >
          <View
            style={[
              s.headerRow,
              { paddingTop: insets.top + exactScale(5) },
            ]}
          >
            <View style={s.logoBox}>
              <icons.logo width={exactScale(32)} height={exactScale(32)} />
            </View>

            <Touchable
              onPress={onPressSearch}
              onPressIn={onPressInSearch}
              activeOpacity={1}
              style={s.searchTouchable}
            >
              <icons.search width={exactScale(18)} height={exactScale(18)} />
              <Text
                numberOfLines={1}
                style={s.searchPlaceholderText}
              >
                Search affordable substitute
              </Text>
              <Touchable
                onPress={onPressUpload}
                style={s.uploadSlot}
              >
                <icons.uploadActive
                  width={exactScale(22)}
                  height={exactScale(22)}
                />
              </Touchable>
            </Touchable>
          </View>
        </BlurView>

        {/* Smoothstep alpha ramp */}
        <LinearGradient
          colors={[
            "rgba(255,255,255,1)",
            "rgba(255,255,255,1)",
            "rgba(255,255,255,0.92)",
            "rgba(255,255,255,0.75)",
            "rgba(255,255,255,0.5)",
            "rgba(255,255,255,0.25)",
            "rgba(255,255,255,0.08)",
            "rgba(255,255,255,0)",
          ]}
          locations={[0, 0.47, 0.55, 0.64, 0.73, 0.82, 0.91, 1]}
          style={[
            s.gradientOverlay,
            { top: searchBarBottom },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    );
  },
);
StickySearchHeader.displayName = "StickySearchHeader";
