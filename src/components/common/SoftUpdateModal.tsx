import { Touchable } from "@/src/components/ui/Touchable";
import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React from "react";
import { Modal, StyleSheet, Text, View } from "react-native";

interface SoftUpdateModalProps {
  visible: boolean;
  /** Kept for analytics/callers; the copy is version-agnostic by design. */
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
  onDismiss,
  onUpdate,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    // Without this the Android backdrop stops below the status bar and leaves a
    // pale strip. Every other modal in the app sets it.
    statusBarTranslucent
    // Android back dismisses, matching the Later action.
    onRequestClose={onDismiss}
  >
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <View style={styles.iconHalo}>
          <Image
            source={HOME_IMAGES.updateBell}
            style={styles.icon}
            contentFit="contain"
            accessibilityIgnoresInvertColors
          />
        </View>

        <Text style={styles.title}>A new version is available</Text>
        <Text style={styles.body}>
          We&rsquo;ve made improvements and added new features to give a better
          CareSure experience.
        </Text>

        {/* Stacked, not side by side: Update is the primary action and gets the
            full width, with Later readable but visually secondary. */}
        <Touchable
          onPress={() => {
            // The parent decides what Update means — Play flexible update on
            // Android, store link elsewhere. Closing either way, so returning
            // from the store does not find the prompt still waiting.
            onUpdate?.();
            onDismiss();
          }}
          style={[styles.button, styles.primary]}
          accessibilityRole="button"
          accessibilityLabel="Update CareSure now"
        >
          <Text style={styles.primaryLabel}>Update Now</Text>
        </Touchable>

        <Touchable
          onPress={onDismiss}
          style={[styles.button, styles.secondary]}
          accessibilityRole="button"
          accessibilityLabel="Dismiss update prompt"
        >
          <Text style={styles.secondaryLabel}>Maybe Later</Text>
        </Touchable>
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
    borderRadius: exactScale(20),
    paddingHorizontal: exactScale(24),
    paddingTop: exactScale(28),
    paddingBottom: exactScale(24),
    alignItems: "center",
  },
  iconHalo: {
    width: exactScale(96),
    height: exactScale(96),
    borderRadius: exactScale(48),
    backgroundColor: "#F1FBF965",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { width: exactScale(56), height: exactScale(56) },
  title: {
    marginTop: exactScale(18),
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#1A1C1E",
    textAlign: "center",
  },
  body: {
    marginTop: exactScale(10),
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    fontWeight: "500",
    color: "#6A6A6A",
    textAlign: "center",
  },
  // Full width and stacked, so the primary action is unmissable.
  button: {
    width: "100%",
    height: exactScale(52),
    borderRadius: exactScale(12),
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { marginTop: exactScale(22), backgroundColor: "#146C3A" },
  secondary: {
    marginTop: exactScale(12),
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  primaryLabel: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    fontWeight: "700",
  },
  secondaryLabel: {
    color: "#6A6A6A",
    fontSize: moderateScale(16),
    fontWeight: "600",
  },
});
