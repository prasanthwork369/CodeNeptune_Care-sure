import React, { useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { cartStyles as s, COUNTER_W, COUNTER_BTN } from './cart.styles';

interface CartItemCounterProps {
    item: { id: string; qty: number };
    updateItem: (itemId: string, input: { quantity: number }) => Promise<any>;
    removeItem: (itemId: string) => Promise<any>;
}

export const CartItemCounter: React.FC<CartItemCounterProps> = ({ item, updateItem, removeItem }) => {
    const [isPending, setIsPending] = useState(false);

    const handleChange = async (newQty: number) => {
        if (isPending) return;
        setIsPending(true);
        try {
            if (newQty <= 0) await removeItem(item.id);
            else await updateItem(item.id, { quantity: newQty });
        } finally {
            setIsPending(false);
        }
    };

    return (
        <View className="flex-row items-center justify-between rounded-[10px] overflow-hidden" style={{ backgroundColor: '#0F7635', width: COUNTER_W }}>
            <Touchable onPress={() => handleChange(item.qty - 1)} disabled={isPending} activeOpacity={0.7} style={{ width: COUNTER_BTN, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={s.counterPlusMinus} className="font-inter-medium text-white leading-none">−</Text>
            </Touchable>
            <View style={{ flex: 1, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' }}>
                {isPending ? <ActivityIndicator size="small" color="#FFFFFF" /> : (
                    <Text style={s.counterVal} className="font-inter-bold text-white text-center">{item.qty}</Text>
                )}
            </View>
            <Touchable onPress={() => handleChange(item.qty + 1)} disabled={isPending} activeOpacity={0.7} style={{ width: COUNTER_BTN, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={s.counterPlusMinus} className="font-inter-medium text-white leading-none">+</Text>
            </Touchable>
        </View>
    );
};
