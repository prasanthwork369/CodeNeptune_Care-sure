import React from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { CartFooterProps } from '@/src/types/cart';

export const CartFooter: React.FC<CartFooterProps> = ({ toPay, safeAreaBottom, onProceed }) => {
    return (
        <View 
            className="bg-white border-t border-[#919EAB33] px-4 flex-row items-center justify-between" 
            style={{ paddingTop: 12, paddingBottom: safeAreaBottom + 12 }}
        >
            <View>
                <Text style={s.footerLabel} className="font-inter-medium text-brand-text">To Pay</Text>
                <Text style={s.footerTotal} className="font-inter-extrabold text-brand-text">₹{Number(toPay).toFixed(2)}</Text>
            </View>
            <Touchable
                onPress={onProceed}
                activeOpacity={0.85}
                className="flex-1 ml-10 bg-brand-primary rounded-lg py-4 items-center"
            >
                <Text style={s.footerBtn} className="font-inter-semibold text-white">Proceed</Text>
            </Touchable>
        </View>
    );
};
