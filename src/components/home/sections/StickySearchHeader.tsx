import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
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
export const StickySearchHeader: React.FC<StickySearchHeaderProps> = ({
  visible,
  onPressSearch,
  onPressUpload,
}) => {
  const insets = useSafeAreaInsets();
  const [interactive, setInteractive] = useState(false);

  useAnimatedReaction(
    () => visible.value > 0.5,
    (current, previous) => {
      if (current !== previous) runOnJS(setInteractive)(current);
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateY: (1 - visible.value) * -12 }],
  }));

  return (
    <Animated.View
      pointerEvents={interactive ? "auto" : "none"}
      style={[
        animatedStyle,
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          // Above useScrollStatusBar's solid white safe-area mask (zIndex
          // 101) -- otherwise that mask paints over this header's blur once
          // scrolled past its reveal threshold.
          zIndex: 110,
        },
      ]}
    >
      <BlurView
        intensity={10}
        tint="dark"
        experimentalBlurMethod="dimezisBlurView"
        style={{ overflow: "hidden" }}
      >
        {/* Softens the blur's bottom edge into the white page content below
            instead of cutting off sharply */}
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,1)"]}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 32,
          }}
          pointerEvents="none"
        />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingTop: insets.top + 5,
            paddingBottom: 14,
            paddingHorizontal: 16,
            // No fill here -- the Figma spec is backdrop-filter: blur() only,
            // so the BlurView itself is the entire background treatment.
          }}
        >
          <View
            style={{
              width: 55,
              height: 55,
              borderRadius: 10,
              borderWidth: 1.05,
              borderColor: "#919EAB33",
              paddingVertical: 10,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#919EAB0A",
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 20,
              shadowOpacity: 1,
              elevation: 1,
            }}
          >
            <icons.logo width={32} height={32} />
          </View>

          <Touchable
            onPress={onPressSearch}
            activeOpacity={1}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              height: 55,
              borderRadius: 10,
              borderWidth: 1.05,
              borderColor: "#919EAB33",
              paddingHorizontal: 10,
              backgroundColor: "#FFFFFF",
              shadowColor: "#919EAB0A",
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 20,
              shadowOpacity: 1,
              elevation: 1,
            }}
          >
            <icons.search width={18} height={18} />
            <Text
              numberOfLines={1}
              style={{
                flex: 1,
                marginLeft: 8,
                fontSize: 14,
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
              <icons.uploadActive width={22} height={22} />
            </Touchable>
          </Touchable>
        </View>
      </BlurView>
    </Animated.View>
  );
};
