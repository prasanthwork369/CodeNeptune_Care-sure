import React from 'react';
import { profileStyles as s } from '../profile.styles';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { useNav } from '@/src/hooks/useNav';
import { icons } from '@/src/constants/icons';

const QUICK_TILES = [
    { label: 'My Orders', icon: 'admin_meds', route: '/profile/orders' },
    { label: 'Caresure\nWallet', icon: 'account_balance_wallet_green', route: '/profile/wallet' },
    { label: 'My\nPrescriptions', icon: 'prescription_green', route: '/profile/orders/prescriptions' },
] as const;

export const ProfileQuickTiles: React.FC = () => {
    const router = useNav();

    return (
        <View className="flex-row mx-4 gap-[10px]" style={{ marginTop: -44 }}>
            {QUICK_TILES.map((tile) => {
                const Icon = (icons as any)[tile.icon];
                return (
                    <Touchable
                        key={tile.label}
                        onPress={() => router.push(tile.route as any)}
                        className="flex-1 bg-white rounded-xl py-[14px] items-center border border-[#919EAB33]"
                    >
                        <View className="w-11 h-11 items-center justify-center mb-2">
                            <Icon width={24} height={24} fill="#0F7635" />
                        </View>
                        <Text style={s.tileLabel} className="font-inter-medium text-brand-text text-center leading-4">{tile.label}</Text>
                    </Touchable>
                );
            })}
        </View>
    );
};
