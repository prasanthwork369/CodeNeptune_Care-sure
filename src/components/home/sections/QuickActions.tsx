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

export const QuickActions: React.FC<QuickActionsProps> = React.memo(({ actions, onActionPress }) => {
    return (
        <View style={s.container}>
            {actions.map((action) => (
                <Touchable
                    key={action.id}
                    activeOpacity={0.5}
                    onPress={() => onActionPress?.(action.id)}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    style={s.box}
                >
                    <View
                        style={[s.iconBox, { backgroundColor: action.bgColor }]}
                    >
                        <Image source={action.icon} style={s.iconImg} contentFit="contain" />
                    </View>
                    <Text
                        style={s.label}
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
});
QuickActions.displayName = 'QuickActions';
