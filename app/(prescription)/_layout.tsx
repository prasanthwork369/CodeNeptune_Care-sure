import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";
import { Redirect, Stack } from "expo-router";

export default function PrescriptionLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{ headerShown: false, ...screenTransitions.nativePush }}
    >
      <Stack.Screen name="choose-method" options={screenTransitions.fade} />
      <Stack.Screen
        name="select-patient"
        options={{
          ...screenTransitions.fade,
          // Call Us should cover the viewport on iOS, matching Android.
          presentation: "fullScreenModal",
        }}
      />
      {/* Viewer is an overlay destination, so it uses native bottom-modal motion. */}
      <Stack.Screen
        name="prescription-viewer"
        options={screenTransitions.fade}
      />
    </Stack>
  );
}
