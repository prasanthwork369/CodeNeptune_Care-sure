import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";
import { Redirect, Stack } from "expo-router";
import { useUploadCoordinator } from "@/src/features/prescription/hooks/useUploadCoordinator";

export default function PrescriptionLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // Start upload coordinator for entire prescription flow
  useUploadCoordinator();

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{ headerShown: false, ...screenTransitions.nativePush }}
    >
      <Stack.Screen name="choose-method" options={screenTransitions.fade} />
      <Stack.Screen name="select-patient" options={{ presentation: "card" }} />
      {/* Viewer is an overlay destination, so it uses native bottom-modal motion. */}
      <Stack.Screen
        name="prescription-viewer"
        options={screenTransitions.fade}
      />
    </Stack>
  );
}
