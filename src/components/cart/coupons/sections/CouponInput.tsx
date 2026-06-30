import React from 'react';
import { ActivityIndicator, View, TextInput, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { colors } from '@/src/constants/theme';
import { CouponInputProps } from '@/src/types/cart';
import { moderateScale } from '@/src/utils/exactScale';

export const CouponInput: React.FC<CouponInputProps> = ({ value, onChangeText, onApply, loading }) => {
    return (
        <View className="bg-white rounded-[14px] px-4 py-2 flex-row items-center border border-[#919EAB33]">
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder="Enter Code"
                placeholderTextColor="#6A6A6A"
                className="flex-1 font-inter-medium text-brand-text"
                style={{ fontSize: moderateScale(15) }}
                autoCapitalize="characters"
                editable={!loading}
            />
            <Touchable
                onPress={onApply}
                disabled={loading}
                style={{ backgroundColor: colors.primary }}
                className="px-3 py-2 rounded-sm"
            >
                {loading
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(12) }}>APPLY</Text>
                }
            </Touchable>
        </View>
    );
};
