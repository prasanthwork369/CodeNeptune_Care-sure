import React from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { icons } from '@/src/constants/icons';
import { colors } from '@/src/constants/theme';
import PercentDiscountIcon from '@/assets/icons/percent_discount.svg';
import { Touchable } from '@/src/components/ui/Touchable';
import { useNav } from '@/src/hooks/useNav';
import { CartCouponSectionProps } from '@/src/types/cart';

export const CartCouponSection: React.FC<CartCouponSectionProps> = ({ appliedCoupon, onRemove }) => {
    const router = useNav();

    return (
        <View className="mx-4 mt-3 bg-white border border-[#919EAB33] rounded-[12px] px-4 py-3">
            {appliedCoupon ? (
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-x-2">
                        <PercentDiscountIcon width={18} height={18} fill={colors.primary} />
                        <View className="bg-[#E8F5E9] px-2 py-1 rounded">
                            <Text style={s.couponText} className="font-inter-bold text-brand-primary">{appliedCoupon.code}</Text>
                        </View>
                        <Text style={s.couponText} className="font-inter-medium text-brand-primary">- ₹{Number(appliedCoupon.discount).toFixed(2)} saved</Text>
                    </View>
                    <Touchable onPress={onRemove}>
                        <Text style={s.couponText} className="font-inter-semibold text-[#E16D09]">Remove</Text>
                    </Touchable>
                </View>
            ) : (
                <Touchable onPress={() => router.push('/(modal)/coupons')} className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-x-3">
                        <PercentDiscountIcon width={18} height={18} fill={colors.primary} />
                        <Text style={s.couponTitle} className="font-inter-semibold text-brand-text">Apply Coupon</Text>
                    </View>
                    <icons.arrow_forward_ios width={14} height={14} fill={colors.text} />
                </Touchable>
            )}
        </View>
    );
};
