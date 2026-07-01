import { ApiFeaturedSubcategory, ApiFeaturedSubcategoryMetadata } from '@/src/api/category.api';
import { icons } from '@/src/constants/icons';
import { CART_BUTTON_HEIGHT } from '@/src/constants/theme';
import { useCartActions } from '@/src/hooks/useCartActions';
import { formatPackLabel } from '@/src/utils/packLabel';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import {
    ActivityIndicator,
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { HomeProductCardSkeleton } from './HomeProductCardSkeleton';
import { styles as s } from './HealthEssentials.styles';
import { exactScale } from "@/src/utils/exactScale";

const FALLBACK_THEMES = [
    { gradientStart: '#F2FAF7', gradientEnd: '#FFFFFF', text2Color: '#12975E', lineColor: '#12975E' },
    { gradientStart: '#FFF2FC', gradientEnd: '#FFFFFF', text2Color: '#DE399B', lineColor: '#DD3599' },
    { gradientStart: '#EFF9FF', gradientEnd: '#FFFFFF', text2Color: '#2DAAFF', lineColor: '#46B3FB' },
    { gradientStart: '#F3EAFF', gradientEnd: '#FFFFFF', text2Color: '#6957EB', lineColor: '#6957EB' },
];

interface ProductCardProps {
    id: string;
    productId: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    mrp: number;
    discountPercentage: number;
    thumbnailUrl: string;
    accentColor: string;
    onPress: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    id, productId, name, slug, description, price, mrp,
    discountPercentage, thumbnailUrl, accentColor, onPress,
}) => {
    const { width } = useWindowDimensions();
    const cardWidth = (width - 20 - 14 - 36) / 2;
    // Image area height is tied to card width; the details area below it
    // sizes itself to its own content instead of a forced half-split (see
    // PopularSubstitutes.tsx for the same fix and why).
    const imageAreaHeight = cardWidth * 0.875;
    const imageSize = imageAreaHeight * 0.65;

    const { count, increment, decrement, animations, isPending } = useCartActions({
        medicineId: id,
        variantId: null,
        productId, name, slug, price,
        originalPrice: mrp,
        discountPercent: discountPercentage,
        image: thumbnailUrl ? { uri: thumbnailUrl } : undefined,
    });
    const { slideAnim, opacityAnim } = animations;

    const discountLabel = discountPercentage > 0 ? `${Math.round(discountPercentage)}% OFF` : '';
    const discountBg = `${accentColor}1A`;
    const contentBg  = `${accentColor}0D`;

    return (
        <View
            className="bg-white rounded-[12px] overflow-hidden"
            style={{ width: cardWidth, borderWidth: 0.77, borderColor: '#919EAB33' }}
        >
            {/* Image area — fixed height, tied to card width */}
            <Touchable
                activeOpacity={0.85}
                onPress={() => onPress(productId)}
                style={{ height: imageAreaHeight, backgroundColor: contentBg, paddingBottom: exactScale(4) }}
            >
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 12, borderTopRightRadius: 12, alignItems: 'center', justifyContent: 'center', paddingTop: exactScale(24) }}>
                    {!!discountLabel && (
                        <View style={[s.badgeContainer, { backgroundColor: discountBg }]}>
                            <Text style={[s.badge, { color: accentColor, fontWeight: '800' }]}>{discountLabel}</Text>
                        </View>
                    )}
                    <Image
                        source={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
                        style={{ width: imageSize, height: imageSize }}
                        contentFit="contain"
                    />
                </View>
            </Touchable>

            {/* Details area — sized to its own content, not a forced half-split */}
            <View style={{ backgroundColor: contentBg, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, paddingHorizontal: exactScale(12), paddingTop: exactScale(12), flexDirection: 'column' }}>
                <Touchable activeOpacity={0.85} onPress={() => onPress(productId)}>
                    <Text style={s.name} className="font-inter-medium text-brand-text" numberOfLines={1}>{name}</Text>
                    {!!description && (
                        <Text style={s.description} className="mt-0.5" numberOfLines={1}>{description}</Text>
                    )}
                    <View className="flex-row items-center gap-x-1.5 mt-1.5" style={{ marginBottom: exactScale(8) }}>
                        <Text style={s.price}>₹{Number(price).toFixed(2)}</Text>
                        {mrp > price && (
                            <Text style={s.mrp}>₹{Number(mrp).toFixed(2)}</Text>
                        )}
                    </View>
                </Touchable>

                {/* Button — fixed padding, always at bottom */}
                <View style={{ paddingTop: exactScale(6), paddingBottom: exactScale(12), alignItems: 'center' }}>
                    {count === 0 ? (
                        <Touchable
                            onPress={increment}
                            disabled={isPending}
                            activeOpacity={0.85}
                            style={[s.cartBtn, { borderColor: accentColor }]}
                        >
                            <Text style={[s.addBtn, { color: accentColor }]}>
                                {isPending ? 'Adding...' : 'Add to Cart'}
                            </Text>
                        </Touchable>
                    ) : (
                        <View style={[s.cartBtnActive, { backgroundColor: accentColor }]}>
                            <Touchable onPress={decrement} disabled={isPending} activeOpacity={0.7} className="w-9 h-9 items-center justify-center">
                                <Text style={s.counter} className="font-inter-medium text-white leading-none">−</Text>
                            </Touchable>
                            <View style={{ width: exactScale(24), height: exactScale(24), alignItems: 'center', justifyContent: 'center' }}>
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

interface HealthEssentialsSectionProps {
    subcategory: ApiFeaturedSubcategory;
    themeIndex: number;
    onProductPress: (productId: string) => void;
}

const HealthEssentialsSection: React.FC<HealthEssentialsSectionProps> = ({ subcategory, themeIndex, onProductPress }) => {
    const meta: ApiFeaturedSubcategoryMetadata | null = subcategory.featuredMetadata;
    const fallback = FALLBACK_THEMES[themeIndex % FALLBACK_THEMES.length];

    const gradientStart = meta?.bgGradientStart?.trim() || '#FFFFFF';
    const gradientEnd   = meta?.bgGradientEnd?.trim()   || fallback.gradientEnd;
    const text2Color    = meta?.text2Color       || fallback.text2Color;
    const lineColor     = meta?.lineColor        || fallback.lineColor;
    const title         = meta?.text1            || subcategory.categoryName;
    const subtitle      = meta?.text2            || subcategory.name;
    const headerImage   = meta?.featuredImageUrl || subcategory.imageUrl;

    return (
        <View className="mb-6">

            <View style={{ position: 'relative' }}>
                <LinearGradient
                    colors={[gradientStart || '#FFFFFF', gradientEnd || '#FFFFFF']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={StyleSheet.absoluteFillObject}
                />

                <View className="pt-6 pb-8">
                    <View className="px-4 flex-row justify-between items-center mb-4">
                        <View className="flex-1 pr-2">
                            <Text style={s.sectionTitle} className="font-inter-bold text-brand-text">{title}</Text>
                            <View className="mt-1">
                                <Text className="font-inter-extrabold" style={[s.sectionSubtitle, { color: text2Color }]}>{subtitle}</Text>
                                <LinearGradient
                                    colors={[lineColor, 'rgba(255,255,255,0)']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ height: exactScale(3), width: exactScale(160), marginTop: exactScale(6), borderRadius: exactScale(2), opacity: 0.6 }}
                                />
                            </View>
                        </View>
                        {!!headerImage && (
                            <Image source={{ uri: headerImage }} style={{ width: '25%', height: exactScale(75), }} contentFit="contain" />
                        )}
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingLeft: exactScale(20), paddingRight: exactScale(40), gap: exactScale(14) }}
                    >
                        {subcategory.products.map((p) => {
                            const packLabel = formatPackLabel({ packSize: p.packSize, unit: p.unit, dosageForm: p.dosageForm });
                            const displayDesc = packLabel || p.description || '';
                            return (
                                <ProductCard
                                    key={p.id}
                                    id={p.id}
                                    productId={p.productId}
                                    name={p.name}
                                    slug={p.slug}
                                    description={displayDesc}
                                    accentColor={lineColor}
                                    price={Number(p.price)}
                                    mrp={Number(p.mrp ?? p.price)}
                                    discountPercentage={Number(p.discountPercentage)}
                                    thumbnailUrl={p.thumbnailUrl}
                                    onPress={onProductPress}
                                />
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

interface HealthEssentialsProps {
    subcategories: ApiFeaturedSubcategory[];
    isLoading?: boolean;
    onProductPress: (productId: string) => void;
}

export const HealthEssentials: React.FC<HealthEssentialsProps> = React.memo(({ subcategories, isLoading, onProductPress }) => {
    if (isLoading) {
        return (
            <View className="mb-6 mt-2">
                <HomeProductCardSkeleton count={3} />
            </View>
        );
    }

    if (subcategories.length === 0) return null;

    return (
        <>
            {subcategories.map((sub, index) => (
                <HealthEssentialsSection
                    key={sub.id}
                    subcategory={sub}
                    themeIndex={index}
                    onProductPress={onProductPress}
                />
            ))}
        </>
    );
});
HealthEssentials.displayName = 'HealthEssentials';
