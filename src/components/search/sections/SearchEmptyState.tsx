import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';

export const SearchEmptyState = ({ query }: { query: string }) => (
    <View className="flex-1 items-center justify-center px-8">
        <Text className="font-inter-semibold text-brand-text text-center" style={{ fontSize: moderateScale(15) }}>
            No results for &quot;{query}&quot;
        </Text>
    </View>
);
