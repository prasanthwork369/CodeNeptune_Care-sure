import { Touchable } from "@/src/components/ui/Touchable";
import type { AppGateReason } from "@/src/hooks/ui/useAppGate";
import { openAppStore } from "@/src/utils/appVersion";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface AppGateScreenProps {
  reason: Exclude<AppGateReason, null>;
  maintenanceMessage?: string;
}

/**
 * Full-screen block for a forced update or planned downtime. Deliberately has
 * no dismiss action — it is only ever shown when the backend has explicitly
 * said the app must not continue.
 */
export const AppGateScreen: React.FC<AppGateScreenProps> = ({
  reason,
  maintenanceMessage,
}) => {
  const isUpdate = reason === "update";

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {isUpdate ? "Update required" : "We'll be right back"}
        </Text>
        <Text style={styles.body}>
          {isUpdate
            ? "This version of CareSure is no longer supported. Please update to continue ordering."
            : (maintenanceMessage ??
              "CareSure is down for scheduled maintenance. Please try again shortly.")}
        </Text>

        {isUpdate && (
          <Touchable
            onPress={openAppStore}
            className="bg-brand-primary items-center justify-center"
            style={styles.button}
            accessibilityRole="button"
            accessibilityLabel="Update CareSure"
          >
            <Text style={styles.buttonLabel}>Update now</Text>
          </Touchable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4FAF5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(24),
  },
  card: { alignItems: "center", maxWidth: exactScale(420) },
  title: {
    fontSize: moderateScale(20),
    fontWeight: "700",
    color: "#173D25",
    textAlign: "center",
  },
  body: {
    marginTop: exactScale(12),
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    color: "#587060",
    textAlign: "center",
  },
  button: {
    marginTop: exactScale(24),
    height: exactScale(50),
    paddingHorizontal: exactScale(32),
    borderRadius: exactScale(12),
  },
  buttonLabel: {
    color: "#FFFFFF",
    fontSize: moderateScale(15),
    fontWeight: "600",
  },
});
