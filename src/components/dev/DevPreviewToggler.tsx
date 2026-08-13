import { Touchable } from "@/src/components/ui/Touchable";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { getDevUpdateReady, setDevUpdateReady } from "@/src/utils/devFlags";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";


const VISIBLE = false;

export function DevPreviewToggler() {
  if (!__DEV__ || !VISIBLE) return null;
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

      {/* A real flexible download only completes on a Play-installed build, so
          this is the only way to see the banner during development. */}
      <Touchable
        onPress={() => setDevUpdateReady(!getDevUpdateReady())}
        style={{ backgroundColor: "#173D25", padding: 8, marginTop: 6 }}
      >
        <Text style={{ color: "#fff" }}>Toggle Update Ready</Text>
      </Touchable>
    </View>
  );
}

export default DevPreviewToggler;
