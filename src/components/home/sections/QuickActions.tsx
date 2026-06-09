import React from 'react';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image } from 'expo-image';
import type { QuickAction } from '@/src/types/home';
import { styles as s } from './QuickActions.styles';

interface QuickActionsProps {
    actions: QuickAction[];
    onActionPress?: (id: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions, onActionPress }) => {
    return (
        <View className="mx-4 mt-5 flex-row flex-wrap justify-between gap-y-3">
            {actions.map((action) => (
                <Touchable
                    key={action.id}
                    activeOpacity={0.5}
                    onPress={() => onActionPress?.(action.id)}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    style={{ width: '48%', shadowColor: '#919EAB' }}
                    className="bg-white rounded-md flex-row items-center p-4 gap-3 border border-[#919EAB33]"
                >
                    <View
                        style={[s.iconBox, { backgroundColor: action.bgColor }]}
                        className="rounded-md justify-center items-center"
                    >
                        <Image source={action.icon} style={s.iconImg} contentFit="contain" />
                    </View>
                    <Text
                        style={s.label}
                        className="flex-1 font-inter-semibold text-brand-text leading-tight"
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.85}
                    >
                        {action.label}
                    </Text>
                </Touchable>
            ))}
        </View>
    );
};
