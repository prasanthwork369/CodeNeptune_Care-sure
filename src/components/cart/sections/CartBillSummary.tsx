import React from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import DescriptionIcon from '@/assets/icons/description.svg';
import { colors } from '@/src/constants/theme';
import { CartBillSummaryProps } from '@/src/types/cart';

export const CartBillSummary: React.FC<CartBillSummaryProps> = ({ mrpTotal, toPay, onPress }) => {
    return (
        <Touchable 
            onPress={onPress} 
            activeOpacity={0.7} 
            className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3.5 flex-row items-center"
        >
            <View style={[s.billIconBox, { borderRadius: 4, backgroundColor: 'white', borderWidth: 1, borderColor: '#919EAB33', alignItems: 'center', justifyContent: 'center' }]}>
                <DescriptionIcon width={18} height={20} fill={colors.text} />
            </View>
            <View className="flex-1 ml-3">
                <Text style={s.billTitle} className="font-inter-bold text-brand-text">Total Bill</Text>
                <Text style={s.billSub} className="font-inter-medium text-brand-subtext mt-0.5">Incl.charges</Text>
            </View>
            {mrpTotal > toPay && (
                <Text style={s.billMrp} className="font-inter-bold text-brand-subtext line-through mr-2">₹{Number(mrpTotal).toFixed(2)}</Text>
            )}
            <Text style={s.billTotal} className="font-inter-bold text-brand-text mr-2">₹{Number(toPay).toFixed(2)}</Text>
            <icons.arrow_forward_ios width={14} height={14} fill={colors.text} />
        </Touchable>
    );
};
