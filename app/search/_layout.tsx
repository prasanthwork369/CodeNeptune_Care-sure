import { screenTransitions } from "@/src/theme";
import { Stack } from "expo-router";

export default function SearchLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, ...screenTransitions.nativePush }}
    >
      <Stack.Screen name="product/[id]" />
    </Stack>
  );
}
