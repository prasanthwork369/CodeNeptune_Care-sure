import { useCartActions } from '@/src/hooks/useCartActions';
import { useCart } from '@/src/hooks/queries/useCart';
import { CART_BUTTON_HEIGHT } from '@/src/constants/theme';
import Carousel from 'react-native-reanimated-carousel';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, Text, useWindowDimensions, View } from 'react-native';

interface ProductInfoProps {
    productId: string;
    medicineUuid?: string;
    product: {
        name: string;
        slug?: string;
        requiresPrescription?: boolean;
        manufacturer: string;
        description: string;
        price: number;
        originalPrice?: number;
        savingsPercent?: number;
        dosageForm?: string;
        packSize?: number;
        packLabel?: string;
        brandName?: string;
        image: any;
        images?: any[];
    };
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ productId, medicineUuid, product }) => {
    const { width } = useWindowDimensions();
    const [activeIndex, setActiveIndex] = useState(0);
    const imgSize = width * 0.55;

    const { count, increment, decrement, animations, isPending } = useCartActions({
        medicineId: medicineUuid ?? productId,
        variantId: null,
        productId,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        requiresPrescription: product.requiresPrescription,
    });

    const { slideAnim, opacityAnim } = animations;
    const handleIncrement = increment;
    const handleDecrement = decrement;

    const carouselImages = product.images?.length ? product.images : [product.image];

    return (
        <View className="bg-transparent pt-4 pb-4">
            {/* Image Carousel */}
            <View className="mb-8">
                <Carousel
                    width={width}
                    height={imgSize}
                    data={carouselImages}
                    autoPlay={carouselImages.length > 1}
                    autoPlayInterval={3000}
                    loop={carouselImages.length > 1}
                    onSnapToItem={setActiveIndex}
                    renderItem={({ item }) => (
                        <View style={{ width, height: imgSize, alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                source={item}
                                style={{ width: imgSize, height: imgSize }}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                />
                {/* Dot indicators */}
                <View className="flex-row items-center justify-center mt-4 gap-x-1.5">
                    {carouselImages.map((_, index) => (
                        <View
                            key={index}
                            style={{
                                height: 5,
                                width: activeIndex === index ? 18 : 8,
                                borderRadius: 3,
                                backgroundColor: activeIndex === index ? '#009989' : '#E1F0FF',
                            }}
                        />
                    ))}
                </View>
            </View>

            {/* Product Details */}
            <View className="px-5">
                <Text className="text-[13px] font-inter-semibold text-[#009989] mb-1">
                    {product.manufacturer}
                </Text>
                <Text className="text-[20px] font-inter-bold text-[#111827] mb-3 leading-[28px]">
                    {product.name}
                </Text>

                <View className="flex-row items-baseline gap-x-1.5 mb-1">
                    <Text className="text-[24px] font-inter-extrabold text-[#111827]">
                        ₹{Number(product.price).toFixed(2)}
                    </Text>
                    {!!product.originalPrice && product.originalPrice > product.price && (
                        <>
                            <Text className="text-[13px] font-inter-medium text-brand-subtext ml-1">MRP</Text>
                            <Text className="text-[13px] font-inter-medium text-brand-subtext line-through">
                                ₹{Number(product.originalPrice).toFixed(2)}
                            </Text>
                        </>
                    )}
                    {!!product.savingsPercent && (
                        <Text className="text-[14px] font-inter-bold text-[#0F7635] ml-2">
                            {product.savingsPercent}% off
                        </Text>
                    )}
                </View>

                <Text className="text-[12px] font-inter-medium text-brand-subtext uppercase tracking-wider">
                    {product.packLabel ?? `${product.packSize ?? ''} ${product.dosageForm ?? ''}`.trim()}{product.packSize ? ` | ₹${(product.price / product.packSize).toFixed(2)} / UNIT` : ''}{' '}
                    <Text className="normal-case tracking-normal text-brand-subtext">(Inclusive of all Taxes)</Text>
                </Text>
            </View>

            <View className="h-[1px] bg-[#F3F4F6] mt-4 mb-4" />

            {/* Add to Cart */}
            <View className="px-5 flex-row items-center justify-between">
                <View>
                    <View className="flex-row items-baseline gap-x-1.5">
                        <Text className="text-[18px] font-inter-bold text-[#111827]">
                            ₹{Number(product.price).toFixed(2)}
                        </Text>
                        {!!product.originalPrice && product.originalPrice > product.price && (
                            <Text className="text-[12px] font-inter-medium text-brand-subtext line-through">
                                MRP ₹{Number(product.originalPrice).toFixed(2)}
                            </Text>
                        )}
                        {!!product.savingsPercent && (
                            <View className="bg-[#E8F0FE] px-1.5 py-0.5 rounded">
                                <Text className="text-[10px] font-inter-bold text-[#1A73E8]">
                                    {product.savingsPercent}% off
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-[11px] font-inter-medium text-brand-subtext mt-0.5">
                        Inclusive of all Taxes
                    </Text>
                </View>

                {count === 0 ? (
                    <Touchable
                        onPress={handleIncrement}
                        disabled={isPending}
                        activeOpacity={0.85}
                        className="rounded-[10px] px-8 min-w-[120px] items-center justify-center bg-white"
                        style={{ height: CART_BUTTON_HEIGHT, borderWidth: 1, borderColor: '#0F7635' }}
                    >
                        <Text className="text-[14px] font-inter-bold" style={{ color: '#0F7635' }}>
                            {isPending ? 'Adding...' : 'Add to Cart'}
                        </Text>
                    </Touchable>
                ) : (
                    <View className="flex-row items-center justify-between rounded-[10px] w-[120px]" style={{ height: CART_BUTTON_HEIGHT, backgroundColor: '#0F7635' }}>
                        <Touchable
                            onPress={handleDecrement}
                            disabled={isPending}
                            activeOpacity={0.7}
                            className="flex-1 items-center justify-center h-full"
                        >
                            <Text className="text-[20px] font-inter-medium text-white leading-none">−</Text>
                        </Touchable>
                        <View style={{ width: 32, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                            {isPending ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Animated.Text
                                    style={{ transform: [{ translateY: slideAnim }], opacity: opacityAnim }}
                                    className="text-[14px] font-inter-bold text-white text-center px-2"
                                >
                                    {count}
                                </Animated.Text>
                            )}
                        </View>
                        <Touchable
                            onPress={handleIncrement}
                            disabled={isPending}
                            activeOpacity={0.7}
                            className="flex-1 items-center justify-center h-full"
                        >
                            <Text className="text-[20px] font-inter-medium text-white leading-none">+</Text>
                        </Touchable>
                    </View>
                )}
            </View>
        </View>
    );
};
