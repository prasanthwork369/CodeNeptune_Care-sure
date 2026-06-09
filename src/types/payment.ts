import { ReactNode } from 'react';

export interface PaymentMethod {
    id: string;
    title: string;
    subtitle: string;
    icon: ReactNode;
}

export interface PaymentHeaderProps {
    onBack: () => void;
    title: string;
}

export interface PaymentTotalBannerProps {
    toPay: string;
}

export interface PaymentAddressCardProps {
    hasAddress: boolean;
    deliveryLabel: string | null;
    deliveryCity: string | null;
    onPress: () => void;
}

export interface PaymentMethodsListProps {
    methods: PaymentMethod[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export interface PaymentFooterProps {
    onPress: () => void;
    loading: boolean;
    hasAddress: boolean;
    safeAreaBottom: number;
}
