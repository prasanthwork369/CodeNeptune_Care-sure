import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';
import { icons } from '@/src/constants/icons';

export const SearchOfflineState = () => (
    <View className="flex-1 items-center justify-center px-8">
        <View
            style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: '#F4EAD3',
                borderWidth: 1.5,
                borderColor: '#FFEAC3',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 18,
            }}
        >
            <icons.internet width={30} height={30} />
        </View>
        <Text className="font-inter-bold text-[#1A1C1E] text-center" style={{ fontSize: moderateScale(16) }}>
            No Internet Connection
        </Text>
        <Text className="font-inter-regular text-[#6A6A6A] text-center mt-2" style={{ fontSize: moderateScale(14), lineHeight: moderateScale(20) }}>
            Please check your connection and try again.
        </Text>
    </View>
);
