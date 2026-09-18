import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { icons } from "@/src/constants/icons";
import { colors } from "@/src/constants/theme";
import { exactScale } from "@/src/utils/exactScale";

export interface CartMergeConfirmationSheetProps {
  isVisible: boolean;
  itemCount: number;
  onKeepAndAdd: () => void;
  onClearAndAdd: () => void;
  isKeepPending?: boolean;
  isClearPending?: boolean;
}

const _CartMergeConfirmationSheet = React.forwardRef<
  BottomSheetModal,
  CartMergeConfirmationSheetProps
>(
  (
    {
      isVisible,
      itemCount,
      onKeepAndAdd,
      onClearAndAdd,
      isKeepPending = false,
      isClearPending = false,
    },
    ref,
  ) => {
    const { height } = useWindowDimensions();
    const isPending = isKeepPending || isClearPending;

    const snapPoints = useMemo(() => {
      const snapPoint = Math.max(450, Math.min(height * 0.55, height * 0.8));
      return [snapPoint];
    }, [height]);

    if (!isVisible) return null;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enableDismissOnClose={false}
        enablePanDownToClose={!isPending}
        style={styles.sheet}
      >
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            {icons.cart_outline && (
              icons.cart_outline({ width: 40, height: 40, color: colors.primary })
            )}
          </View>

          <Text style={styles.title}>Items already in cart</Text>
          <Text style={styles.subtitle}>
            Your cart already has{" "}
            <Text style={styles.itemCount}>{itemCount} items</Text>. How would you
            like to proceed?
          </Text>

          <Pressable
            onPress={onKeepAndAdd}
            disabled={isPending}
            style={({ pressed }) => [
              styles.option,
              styles.optionKeep,
              pressed && !isPending && styles.optionPressed,
              isPending && styles.optionDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Keep existing items and add new ones"
            accessibilityHint="Merge guest cart items with your account cart"
            accessibilityState={{ disabled: isPending }}
          >
            <View style={styles.optionIconContainer}>
              {isKeepPending ? (
                <ActivityIndicator size="small" color={colors.success} />
              ) : icons.add_circle ? (
                icons.add_circle({ width: 24, height: 24, color: colors.success })
              ) : null}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                {isKeepPending ? "Adding..." : "Keep and Add"}
              </Text>
              <Text style={styles.optionDescription}>
                Keep existing items and add new ones
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={onClearAndAdd}
            disabled={isPending}
            style={({ pressed }) => [
              styles.option,
              styles.optionClear,
              pressed && !isPending && styles.optionPressed,
              isPending && styles.optionDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Clear existing items and add new ones"
            accessibilityHint="Replace your account cart with guest cart items"
            accessibilityState={{ disabled: isPending }}
          >
            <View style={styles.optionIconContainer}>
              {isClearPending ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : icons.delete_icon ? (
                icons.delete_icon({ width: 24, height: 24, color: colors.error })
              ) : null}
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>
                {isClearPending ? "Clearing..." : "Clear and Add"}
              </Text>
              <Text style={styles.optionDescription}>
                Replace existing items with new ones
              </Text>
            </View>
          </Pressable>
        </View>
      </BottomSheetModal>
    );
  },
);

_CartMergeConfirmationSheet.displayName = "CartMergeConfirmationSheet";

export const CartMergeConfirmationSheet = React.memo(
  _CartMergeConfirmationSheet,
  (prev, next) =>
    prev.isVisible === next.isVisible &&
    prev.itemCount === next.itemCount &&
    prev.isKeepPending === next.isKeepPending &&
    prev.isClearPending === next.isClearPending,
) as typeof _CartMergeConfirmationSheet;

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
  },
  container: {
    paddingHorizontal: exactScale(20),
    paddingVertical: exactScale(24),
    paddingBottom: exactScale(32),
    alignItems: "center",
  },
  iconContainer: {
    width: exactScale(80),
    height: exactScale(80),
    borderRadius: exactScale(40),
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: exactScale(16),
  },
  title: {
    fontSize: exactScale(24),
    fontWeight: "700",
    color: colors.text,
    marginBottom: exactScale(8),
    textAlign: "center",
  },
  subtitle: {
    fontSize: exactScale(14),
    fontWeight: "500",
    color: colors.subtext,
    textAlign: "center",
    marginBottom: exactScale(24),
    maxWidth: "90%",
  },
  itemCount: {
    color: colors.primary,
    fontWeight: "700",
  },
  option: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(14),
    marginVertical: exactScale(8),
    borderRadius: exactScale(12),
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "flex-start",
    gap: exactScale(12),
  },
  optionKeep: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  optionClear: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
  },
  optionIconContainer: {
    width: exactScale(48),
    height: exactScale(48),
    borderRadius: exactScale(10),
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.text,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexShrink: 0,
  },
  optionContent: {
    flex: 1,
    justifyContent: "center",
    paddingTop: exactScale(2),
  },
  optionTitle: {
    fontSize: exactScale(15),
    fontWeight: "700",
    color: colors.text,
    marginBottom: exactScale(2),
  },
  optionDescription: {
    fontSize: exactScale(12),
    fontWeight: "400",
    color: colors.subtext,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionDisabled: {
    opacity: 0.5,
  },
});
