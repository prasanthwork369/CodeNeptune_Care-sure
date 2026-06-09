import React from 'react';
import { View, TextInput, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { colors } from '@/src/constants/theme';
import { CouponInputProps } from '@/src/types/cart';

export const CouponInput: React.FC<CouponInputProps> = ({ value, onChangeText, onApply }) => {
    return (
        <View className="bg-white rounded-[14px] px-4 py-2 flex-row items-center border border-[#919EAB33]">
            <TextInput 
                value={value} 
                onChangeText={onChangeText} 
                placeholder="Enter Code" 
                placeholderTextColor="#6A6A6A" 
                style={s.couponInput} className="flex-1 font-inter-medium text-brand-text" 
                autoCapitalize="characters"
            />
            <Touchable 
                onPress={onApply} 
                style={{ backgroundColor: colors.primary }} 
                className="px-3 py-2 rounded-lg"
            >
                <Text style={s.couponInputApply} className="font-inter-bold text-white">APPLY</Text>
            </Touchable>
        </View>
    );
};
