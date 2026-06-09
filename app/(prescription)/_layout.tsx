import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/src/store/authStore';

export default function PrescriptionLayout() {
    const { isAuthenticated } = useAuthStore();
    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

    return <Stack screenOptions={{ headerShown: false }} />;
}
