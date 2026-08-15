import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React, { useCallback, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import ReanimatedSwipeable, {
  SwipeableMethods,
} from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  LinearTransition,
  SharedValue,
  StretchOutY,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const ACTION_WIDTH = 76;

interface DeleteActionProps {
  progress: SharedValue<number>;
  disabled: boolean;
  onPress: () => void;
}

const DeleteAction: React.FC<DeleteActionProps> = ({
  progress,
  disabled,
  onPress,
}) => {
  const iconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      progress.value,
      [0, 0.35, 1],
      [0, 0.65, 1],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        scale: interpolate(
          progress.value,
          [0, 1],
          [0.8, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Touchable
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      throttleMs={700}
      accessibilityRole="button"
      accessibilityLabel="Delete notification"
      style={styles.deleteAction}
    >
      <Animated.View style={iconStyle}>
        <icons.delete_white width={exactScale(20)} height={exactScale(21)} />
      </Animated.View>
    </Touchable>
  );
};

interface SwipeableNotificationRowProps {
  children: React.ReactNode;
  isLast: boolean;
  onDelete: () => Promise<void>;
  onWillOpen: (methods: SwipeableMethods) => void;
  onDidClose: (methods: SwipeableMethods) => void;
}

export const SwipeableNotificationRow: React.FC<
  SwipeableNotificationRowProps
> = ({ children, isLast, onDelete, onWillOpen, onDidClose }) => {
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await onDelete();
      if (swipeableRef.current) onDidClose(swipeableRef.current);
      setIsRemoved(true);
    } catch {
      // The query data was not changed optimistically, so closing the row fully
      // restores it after a failed API request.
      swipeableRef.current?.close();
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, onDelete, onDidClose]);

  const renderRightActions = useCallback(
    (progress: SharedValue<number>) => (
      <DeleteAction
        progress={progress}
        disabled={isDeleting}
        onPress={() => void handleDelete()}
      />
    ),
    [handleDelete, isDeleting],
  );

  if (isRemoved) return null;

  return (
    <Animated.View
      layout={LinearTransition.duration(160)}
      exiting={StretchOutY.duration(140)}
      style={!isLast && styles.rowSpacing}
    >
      <ReanimatedSwipeable
        ref={swipeableRef}
        friction={1.05}
        rightThreshold={exactScale(40)}
        dragOffsetFromRightEdge={exactScale(16)}
        overshootLeft={false}
        overshootRight={false}
        renderRightActions={renderRightActions}
        containerStyle={styles.swipeContainer}
        childrenContainerStyle={styles.rowContent}
        onSwipeableWillOpen={() => {
          if (swipeableRef.current) onWillOpen(swipeableRef.current);
        }}
        onSwipeableClose={() => {
          if (swipeableRef.current) onDidClose(swipeableRef.current);
        }}
      >
        {children}
      </ReanimatedSwipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  rowSpacing: {
    marginBottom: exactScale(20),
  },
  swipeContainer: {
    borderRadius: exactScale(8),
    overflow: "hidden",
    backgroundColor: "#DC2626",
  },
  rowContent: {
    backgroundColor: "#FFFFFF",
  },
  deleteAction: {
    width: exactScale(ACTION_WIDTH),
    minWidth: exactScale(ACTION_WIDTH),
    minHeight: exactScale(44),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
  },
});
