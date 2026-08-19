import { Touchable } from "@/src/components/ui/Touchable";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UpdateReadyBannerProps {
  visible: boolean;
  onRestart: () => void;
}

/** Banner shown when a background update is downloaded and ready to install */
export const UpdateReadyBanner: React.FC<UpdateReadyBannerProps> = ({
  visible,
  onRestart,
}) => {
  const insets = useSafeAreaInsets();
  if (!visible) return null;

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.row}>
        <Text style={styles.label} numberOfLines={2}>
          Update ready to install
        </Text>
        <Touchable
          onPress={onRestart}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel="Restart and install the update"
        >
          <Text style={styles.buttonLabel}>Restart &amp; Update</Text>
        </Touchable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#173D25",
    paddingHorizontal: exactScale(16),
    paddingTop: exactScale(12),
  },
  row: { flexDirection: "row", alignItems: "center", gap: exactScale(12) },
  label: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: exactScale(14),
    paddingVertical: exactScale(8),
    borderRadius: exactScale(8),
  },
  buttonLabel: {
    color: "#173D25",
    fontSize: moderateScale(12),
    fontWeight: "700",
  },
});
