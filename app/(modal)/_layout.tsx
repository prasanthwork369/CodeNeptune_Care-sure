import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function ModalLayout() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="cart"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 320,
        }}
      />
      <Stack.Screen name="order-success" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}
