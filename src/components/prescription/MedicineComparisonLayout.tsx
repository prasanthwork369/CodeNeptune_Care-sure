import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNav } from '@/src/hooks/useNav';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    Text,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '@/src/hooks/queries/useCart';
import { usePrescriptionBannerStore } from '@/src/store/prescriptionBannerStore';
import { AlreadyHaveItemsModal } from './AlreadyHaveItemsModal';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComparisonMedicine {
    id: string;
    saltComposition: string;
    prescribed: {
        name: string;
        manufacturer: string;
        packSize: string;
        image: any;
        mrp: number;
    };
    recommended: {
        id: string;
        productId?: string;
        slug: string;
        name: string;
        manufacturer: string;
        packSize: string;
        image: any;
        price: number;
        mrp: number;
        discountPercent: number;
    };
}

interface MedicineComparisonLayoutProps {
    medicines: ComparisonMedicine[];
    prescriptionId?: string;
}

// ─── Comparison Card ─────────────────────────────────────────────────────────

interface ComparisonCardProps {
    item: ComparisonMedicine;
    cardWidth: number;
    count: number;
    onCountChange: (count: number) => void;
}

const ComparisonCard: React.FC<ComparisonCardProps> = ({ item, cardWidth, count, onCountChange }) => {
    const colWidth = cardWidth / 2;

    return (
        <View style={{ width: cardWidth, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden', marginBottom: 16, backgroundColor: '#fff' }}>

            {/* Salt badge */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 6 }}>
                <icons.info_outline width={13} height={13} fill="#6B7280" />
                <Text style={{ fontSize: 11, fontFamily: 'Inter-Medium', color: '#6B7280', letterSpacing: 0.4 }}>
                    SAME SALT COMPOSITION IN BOTH
                </Text>
            </View>
            <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111827', paddingHorizontal: 14, paddingBottom: 12 }}>
                {item.saltComposition}
            </Text>

            {/* Gradient two-column body */}
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                {/* Left — Prescribed */}
                <View style={{ width: colWidth, padding: 12, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fff' }}>
                    {/* Top info */}
                    <View>
                        <View style={{ borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: '#F9FAFB', overflow: 'hidden' }}>
                            {item.prescribed.image
                                ? <Image source={item.prescribed.image} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
                                : <icons.placeholder width="70%" height="70%" />
                            }
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#111827', lineHeight: 18, marginBottom: 3 }} numberOfLines={2}>
                            {item.prescribed.name}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter-Medium', color: '#6B7280', marginBottom: 2 }} numberOfLines={1}>
                            {item.prescribed.manufacturer}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: '#9CA3AF' }} numberOfLines={1}>
                            {item.prescribed.packSize}
                        </Text>
                    </View>
                    {/* Bottom price */}
                    <View style={{ marginTop: 14 }}>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter-Medium', color: '#6B7280', marginBottom: 2 }}>MRP</Text>
                        <Text style={{ fontSize: 20, fontFamily: 'Inter-ExtraBold', color: '#111827' }}>
                            ₹{Number(item.prescribed.mrp).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Right — Recommendation */}
                <LinearGradient
                    colors={['#EDFFC5', '#FFFFFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{ width: colWidth, padding: 12, flexDirection: 'column', justifyContent: 'space-between' }}
                >
                    {/* Top info */}
                    <View>
                        <View style={{ borderRadius: 10, borderWidth: 1, borderColor: '#C6F0A0', height: 90, alignItems: 'center', justifyContent: 'center', marginBottom: 10, backgroundColor: '#F0FAE8', overflow: 'hidden' }}>
                            {item.recommended.image
                                ? <Image source={item.recommended.image} style={{ width: '80%', height: '80%' }} resizeMode="contain" />
                                : <icons.placeholder width="70%" height="70%" />
                            }
                        </View>
                        <Text style={{ fontSize: 13, fontFamily: 'Inter-Bold', color: '#0F7635', lineHeight: 18, marginBottom: 3 }} numberOfLines={2}>
                            {item.recommended.name}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter-Medium', color: '#6B7280', marginBottom: 2 }} numberOfLines={1}>
                            {item.recommended.manufacturer}
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'Inter-Regular', color: '#9CA3AF' }} numberOfLines={1}>
                            {item.recommended.packSize}
                        </Text>
                    </View>
                    {/* Bottom price + badge + counter */}
                    <View style={{ marginTop: 14 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                            <Text style={{ fontSize: 16, fontFamily: 'Inter-ExtraBold', color: '#111827' }}>
                                ₹{Number(item.recommended.price).toFixed(2)}
                            </Text>
                            <Text style={{ fontSize: 11, fontFamily: 'Inter-Medium', color: '#9CA3AF', textDecorationLine: 'line-through' }}>
                                MRP ₹{Number(item.recommended.mrp).toFixed(2)}
                            </Text>
                        </View>
                        {item.recommended.discountPercent > 0 && (
                            <View style={{ backgroundColor: '#0F7635', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10 }}>
                                <Text style={{ fontSize: 11, fontFamily: 'Inter-Bold', color: '#fff' }}>
                                    {item.recommended.discountPercent}% OFF
                                </Text>
                            </View>
                        )}
                        {count === 0 ? (
                            <Touchable
                                onPress={() => onCountChange(1)}
                                style={{ borderRadius: 10, paddingVertical: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F7635' }}
                            >
                                <Text style={{ fontSize: 14, fontFamily: 'Inter-Bold', color: '#fff' }}>Add</Text>
                            </Touchable>
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', height: 40 }}>
                                <Touchable onPress={() => onCountChange(Math.max(0, count - 1))} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{ fontSize: 22, fontFamily: 'Inter-SemiBold', color: '#111827' }}>−</Text>
                                </Touchable>
                                <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: '#111827', width: 28, textAlign: 'center' }}>
                                    {count}
                                </Text>
                                <Touchable onPress={() => onCountChange(count + 1)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <Text style={{ fontSize: 20, fontFamily: 'Inter-SemiBold', color: '#111827' }}>+</Text>
                                </Touchable>
                            </View>
                        )}
                    </View>
                </LinearGradient>
            </View>
        </View>
    );
};

// ─── Main Layout ──────────────────────────────────────────────────────────────

export const MedicineComparisonLayout: React.FC<MedicineComparisonLayoutProps> = ({ medicines, prescriptionId }) => {
    const router = useNav();
    const { bottom } = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const cardWidth = width - 32;

    const { items: cartItems, addItem, updateItem, clearCart, totalItems } = useCart();
    const { markVerifiedBannerCompleted, isVerifiedBannerCompleted } = usePrescriptionBannerStore();
    const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>({});
    const [isCartModalVisible, setIsCartModalVisible] = useState(false);
    const [isProceeding, setIsProceeding] = useState(false);

    const handleCountChange = (medicineId: string, count: number) => {
        setSelectedCounts(prev => ({
            ...prev,
            [medicineId]: count
        }));
    };

    const handleProceed = async () => {
        const selectedItems = (medicines ?? []).filter(m => (selectedCounts[m.recommended.id] || 0) > 0);

        if (selectedItems.length === 0) {
            Alert.alert('No Items Selected', 'Please select at least one medicine to add to your cart.');
            return;
        }

        if (totalItems > 0) {
            setIsCartModalVisible(true);
        } else {
            await addItemsToCart(false);
        }
    };

    const addItemsToCart = async (replaceCart: boolean) => {
        setIsProceeding(true);
        try {
            if (replaceCart) {
                await clearCart();
            }
            
            const selectedItems = (medicines ?? []).filter(m => (selectedCounts[m.recommended.id] || 0) > 0);
            for (const item of selectedItems) {
                const qty = selectedCounts[item.recommended.id] || 0;
                
                // Check if item is already in cart to avoid duplicate POST validation error
                const existingItem = !replaceCart ? cartItems.find(i => i.medicineId === item.recommended.id) : null;
                
                if (existingItem) {
                    await updateItem(existingItem.id, { quantity: existingItem.quantity + qty });
                } else {
                    await addItem({
                        medicineId: item.recommended.id,
                        variantId: null,
                        medicineName: item.recommended.name,
                        medicineSlug: item.recommended.slug,
                        unitPrice: item.recommended.price,
                        mrp: item.recommended.mrp,
                        discountPercent: item.recommended.discountPercent,
                        quantity: qty,
                        requiresPrescription: false,
                        image: item.recommended.image,
                        metadata: {
                            ...(item.recommended.productId ? { productId: item.recommended.productId } : {}),
                        },
                    });
                }
            }

            // First successful "Add to Cart" from this screen permanently
            // completes the verified banner — it must never reappear after this.
            if (prescriptionId && !isVerifiedBannerCompleted(prescriptionId)) {
                markVerifiedBannerCompleted(prescriptionId);
            }

            setIsCartModalVisible(false);
            router.push('/(modal)/cart');
        } catch (error) {
            console.error('Failed to update cart:', error);
            Alert.alert('Error', 'Failed to add items to cart. Please try again.');
        } finally {
            setIsProceeding(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>

            <ScreenHeader
                title="Medicine Comparison"
                showBorder
                rightSlot={
                    <Touchable
                        onPress={() => router.push('/(modal)/cart')}
                        className="w-12 h-12 rounded-full bg-white border border-[#919EAB33] items-center justify-center shadow-sm"
                        style={{ position: 'relative' }}
                    >
                        <icons.cart_outline width={22} height={22} />
                        {totalItems > 0 && (
                            <View style={{ position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#FF3B30', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
                                <Text style={{ fontSize: 9, fontFamily: 'Inter-Bold', color: '#fff', lineHeight: 12 }}>{totalItems}</Text>
                            </View>
                        )}
                    </Touchable>
                }
            />

            {/* Tab labels — display only */}
            <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}>
                <View style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-Medium', color: '#6B7280' }}>
                        Medicine in Prescription
                    </Text>
                </View>
                <View style={{ flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#E4F5ED' }}>
                    <Text style={{ fontSize: 13, fontFamily: 'Inter-SemiBold', color: '#0F7635' }}>
                        Our Recommendation
                    </Text>
                </View>
            </View>

            {/* Cards */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: bottom + 90 }}
            >
                {(medicines ?? []).map((item) => (
                    <ComparisonCard
                        key={item.id}
                        item={item}
                        cardWidth={cardWidth}
                        count={selectedCounts[item.recommended.id] || 0}
                        onCountChange={(count) => handleCountChange(item.recommended.id, count)}
                    />
                ))}
            </ScrollView>

            {/* Proceed to Cart */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: Math.max(bottom, 16) + 4, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
                <Touchable
                    onPress={handleProceed}
                    disabled={isProceeding}
                    activeOpacity={0.85}
                    style={{ backgroundColor: isProceeding ? '#6B7280' : '#0F7635', borderRadius: 14, paddingVertical: 18, alignItems: 'center' }}
                >
                    <Text style={{ fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#fff' }}>Proceed to Cart</Text>
                </Touchable>
            </View>

            {/* Already Have Items Modal */}
            <AlreadyHaveItemsModal
                visible={isCartModalVisible}
                onClose={() => setIsCartModalVisible(false)}
                onAdd={() => addItemsToCart(false)}
                onReplace={() => addItemsToCart(true)}
                isProceeding={isProceeding}
            />
        </View>
    );
};
