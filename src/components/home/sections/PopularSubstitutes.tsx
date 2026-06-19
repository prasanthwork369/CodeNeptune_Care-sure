import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { CART_BUTTON_HEIGHT } from '@/src/constants/theme';
import { useCartActions } from '@/src/hooks/useCartActions';
import type { Product } from '@/src/types/home';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { ActivityIndicator, Animated, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { HomeProductCardSkeleton } from './HomeProductCardSkeleton';
import { styles as s } from './PopularSubstitutes.styles';

interface PopularSubstitutesProps {
    products: Product[];
    isLoading?: boolean;
    onProductPress?: (id: string) => void;
}

const ACCENT = '#0F7635';
const CONTENT_BG = '#F7FDF9';
const DISCOUNT_BG = '#E8F5E9';

const ProductCard = ({ product, onProductPress }: { product: Product; onProductPress?: (id: string) => void }) => {
    const { width } = useWindowDimensions();
    const cardWidth = (width - 20 - 14 - 36) / 2;
    const cardHeight = cardWidth * 1.75;
    const half = cardHeight / 2;
    const imageSize = half * 0.65;

    const { count, increment, decrement, animations, isPending } = useCartActions({
        medicineId: product.id,
        variantId: null,
        productId: product.productId,
        name: product.name,
        slug: product.slug,
        price: product.price as number,
        originalPrice: product.originalPrice,
        image: product.image,
        requiresPrescription: product.requiresPrescription,
    });
    const { slideAnim, opacityAnim } = animations;

    return (
        <View
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ width: cardWidth, height: cardHeight, borderWidth: 0.77, borderColor: '#919EAB33' }}
        >
            {/* Top 50% — image */}
            <Touchable
                activeOpacity={0.85}
                onPress={() => onProductPress?.(product.productId ?? product.id)}
                style={{ height: half, backgroundColor: CONTENT_BG, paddingBottom: 4 }}
            >
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 12, borderTopRightRadius: 12,alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
                    {!!product.discount && (
                        <View style={{ backgroundColor: DISCOUNT_BG, position: 'absolute', top: 6, left: 8, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 }}>
                            <Text style={[s.badge, { color: ACCENT, fontFamily: 'Inter-ExtraBold' }]}>{product.discount}</Text>
                        </View>
                    )}
                    <Image
                        source={product.image}
                        style={{ width: imageSize, height: imageSize }}
                        contentFit="contain"
                    />
                </View>
            </Touchable>

            {/* Bottom 50% — details + button */}
            <View style={{ height: half, backgroundColor: CONTENT_BG, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: 12, paddingTop: 12, flexDirection: 'column' }}>
                {/* Info — flex:1 absorbs leftover space */}
                <Touchable
                    activeOpacity={0.85}
                    onPress={() => onProductPress?.(product.productId ?? product.id)}
                    style={{ flex: 1 }}
                >
                    <Text style={s.name} className="text-brand-text" numberOfLines={1}>
                        {product.name}
                    </Text>
                    {!!product.description && (
                        <Text style={s.description} className="mt-0.5" numberOfLines={1}>
                            {product.description}
                        </Text>
                    )}
                    <View className="flex-row items-center gap-x-1.5 mt-1.5">
                        <Text style={s.price}>
                            ₹{Number(product.price).toFixed(2)}
                        </Text>
                        {!!product.originalPrice && product.originalPrice > product.price && (
                            <Text style={s.mrp}>
                                ₹{Number(product.originalPrice).toFixed(2)}
                            </Text>
                        )}
                    </View>
                </Touchable>

                {/* Button — fixed padding top & bottom, always at bottom */}
                <View style={{ paddingTop: 6, paddingBottom: 12, alignItems: 'center' }}>
                    {count === 0 ? (
                        <Touchable
                            onPress={increment}
                            disabled={isPending}
                            activeOpacity={0.85}
                            style={s.cartBtn}
                        >
                            <Text style={s.addBtn}>
                                {isPending ? 'Adding...' : 'Add to Cart'}
                            </Text>
                        </Touchable>
                    ) : (
                        <View style={s.cartBtnActive}>
                            <Touchable onPress={decrement} disabled={isPending} activeOpacity={0.7} className="w-9 h-9 items-center justify-center">
                                <Text style={s.counter} className="font-inter-medium text-white leading-none">−</Text>
                            </Touchable>
                            <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
                                {isPending ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Animated.Text
                                        className="font-inter-bold text-white text-center"
                                        style={[s.counterVal, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
                                    >
                                        {count}
                                    </Animated.Text>
                                )}
                            </View>
                            <Touchable onPress={increment} disabled={isPending} activeOpacity={0.7} className="w-9 h-9 items-center justify-center">
                                <Text style={s.counter} className="font-inter-medium text-white leading-none">+</Text>
                            </Touchable>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

export const PopularSubstitutes: React.FC<PopularSubstitutesProps> = ({ products, isLoading, onProductPress }) => {
    return (
        <View className="mt-4 py-6" style={{ position: 'relative' }}>
            <LinearGradient
                colors={['#F2FAF7', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View className="flex-row justify-between items-center mb-4 px-4">
                <View>
                    <Text style={s.sectionTitle} className="text-brand-text">
                        Spend Less on What You Need
                    </Text>
                    <Text style={s.sectionSubtitle} className="mt-1">
                        More Affordable Choices
                    </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image source={HOME_IMAGES.supplements} style={s.headerImage} contentFit="contain" />
                    <Image source={HOME_IMAGES.multivitamin} style={s.headerImage} contentFit="contain" />
                </View>
            </View>

            {isLoading ? (
                <HomeProductCardSkeleton count={4} />
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingLeft: 20, paddingRight: 40, gap: 14 }}
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} onProductPress={onProductPress} />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};
