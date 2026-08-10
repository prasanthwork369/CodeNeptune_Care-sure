import { Touchable } from "@/src/components/ui/Touchable";
import { queryClient } from "@/src/lib/react-query/queryClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { Text, View } from "react-native";

export function DevPreviewToggler() {
  if (!__DEV__) return null;
  return (
    <View
      style={{
        position: "absolute",
        bottom: 44,
        right: 12,
        zIndex: 999,
        alignItems: "flex-end",
      }}
    >
      <Touchable
        onPress={() =>
          queryClient.setQueryData(["platform-settings"], {
            maintenanceMode: false,
            maintenanceMessage: null,
            latestVersion: "999.0.0",
            minSupportedVersion: "999.0.0",
          })
        }
        style={{ backgroundColor: "#ff8c00", padding: 8, marginBottom: 6 }}
      >
        <Text style={{ color: "#fff" }}>Force Forced Update</Text>
      </Touchable>

      <Touchable
        onPress={async () => {
          // Clear any dismissed version so the prompt can appear, then set latestVersion
          try {
            await AsyncStorage.removeItem(
              "@caresure:soft_update_dismissed_version",
            );
          } catch {}
          queryClient.setQueryData(["platform-settings"], {
            maintenanceMode: false,
            maintenanceMessage: null,
            latestVersion: "999.0.0",
            minSupportedVersion: "1.0.0",
          });
        }}
        style={{ backgroundColor: "#1e90ff", padding: 8 }}
      >
        <Text style={{ color: "#fff" }}>Force Soft Update</Text>
      </Touchable>
    </View>
  );
}

export default DevPreviewToggler;
