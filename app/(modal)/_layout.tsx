import { Redirect, Stack, useSegments } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function ModalLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const modalRoute = segments[1];
  const isGuestAllowed = modalRoute === 'cart' || modalRoute === 'coupons';

  if (!isAuthenticated && !isGuestAllowed) return <Redirect href="/(auth)/login" />;

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
      <Stack.Screen name="coupons" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="order-success" options={{ presentation: 'transparentModal', animation: 'fade' }} />
    </Stack>
  );
}
