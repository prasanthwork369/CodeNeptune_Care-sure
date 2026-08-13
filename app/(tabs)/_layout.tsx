import LiquidTabBar from "@/src/components/navigation/LiquidTabBar";
import { tabs as tabConfig } from "@/src/constants/data";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useAuthStore } from "@/src/store/authStore";
import { Tabs, type BottomTabBarProps } from "expo-router/js-tabs";
import React from "react";

// Hoisted so the tab bar isn't remounted by a fresh closure on every render.
const renderTabBar = (props: BottomTabBarProps) => <LiquidTabBar {...props} />;

const TabLayout = () => {
  const isLoaded = useAuthStore((s) => s.isLoaded);
  useProfile();

  if (!isLoaded) return null;

  return (
    <Tabs
      // Inactive tabs stop re-rendering behind the active one.
      screenOptions={{
        headerShown: false,
        animation: "none",
        freezeOnBlur: true,
        // Only 3 tabs, and Home is already mounted at launch — eager-mounting
        // Categories and Profile too costs a little during the splash screen
        // but means every tab switch is instant from the very first tap,
        // instead of the first visit to each tab paying a mount+fetch cost.
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
