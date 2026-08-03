import { screenTransitions } from "@/src/theme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, ...screenTransitions.nativePush }}
    >
      <Stack.Screen name="login" options={screenTransitions.fade} />
      <Stack.Screen name="otp" options={screenTransitions.authComplete} />
    </Stack>
  );
}
