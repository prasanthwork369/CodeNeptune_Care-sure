import { screenTransitions } from "@/src/theme";
import { Stack } from "expo-router";

export default function CatalogLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        ...screenTransitions.nativePush,
      }}
    >
      <Stack.Screen name="featured" />
    </Stack>
  );
}
