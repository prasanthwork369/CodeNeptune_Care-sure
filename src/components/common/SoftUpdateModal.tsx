import { Touchable } from "@/src/components/ui/Touchable";
import { openAppStore } from "@/src/utils/appVersion";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface SoftUpdateModalProps {
  visible: boolean;
  latestVersion?: string;
  /** Later, Android back, or after Update — always closes the prompt. */
  onDismiss: () => void;
  /** Update specifically, so it can be told apart from a decline. */
  onUpdate?: () => void;
}

/**
 * The optional update prompt. Unlike the forced gate it is always dismissible —
 * the current build still works, so blocking the user would be unjustified.
 */
export const SoftUpdateModal: React.FC<SoftUpdateModalProps> = ({
  visible,
  latestVersion,
  onDismiss,
  onUpdate,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    // Android back dismisses, matching the Later action.
    onRequestClose={onDismiss}
  >
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Update available</Text>
        <Text style={styles.body}>
          {latestVersion
            ? `Version ${latestVersion} of CareSure is ready, with the latest improvements and fixes.`
            : "A new version of CareSure is ready, with the latest improvements and fixes."}
        </Text>

        <View style={styles.actions}>
          <Touchable
            onPress={onDismiss}
            style={[styles.button, styles.secondary]}
            accessibilityRole="button"
            accessibilityLabel="Dismiss update prompt"
          >
            <Text style={styles.secondaryLabel}>Later</Text>
          </Touchable>

          <Touchable
            onPress={() => {
              onUpdate?.();
              // Closes too: returning from the store should not find it waiting.
              onDismiss();
              openAppStore();
            }}
            className="bg-brand-primary"
            style={[styles.button, styles.primary]}
            accessibilityRole="button"
            accessibilityLabel="Update CareSure now"
          >
            <Text style={styles.primaryLabel}>Update</Text>
          </Touchable>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(24),
  },
  card: {
    width: "100%",
    maxWidth: exactScale(400),
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(16),
    padding: exactScale(24),
  },
  title: {
    fontSize: moderateScale(17),
    fontWeight: "700",
    color: "#1A1C1E",
  },
  body: {
    marginTop: exactScale(8),
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    color: "#6A6A6A",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: exactScale(12),
    marginTop: exactScale(24),
  },
  button: {
    height: exactScale(44),
    paddingHorizontal: exactScale(20),
    borderRadius: exactScale(10),
    alignItems: "center",
    justifyContent: "center",
  },
  secondary: { backgroundColor: "#F3F4F6" },
  primary: { minWidth: exactScale(110) },
  secondaryLabel: {
    color: "#6A6A6A",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: moderateScale(14),
    fontWeight: "600",
  },
});
