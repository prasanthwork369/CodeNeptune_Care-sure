import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import LiquidTabBar from "@/src/components/navigation/LiquidTabBar";
import { tabs as tabConfig } from "@/src/constants/data";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useAuthStore } from "@/src/store/authStore";
import { Tabs } from "expo-router";
import React from "react";

// Hoisted so the tab bar isn't remounted by a fresh closure on every render.
const renderTabBar = (props: BottomTabBarProps) => <LiquidTabBar {...props} />;

const TabLayout = () => {
  const { isLoaded } = useAuthStore();
  useProfile();

  if (!isLoaded) return null;

  return (
    <Tabs
      // Inactive tabs stop re-rendering behind the active one.
      screenOptions={{
        headerShown: false,
        animation: "none",
        freezeOnBlur: true,
        lazy: true,
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
