import React from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { CartSavingsBannerProps } from '@/src/types/cart';

export const CartSavingsBanner: React.FC<CartSavingsBannerProps> = ({ firstName, totalSavings }) => {
    if (totalSavings <= 0) return null;

    return (
        <LinearGradient
            colors={['#D0EBFE', '#D7FFEA']} 
            start={{ x: 0, y: 0.5 }} 
            end={{ x: 1, y: 0.5 }} 
            style={{ marginHorizontal: 16, marginTop: 14, borderRadius: 12, borderWidth: 1, borderColor: '#919EAB33' }}
        >
            <View className="px-4 py-4">
                <Text style={s.savingsText} className="font-inter-semibold text-[#0A0A0A]">
                    {firstName}, You saved{'  '}
                    <Text className="font-inter-extrabold text-[#0A0A0A]">₹{parseFloat(totalSavings.toFixed(2))}</Text> on this Order
                </Text>
            </View>
        </LinearGradient>
    );
};
