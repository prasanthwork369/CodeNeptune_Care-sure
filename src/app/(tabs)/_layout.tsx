import LiquidTabBar from "@/src/components/navigation/LiquidTabBar";
import { tabs as tabConfig } from "@/src/constants/data";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useAuthStore } from "@/src/store/authStore";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import React from "react";

// Hoist to prevent remounting tab bar on every render
const renderTabBar = (props: BottomTabBarProps) => <LiquidTabBar {...props} />;

const TabLayout = () => {
  const isLoaded = useAuthStore((s) => s.isLoaded);
  useProfile();

  if (!isLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: "none",
        freezeOnBlur: true,
        // Eager-mount all tabs to ensure instant tab switching transitions
        lazy: false,
      }}
      tabBar={renderTabBar}
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
