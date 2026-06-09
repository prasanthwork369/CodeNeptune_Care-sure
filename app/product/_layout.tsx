import { Stack } from 'expo-router';

export default function ProductLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
                name="[id]"
                options={{
                    presentation: 'transparentModal',
                    animation: 'none',
                    gestureEnabled: false,
                    contentStyle: { backgroundColor: 'transparent' },
                }}
            />
        </Stack>
    );
}
