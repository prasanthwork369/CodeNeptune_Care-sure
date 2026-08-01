import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "@/src/store/authStore";
import { screenTransitions } from "@/src/theme";

export default function PrescriptionLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false, ...screenTransitions.push }}>
      {/* A viewer opens over what you were reading, so it fades rather than slides */}
      <Stack.Screen
        name="prescription-viewer"
        options={screenTransitions.fade}
      />
    </Stack>
  );
}
