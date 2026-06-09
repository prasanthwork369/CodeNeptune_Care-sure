import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useBottomInset } from '@/src/hooks/ui/useBottomInset';

interface SheetSafeAreaProps {
    children: React.ReactNode;
    extra?: number;
    style?: ViewStyle;
}

export const SheetSafeArea: React.FC<SheetSafeAreaProps> = ({ children, extra = 16, style }) => {
    const paddingBottom = useBottomInset(extra);
    return (
        <View style={[{ paddingBottom }, style]}>
            {children}
        </View>
    );
};
