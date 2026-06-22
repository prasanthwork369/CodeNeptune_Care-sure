import { ReturnReasonModal, ReturnReason } from './ReturnReasonModal';
import { orderStyles as s } from './orders.styles';
import { ReturnSuccessModal } from './ReturnSuccessModal';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { MaterialIcons } from '@expo/vector-icons';
import { useNav } from '@/src/hooks/useNav';
import React, { useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";

const ITEMS = [
    { id: '1', name: 'Paracip 650mg Tablet 10s', brand: 'Cipla', pack: 'Strip of 10 tablets', image: HOME_IMAGES.medicineStrip },
    { id: '2', name: 'Benadryl DR Syrup 150ml', brand: 'Johnson & Johnson', pack: 'Bottle of 150ml', image: HOME_IMAGES.tablet1 },
    { id: '3', name: 'Paracip 650mg Tablet 10s', brand: 'Cipla Ltd', pack: 'Strip of 10 tablets', image: HOME_IMAGES.medicineStrip1 },
    { id: '4', name: 'Parafast 1000mg Injection 100ml', brand: 'Cipla Ltd', pack: 'Strip of 10 tablets', image: HOME_IMAGES.medicineStrip2 },
];

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <View className={`bg-white rounded-lg mx-base ${className}`} style={{ borderWidth: 1, borderColor: '#F0F1F3', elevation: 0 }}>{children}</View>;
}

export const ReturnProductLayout: React.FC = () => {
    const adjustedBottom = useAdjustedBottomInset();
    const router = useNav();
    const [quantities, setQuantities] = useState<Record<string, number>>(Object.fromEntries(ITEMS.map(i => [i.id, 1])));
    const [checked, setChecked] = useState<Record<string, boolean>>(Object.fromEntries(ITEMS.map(i => [i.id, false])));
    const [refundMethod, setRefundMethod] = useState<'wallet' | 'original'>('wallet');
    const [returnReasons, setReturnReasons] = useState<Record<string, ReturnReason | null>>(Object.fromEntries(ITEMS.map(i => [i.id, null])));
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

    function toggleItem(id: string) {
        const newChecked = !checked[id];
        setChecked(prev => ({ ...prev, [id]: newChecked }));
        if (newChecked && !returnReasons[id]) { setEditingItemId(id); setIsModalVisible(true); }
    }
    function updateQty(id: string, delta: number) { setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) })); }

    const RadioOption = ({ method }: { method: 'wallet' | 'original' }) => (
        <Touchable onPress={() => setRefundMethod(method)} activeOpacity={0.8} className="mx-base rounded-lg" style={{ borderWidth: 1.33, borderColor: refundMethod === method ? '#0F7635' : '#919EAB33', backgroundColor: refundMethod === method ? '#F4FBF6' : '#FFFFFF' }}>
            <View className="flex-row items-center px-4 py-4 gap-3">
                <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: refundMethod === method ? '#0F7635' : '#919EAB', alignItems: 'center', justifyContent: 'center' }}>
                    {refundMethod === method && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#0F7635' }} />}
                </View>
                <View className="flex-1">
                    <Text style={[s.labelMd, { fontWeight: '700', color: refundMethod === method ? '#0F7635' : '#0F1724' }]}>{method === 'wallet' ? 'CareSure Wallet' : 'Original Payment Method'}</Text>
                    <Text style={s.labelSm} className="font-inter-medium text-brand-subtext mt-0.5">{method === 'wallet' ? 'Instant refund once the item is picked up successfully' : 'Refund will refelect in 5-7 business days after pickup'}</Text>
                </View>
            </View>
        </Touchable>
    );

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader title="Return Product" backgroundColor="#FFFFFF" showBorder />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12, gap: 10 }}>
                <SectionCard>
                    <View className="flex-row items-center px-4 py-3 gap-3"><icons.check_circle width={22} height={22} fill="#16A34A" /><Text style={s.labelSm} className="font-inter-semibold text-brand-text">Return available till 12 Apr</Text></View>
                    <View className="h-px bg-[#919EAB33]" />
                    <View className="flex-row items-center px-4 py-3 gap-3"><icons.pickup width={22} height={22} fill="#16A34A" /><Text style={s.labelSm} className="font-inter-semibold text-brand-text">Pickup in 2-3 days</Text></View>
                </SectionCard>

                <SectionCard>
                    <Text style={s.labelMd} className="font-inter-bold text-[#222222] px-4 pt-4 pb-3">Selected Items ({Object.values(checked).filter(Boolean).length}/{ITEMS.length})</Text>
                    {ITEMS.map((item, index) => {
                        const isChecked = checked[item.id];
                        return (
                            <View key={item.id}>
                                <View className="flex-row items-start px-4 py-3">
                                    <View className="w-14 h-14 rounded-sm border border-[#919EAB33] bg-[#FAFAFA] items-center justify-center mr-3 overflow-hidden"><Image source={item.image} className="w-[50px] h-[50px]" resizeMode="contain" /></View>
                                    <View className="flex-1">
                                        <Text style={s.labelSm} className="font-inter-semibold text-brand-text" numberOfLines={2}>{item.name}</Text>
                                        <Text style={s.labelSm} className="font-inter-medium text-brand-subtext mt-0.5">{item.brand} • {item.pack}</Text>
                                        <View className="flex-row items-center px-3 py-1 mt-2 gap-3" style={{ borderWidth: 1, borderColor: '#919EAB33', borderRadius: 6, alignSelf: 'flex-start' }}>
                                            <Touchable onPress={() => updateQty(item.id, -1)} activeOpacity={0.7}><Text style={s.labelXl} className="font-inter-medium text-brand-text leading-none">−</Text></Touchable>
                                            <Text style={s.labelSm} className="font-inter-bold text-brand-text min-w-[14px] text-center">{quantities[item.id]}</Text>
                                            <Touchable onPress={() => updateQty(item.id, 1)} activeOpacity={0.7}><Text style={s.labelXl} className="font-inter-medium text-brand-text leading-none">+</Text></Touchable>
                                        </View>
                                    </View>
                                    <Touchable onPress={() => toggleItem(item.id)} activeOpacity={0.7} className="ml-2 mt-0.5 w-6 h-6 rounded items-center justify-center" style={{ borderWidth: 1.5, borderColor: isChecked ? '#0F7635' : '#C4C4C4', backgroundColor: isChecked ? '#0F7635' : 'transparent' }}>
                                        {isChecked && <MaterialIcons name="check" size={14} color="#FFFFFF" />}
                                    </Touchable>
                                </View>
                                {isChecked && returnReasons[item.id] && (
                                    <View className="px-4 pb-4">
                                        <View style={{ height: 1, width: '100%', borderBottomWidth: 1, borderBottomColor: '#919EAB33', borderStyle: 'dashed', marginBottom: 16 }} />
                                        <View className="flex-row items-start justify-between">
                                            <View className="flex-1">
                                                <View className="flex-row items-center gap-2"><MaterialIcons name="info-outline" size={16} color="#6A6A6A" /><Text style={s.labelMd} className="font-inter-bold text-[#222222]">{returnReasons[item.id]?.reason}</Text></View>
                                                <Text className="text-[12px] font-inter-medium text-brand-subtext mt-1">{returnReasons[item.id]?.details}</Text>
                                                <View className="flex-row mt-3 gap-2">{returnReasons[item.id]?.images.map((img, i) => <Image key={i} source={{ uri: img }} className="w-[52px] h-[52px] rounded-lg" resizeMode="cover" />)}</View>
                                            </View>
                                            <Touchable onPress={() => { setEditingItemId(item.id); setIsModalVisible(true); }} activeOpacity={0.7} className="mt-1"><Text style={s.labelSm} className="font-inter-bold text-[#0F7635]">Edit</Text></Touchable>
                                        </View>
                                    </View>
                                )}
                                {index < ITEMS.length - 1 &&                                   <View style={{ borderTopWidth: 1, borderColor: '#E5E7EB',marginHorizontal:10, borderStyle: 'dashed' }} />
                                }
                            </View>
                        );
                    })}
                </SectionCard>

                <RadioOption method="wallet" />
                <RadioOption method="original" />
            </ScrollView>

            <View className="bg-white px-base border-t border-[#F0F0F0]" style={{ paddingTop: 16, paddingBottom: adjustedBottom + 16 }}>
                <View className="mb-4">
                    <Text style={s.labelMd} className="font-inter-bold text-[#222222] mb-1">Pickup Address</Text>
                    <Text style={s.labelSm} className="font-inter-medium text-brand-subtext leading-5">First Floor, 61/30, Nesapakkam, Chennai, TAMIL NADU, 600078{' '}
                        <Text className="text-[#0F7635] text-sm pl-2 font-inter-bold">Change</Text>
                        </Text>
                </View>
                <Touchable className="bg-[#0F7635] rounded-lg py-4 items-center" activeOpacity={0.85} onPress={() => setIsSuccessModalVisible(true)}>
                    <Text style={s.labelLg} className="font-inter-semibold text-white">Request Return</Text>
                </Touchable>
            </View>

            <ReturnReasonModal isVisible={isModalVisible} onClose={() => setIsModalVisible(false)} item={editingItemId ? ITEMS.find(i => i.id === editingItemId) || null : null} quantity={editingItemId ? quantities[editingItemId] : 1} initialData={editingItemId ? returnReasons[editingItemId] : null} onSave={(data) => { if (editingItemId) setReturnReasons(prev => ({ ...prev, [editingItemId]: data })); }} />
            <ReturnSuccessModal isVisible={isSuccessModalVisible} onClose={() => setIsSuccessModalVisible(false)} onGoHome={() => { setIsSuccessModalVisible(false); router.replace('/(tabs)'); }} />
        </View>
    );
};
