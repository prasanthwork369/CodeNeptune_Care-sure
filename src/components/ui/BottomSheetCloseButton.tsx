import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import React from "react";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

type BottomSheetCloseButtonProps = Pick<
  BottomSheetBackdropProps,
  "animatedIndex"
> & {
  onPress: () => void;
} & (
    | {
        /** Distance from the bottom of the backdrop where the sheet starts (e.g. "50%"). Use for fixed snap points. */
        bottomOffset: number | `${number}%`;
        animatedPosition?: never;
      }
    | {
        /** Sheet's animated top-edge position (in px from screen top). Use for dynamically-sized sheets. */
        animatedPosition: BottomSheetBackdropProps["animatedPosition"];
        bottomOffset?: never;
      }
  );

export const BottomSheetCloseButton: React.FC<BottomSheetCloseButtonProps> = ({
  animatedIndex,
  animatedPosition,
  onPress,
  bottomOffset,
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animatedIndex.value,
      [-1, 0],
      [0, 1],
      Extrapolation.CLAMP,
    );

    if (animatedPosition) {
      return { opacity, height: animatedPosition.value };
    }

    return { opacity };
  });

  const containerStyle = animatedPosition
    ? {
        position: "absolute" as const,
        top: 0,
        left: 0,
        right: 0,
        justifyContent: "flex-end" as const,
        alignItems: "center" as const,
        paddingBottom: 12,
      }
    : {
        position: "absolute" as const,
        left: 0,
        right: 0,
        bottom: bottomOffset,
        alignItems: "center" as const,
        paddingBottom: 12,
      };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[containerStyle, animatedStyle]}
    >
      <Touchable
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#424242",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <icons.close_icon width={16} height={16} fill="#FFFFFF" />
      </Touchable>
    </Animated.View>
  );
};
