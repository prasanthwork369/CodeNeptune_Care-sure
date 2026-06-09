import type React from "react";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
    }

    interface TabIconProps {
        icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
        focused: boolean;
    }

}