import { ProductComparisonLayout } from '@/src/components/search/product/ProductComparisonLayout';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ProductDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    return (
        <>
            <Stack.Screen options={{ presentation: 'transparentModal', animation: 'none', gestureEnabled: false, contentStyle: { backgroundColor: 'transparent' } }} />
            <ProductComparisonLayout id={id} />
        </>
    );
}
