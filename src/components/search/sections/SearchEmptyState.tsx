import React from 'react';
import { View, Text } from 'react-native';

export const SearchEmptyState = ({ query }: { query: string }) => (
    <View className="flex-1 items-center justify-center px-8">
        <Text className="text-[15px] font-inter-semibold text-brand-text text-center">
            No results for "{query}"
        </Text>
    </View>
);
