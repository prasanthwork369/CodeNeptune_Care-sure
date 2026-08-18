import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import type { AppGateReason } from "@/src/hooks/system/useAppGate";
import { openAppStore } from "@/src/utils/appVersion";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AppGateScreenProps {
  reason: Exclude<AppGateReason, null>;
  maintenanceMessage?: string;
  /**
   * What the update action does. Defaults to the store link so the screen still
   * works standalone; the gate passes the Play in-app update flow instead.
   */
  onUpdatePress?: () => void;
  /** Label swaps to Retry once an update attempt has already failed. */
  updateLabel?: string;
}

// Curly apostrophe, matching the design copy exactly.
const UPDATE_BODY =
  "We’ve made some exciting improvements to CareSure. Update now to enjoy the latest features and performance upgrades!";

/**
 * Full-screen block for a forced update or planned downtime. Deliberately has
 * no dismiss action — it is only ever shown when the backend has explicitly
 * said the app must not continue.
 */
export const AppGateScreen: React.FC<AppGateScreenProps> = ({
  reason,
  maintenanceMessage,
  onUpdatePress,
  updateLabel,
}) => {
  const isUpdate = reason === "update";

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image
          source={HOME_IMAGES.splashIcon}
          style={styles.logo}
          contentFit="contain"
          accessibilityIgnoresInvertColors
        />

        <Text style={styles.title}>
          {isUpdate ? "New Update Available" : "We'll be right back"}
        </Text>

        <Text style={styles.body}>
          {isUpdate
            ? UPDATE_BODY
            : (maintenanceMessage ??
              "CareSure is down for scheduled maintenance. Please try again shortly.")}
        </Text>

        {isUpdate && (
          <Touchable
            onPress={onUpdatePress ?? openAppStore}
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Update CareSure"
          >
            <Text style={styles.buttonLabel}>
              {updateLabel ?? "Update Now"}
            </Text>
            {/* Pre-coloured white variant — these SVGs cannot be re-tinted via fill. */}
            <icons.arrow_up_white
              width={exactScale(16)}
              height={exactScale(16)}
            />
          </Touchable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(24),
  },
  content: { alignItems: "center", width: "100%" },
  // Figma: 105 x 97.46 — not square, so the height must not be rounded to match.
  logo: { width: exactScale(105), height: exactScale(97.46) },
  // Figma: Inter SemiBold 22 / line-height 100% / letter-spacing 0 / centered.
  // No lineHeight set on purpose: Figma's "100%" is the font's natural line
  // height, not 1.0x the size. Writing lineHeight: 22 here would clip the
  // descender on the "p" in "Update".
  title: {
    marginTop: exactScale(16),
    fontSize: moderateScale(22),
    fontWeight: "600",
    letterSpacing: 0,
    color: "#1A1C1E",
    textAlign: "center",
  },
  // Figma: Inter Medium 16 / line-height 26 / letter-spacing 0 / centered.
  // 26 is an explicit value here, not "100%", so it is used as given.
  body: {
    marginTop: exactScale(14),
    // Caps the measure so the copy wraps like the design instead of stretching
    // to the full width on a wider device.
    maxWidth: exactScale(310),
    fontSize: moderateScale(16),
    lineHeight: moderateScale(26),
    fontWeight: "500",
    letterSpacing: 0,
    color: "#6A6A6A",
    textAlign: "center",
  },
  // Figma: 160 x 46, radius 48, padding 10/16, gap 8.
  button: {
    marginTop: exactScale(26),
    width: exactScale(160),
    height: exactScale(46),
    paddingVertical: exactScale(10),
    paddingHorizontal: exactScale(16),
    borderRadius: exactScale(48),
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: exactScale(8),
  },
  // Figma: Inter SemiBold 16 / line-height 26 / letter-spacing 0.
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: moderateScale(16),
    lineHeight: moderateScale(26),
    fontWeight: "600",
    letterSpacing: 0,
  },
});
