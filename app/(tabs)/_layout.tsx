import LiquidTabBar from "@/src/components/navigation/LiquidTabBar";
import { tabs as tabConfig } from "@/src/constants/data";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useAuthStore } from "@/src/store/authStore";
import { Tabs } from "expo-router";
import React from 'react';

const TabLayout = () => {
    const { isLoaded } = useAuthStore();
    useProfile();

    if (!isLoaded) return null;

    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <LiquidTabBar {...props} />}
        >
            {tabConfig.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{ title: tab.title }}
                />
            ))}
            <Tabs.Screen name="upload" options={{ href: null }} />
        </Tabs>
    );
};

export default TabLayout;
