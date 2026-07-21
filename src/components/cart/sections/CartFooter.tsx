import { exactScale } from '@/src/utils/exactScale';
import React from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { CartFooterProps } from '@/src/types/cart';

export const CartFooter: React.FC<CartFooterProps> = ({ toPay, safeAreaBottom, onProceed, canProceed = true }) => {
    return (
        <View 
            className="bg-white border-t border-[#919EAB33] px-4 flex-row items-center justify-between" 
            style={{ paddingTop: exactScale(12), paddingBottom: safeAreaBottom + exactScale(12) }}
        >
            <View>
                <Text style={s.footerLabel} className="font-inter-medium text-brand-text">To Pay</Text>
                <Text style={s.footerTotal} className="font-inter-extrabold text-brand-text">₹{Number(toPay).toFixed(2)}</Text>
            </View>
            <Touchable
                onPress={onProceed}
                disabled={!canProceed}
                activeOpacity={0.85}
                 style={{
                 borderRadius: 8,
                 opacity: canProceed ? 1 : 0.5
                }}
                className="flex-1 ml-10 bg-brand-primary py-4 items-center"
            >
                <Text style={s.footerBtn} className="font-inter-semibold text-white">Proceed To Pay</Text>
            </Touchable>
        </View>
    );
};
