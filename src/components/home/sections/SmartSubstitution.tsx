import React from 'react';
import { PopularSubstitutes } from './PopularSubstitutes';
import type { Product } from '@/src/types/home';

interface SmartSubstitutionProps {
    products: Product[];
    onProductPress: (id: string) => void;
    isLoading?: boolean;
}

export const SmartSubstitution: React.FC<SmartSubstitutionProps> = ({
    products,
    onProductPress,
    isLoading
}) => {
    return (
        <PopularSubstitutes
            products={products}
            onProductPress={onProductPress}
            isLoading={isLoading}
        />
    );
};
