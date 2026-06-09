import React from 'react';
import { ActivityIndicator, View, TextInput, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { colors } from '@/src/constants/theme';
import { CouponInputProps } from '@/src/types/cart';

export const CouponInput: React.FC<CouponInputProps> = ({ value, onChangeText, onApply, loading }) => {
    return (
        <View className="bg-white rounded-[14px] px-4 py-2 flex-row items-center border border-[#919EAB33]">
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder="Enter Code"
                placeholderTextColor="#6A6A6A"
                className="flex-1 text-[15px] font-inter-medium text-brand-text"
                autoCapitalize="characters"
                editable={!loading}
            />
            <Touchable
                onPress={onApply}
                disabled={loading}
                style={{ backgroundColor: colors.primary }}
                className="px-3 py-2 rounded-md"
            >
                {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text className="text-[12px] font-inter-bold text-white">APPLY</Text>
                }
            </Touchable>
        </View>
    );
};
