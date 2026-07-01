import React, { useCallback, useRef } from "react";
// eslint-disable-next-line no-restricted-imports
import { GestureResponderEvent, TouchableOpacity, TouchableOpacityProps } from "react-native";

interface TouchableProps extends TouchableOpacityProps {
  throttleMs?: number;
}

export const Touchable: React.FC<TouchableProps> = ({
  onPress,
  throttleMs = 500,
  ...props
}) => {
  const lastPress = useRef(0);

  const handlePress = useCallback((e: GestureResponderEvent) => {
    const now = Date.now();
    if (now - lastPress.current < throttleMs) return;
    lastPress.current = now;
    onPress?.(e);
  }, [onPress, throttleMs]);

  return (
    <TouchableOpacity
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      onPress={onPress ? handlePress : undefined}
      {...props}
    />
  );
};
