import { screenTransitions } from "@/src/theme";
import { Stack } from "expo-router";

export default function ProductLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, ...screenTransitions.push }}>
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
