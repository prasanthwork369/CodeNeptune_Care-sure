import React, { useCallback } from 'react';
import { ActivityIndicator, View, Text, Animated } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { useNav } from '@/src/hooks/useNav';
import { useCartActions } from '@/src/hooks/useCartActions';
import { cartCounterStyles as cc, searchCardStyles as s, COUNTER_WIDTH, COUNTER_BTN_W } from './search.styles';

interface SearchRowProps {
    data: {
        id: string;
        productId?: string;
        slug?: string;
        requiresPrescription?: boolean;
        recId?: string;
        recProductId?: string;
        recSlug?: string;
        searched: {
            name: string;
            manufacturer: string;
            description?: string;
            price: number;
            status: string;
        };
        recommended: {
            name: string;
            manufacturer: string;
            price: number;
            originalPrice: number;
            savings: number;
            description?: string;
            image?: any;
        };
    };
}

export const SearchProductCard: React.FC<SearchRowProps> = ({ data }) => {
    const router = useNav();

    const handleCardPress = useCallback(() => {
        router.push({ pathname: '/search/product/[id]', params: { id: data.productId ?? data.id } } as any);
    }, [data.productId, data.id, router]);

    const { count, increment, decrement, animations, isPending } = useCartActions({
        medicineId: data.recId || data.id,
        variantId: null,
        productId: data.recProductId || data.productId,
        name: data.recommended.name,
        slug: data.recSlug || data.slug,
        price: data.recommended.price,
        originalPrice: data.recommended.originalPrice,
        image: data.recommended.image,
        requiresPrescription: data.requiresPrescription,
    });

    const { slideAnim, opacityAnim } = animations;
    const handleIncrement = increment;
    const handleDecrement = decrement;

    return (
        <Touchable
            activeOpacity={0.5}
            onPress={handleCardPress}
            style={{ borderWidth: 1, borderColor: '#919EAB33' }}
            className="w-full rounded-[12px] bg-white overflow-hidden mb-5"
        >
            {/* Top Section: Split Comparison */}
            <View className="flex-row w-full">

                {/* Left Side (White Background) */}
                <View className="flex-1 p-4">
                    <View className="mb-6">
                        <Text style={s.name} className="font-inter-semibold text-brand-text mb-1 leading-snug tracking-tight">
                            {data.searched.name}
                        </Text>
                        {data.searched.description ? (
                            <Text style={s.desc} className="font-inter-medium text-brand-subtext mt-0.5" numberOfLines={1}>
                                {data.searched.description}
                            </Text>
                        ) : null}
                    </View>
                    <View className="mt-auto">
                        {data.searched.price != null && data.searched.price > 0 && (
                            <Text style={s.price} className="font-inter-extrabold text-brand-text mb-1 tracking-tight">
                                ₹{Number(data.searched.price).toFixed(2)}
                            </Text>
                        )}
                        <Text style={s.savings} className="font-inter-semibold text-[#FF383C]">
                            {data.searched.status}
                        </Text>
                    </View>
                </View>

                {/* Right Side (Pale Yellow Background) */}
                <View className="flex-1 p-4 bg-[#FFFDEB]">
                    <View className="mb-6">
                        <Text style={s.name} className="font-inter-semibold text-brand-text mb-1 leading-snug tracking-tight">
                            {data.recommended.name}
                        </Text>
                        {data.recommended.description ? (
                            <Text style={s.desc} className="font-inter-medium text-brand-subtext mt-0.5" numberOfLines={1}>
                                {data.recommended.description}
                            </Text>
                        ) : null}
                    </View>
                    <View className="mt-auto">
                        <View className="flex-row items-baseline gap-x-2 mb-1.5">
                            {data.recommended.price != null && data.recommended.price > 0 && (
                                <Text style={s.price} className="font-inter-extrabold text-brand-text tracking-tight">
                                    ₹{Number(data.recommended.price).toFixed(2)}
                                </Text>
                            )}
                            {data.recommended.originalPrice != null && data.recommended.originalPrice > data.recommended.price && (
                                <Text style={s.mrp} className="font-inter-semibold text-brand-subtext line-through">
                                    ₹{Number(data.recommended.originalPrice).toFixed(2)}
                                </Text>
                            )}
                        </View>
                        {data.recommended.savings > 0 && (
                            <View className="flex-row items-center mt-0.5">
                                <icons.sell width={14} height={14} fill="#0F7635" />
                                <Text style={s.savings} className="font-inter-bold text-brand-primary ml-1.5 tracking-tight">
                                    Save ₹{Number(data.recommended.savings).toFixed(2)}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

            </View>

            {/* Horizontal Divider Line */}
            <View className="h-[1px] w-full bg-[#EAEAEA]" />

            {/* Bottom Section: Uniform Actions Row */}
            <View className="flex-row justify-between items-center px-4 py-3.5 bg-white">
                <View className="flex-row items-center">
                    <icons.check_circle width={18} height={18} fill="#0F7635" />
                    <Text style={s.sameComp} className="font-inter-semibold text-brand-primary ml-2 uppercase tracking-wide">
                        SAME COMPOSITION
                    </Text>
                </View>

                {count === 0 ? (
                    <Touchable
                        onPress={handleIncrement}
                        disabled={isPending}
                        activeOpacity={0.85}
                        className="rounded-[10px] px-8 py-[9px] items-center justify-center bg-white"
                        style={{ borderWidth: 1, borderColor: '#0F7635', minWidth: 72 }}
                    >
                        {isPending
                            ? <ActivityIndicator size="small" color="#0F7635" />
                            : <Text style={[cc.addText, { color: '#0F7635' }]} className="font-inter-bold">Add</Text>
                        }
                    </Touchable>
                ) : (
                    <View className="flex-row items-center justify-between rounded-[10px] overflow-hidden" style={[cc.wrap, { backgroundColor: '#0F7635' }]}>
                        <Touchable
                            onPress={handleDecrement}
                            disabled={isPending}
                            activeOpacity={0.7}
                            style={cc.btn}
                        >
                            <Text style={cc.plusMinus} className="font-inter-medium text-white leading-none">−</Text>
                        </Touchable>
                        <View style={{ flex: 1, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' }}>
                            {isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Animated.Text
                                    style={[cc.countText, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
                                    className="font-inter-bold text-white text-center"
                                >
                                    {count}
                                </Animated.Text>
                            )}
                        </View>
                        <Touchable
                            onPress={handleIncrement}
                            disabled={isPending}
                            activeOpacity={0.7}
                            style={cc.btn}
                        >
                            <Text style={cc.plusMinus} className="font-inter-medium text-white leading-none">+</Text>
                        </Touchable>
                    </View>
                )}
            </View>

        </Touchable>
    );
};
