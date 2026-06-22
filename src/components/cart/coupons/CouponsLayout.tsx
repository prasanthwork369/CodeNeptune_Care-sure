import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { useCouponStore } from '@/src/store/couponStore';
import { useToastStore } from '@/src/store/toastStore';
import { useNav } from '@/src/hooks/useNav';
import { useCoupons } from '@/src/hooks/queries/useCoupons';
import { couponService } from '@/src/services/coupon.service';
import { useCart } from '@/src/hooks/queries/useCart';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { CouponInput, CouponCard } from './sections';

export const CouponsLayout: React.FC = () => {
    const [couponCode, setCouponCode] = useState('');
    const [validating, setValidating] = useState(false);
    const { apply } = useCouponStore();
    const toast = useToastStore();
    const router = useNav();
    const { totalPrice: subtotal } = useCart();
    const { data: coupons = [], isLoading } = useCoupons();

    const applyCode = async (code: string) => {
        const trimmed = code.trim().toUpperCase();
        if (!trimmed) return;
        setValidating(true);
        try {
            const result = await couponService.validateCoupon(trimmed, subtotal);
            if (result.valid) {
                apply({ code: trimmed, discount: Number(result.discount) || 0, description: result.message ?? '' });
                router.back();
            } else {
                toast.show(result.message ?? 'This coupon is not valid or has expired.', 'error');
            }
        } catch {
            toast.show('Could not validate coupon. Please try again.', 'error');
        } finally {
            setValidating(false);
        }
    };

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader title="Apply Coupon" />
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 px-4 pt-6">
                <CouponInput
                    value={couponCode}
                    onChangeText={setCouponCode}
                    onApply={() => applyCode(couponCode)}
                    loading={validating}
                />

                <Text className="text-[14px] font-inter-bold text-brand-text mt-8 mb-4">More Coupons</Text>

                {isLoading ? (
                    <ActivityIndicator color="#0F7635" />
                ) : coupons.length === 0 ? (
                    <Text className="text-[13px] font-inter-medium text-brand-subtext text-center mt-4">
                        No coupons available
                    </Text>
                ) : (
                    coupons.map((coupon) => (
                        <CouponCard
                            key={coupon.id}
                            coupon={coupon}
                            onApply={applyCode}
                            disabled={subtotal < coupon.minOrderValue}
                        />
                    ))
                )}
            </ScrollView>
        </View>
    );
};
