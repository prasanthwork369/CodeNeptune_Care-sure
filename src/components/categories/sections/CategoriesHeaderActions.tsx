import React from 'react';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { useNav } from '@/src/hooks/useNav';
import { icons } from '@/src/constants/icons';
import { useCart } from '@/src/hooks/queries/useCart';

export const CategoriesHeaderActions: React.FC = () => {
    const router = useNav();
    const { totalItems } = useCart();

    return (
        <View className="flex-row items-center gap-2.5">
            <Touchable
                onPress={() => router.push('/search')}
                className="w-12 h-12 rounded-full bg-white border border-[#919EAB33] items-center justify-center"
            >
                <icons.search width={20} height={20} />
            </Touchable>
            <View className="relative">
                <Touchable
                    onPress={() => router.push('/(modal)/cart')}
                    className="w-12 h-12 rounded-full bg-white border border-[#919EAB33] items-center justify-center"
                >
                    <icons.cart_outline width={22} height={22} />
                </Touchable>
                {totalItems > 0 && (
                    <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C22923] items-center justify-center">
                        <Text className="text-[10px] font-inter-bold text-white">{totalItems}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};
