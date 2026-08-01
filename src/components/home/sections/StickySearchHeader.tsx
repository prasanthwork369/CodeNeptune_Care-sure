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

interface StickySearchHeaderProps {
  visible: SharedValue<number>;
  onPressSearch: () => void;
  onPressUpload: () => void;
}

/**
 * Floating logo + search bar shown once the inline hero search bar has
 * scrolled past the top (see useStickySearchBar). Sits above the
 * ScrollView so it can use a real BlurView backdrop, which a
 * stickyHeaderIndices section can't host cleanly.
 */
export const StickySearchHeader: React.FC<StickySearchHeaderProps> = React.memo(
  ({ visible, onPressSearch, onPressUpload }) => {
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

    // dimezisBlurView re-blurs the feed behind it every frame while attached
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
          experimentalBlurMethod="dimezisBlurView"
          style={{ overflow: "hidden" }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: exactScale(10),
              paddingTop: insets.top + exactScale(5),
              paddingBottom: exactScale(14),
              paddingHorizontal: exactScale(16),
            }}
          >
            <View
              style={{
                width: exactScale(60),
                height: exactScale(60),
                borderRadius: exactScale(10),
                borderWidth: 1.05,
                borderColor: "#919EAB33",
                paddingVertical: exactScale(10),
                backgroundColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#919EAB0A",
                shadowOffset: { width: 0, height: exactScale(10) },
                shadowRadius: 20,
                shadowOpacity: 1,
                elevation: 1,
              }}
            >
              <icons.logo width={exactScale(32)} height={exactScale(32)} />
            </View>

            <Touchable
              onPress={onPressSearch}
              activeOpacity={1}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                height: exactScale(60),
                borderRadius: exactScale(10),
                borderWidth: 1.05,
                borderColor: "#919EAB33",
                paddingHorizontal: exactScale(10),
                backgroundColor: "#FFFFFF",
                shadowColor: "#919EAB0A",
                shadowOffset: { width: 0, height: exactScale(10) },
                shadowRadius: 20,
                shadowOpacity: 1,
                elevation: 1,
              }}
            >
              <icons.search width={exactScale(18)} height={exactScale(18)} />
              <Text
                numberOfLines={1}
                style={{
                  flex: 1,
                  marginLeft: exactScale(8),
                  fontSize: exactScale(14),
                  fontWeight: "500",
                  color: "#6A6A6A",
                }}
              >
                Search affordable substitute
              </Text>
              <Touchable
                onPress={onPressUpload}
                className="border-l border-[#919EAB33] pl-3 ml-1"
              >
                <icons.uploadActive
                  width={exactScale(22)}
                  height={exactScale(22)}
                />
              </Touchable>
            </Touchable>
          </View>
        </BlurView>

        {/* Smoothstep alpha ramp — a linear ramp with few stops bands visibly on Android */}
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
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: searchBarBottom,
            height: exactScale(30),
          }}
          pointerEvents="none"
        />
      </Animated.View>
    );
  },
);
StickySearchHeader.displayName = "StickySearchHeader";
