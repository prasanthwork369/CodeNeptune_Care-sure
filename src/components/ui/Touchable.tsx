import * as Haptics from "expo-haptics";
import React, { useCallback, useRef } from "react";
/* eslint-disable no-restricted-imports */
import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
/* eslint-enable no-restricted-imports */

interface TouchableProps extends TouchableOpacityProps {
  throttleMs?: number;
  /** Set false to opt a specific press out of the default light haptic tap. */
  haptic?: boolean;
}

export const Touchable: React.FC<TouchableProps> = ({
  onPress,
  throttleMs = 500,
  haptic = false,
  ...props
}) => {
  const lastPress = useRef(0);

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      const now = Date.now();
      if (now - lastPress.current < throttleMs) return;
      lastPress.current = now;
      if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress?.(e);
    },
    [onPress, throttleMs, haptic],
  );

  return (
    <TouchableOpacity
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={onPress ? handlePress : undefined}
      {...props}
    />
  );
};
