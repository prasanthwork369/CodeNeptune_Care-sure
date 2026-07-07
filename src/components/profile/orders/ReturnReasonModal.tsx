import { icons } from '@/src/constants/icons';
import { orderStyles as s } from './orders.styles';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { Touchable } from '@/src/components/ui/Touchable';
import { ReasonDropdown } from '@/src/components/ui/ReasonDropdown';
import { useCancellationReasons } from '@/src/hooks/queries/useCancellationReasons';
import { ReturnItemImages } from '@/src/types/return';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Image, Text, View,
} from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";

export type ReturnReason = {
    reason: string;
    details: string;
    images: ReturnItemImages;
};

interface ReturnReasonModalProps {
    isVisible: boolean;
    onClose: () => void;
    item: { name: string; image: any; pack: string } | null;
    quantity: number;
    initialData: ReturnReason | null;
    onSave: (data: ReturnReason) => void;
}

type SlotKey = keyof ReturnItemImages;

const PHOTO_SLOTS: { key: SlotKey; label: string; type: string }[] = [
    { key: 'front', label: 'Front View', type: 'camera' },
    { key: 'back', label: 'Back View', type: 'camera' },
    { key: 'packaging', label: 'Packaging', type: 'package' },
    { key: 'issue', label: 'Issue Photo', type: 'photo' },
];

const OTHER_OPTION = '__other__';

export function ReturnReasonModal({ isVisible, onClose, item, quantity, initialData, onSave }: ReturnReasonModalProps) {
    const [details, setDetails] = useState(initialData?.details || '');
    // Holds local file:// URIs until final submission, when ReturnProductLayout
    // uploads them all at once and swaps these for the real hosted URLs.
    const [images, setImages] = useState<ReturnItemImages>(initialData?.images || {});
    const [isReasonOpen, setIsReasonOpen] = useState(false);
    const [error, setError] = useState('');

    const { data: reasons = [], isLoading: reasonsLoading } = useCancellationReasons({ applicable_to: 2 });

    const [selectedReasonId, setSelectedReasonId] = useState<number | typeof OTHER_OPTION | null>(null);
    const [otherReason, setOtherReason] = useState('');

    const adjustedBottom = useAdjustedBottomInset();

    useEffect(() => {
        if (isVisible) {
            const matched = reasons.find((r) => r.label === initialData?.reason);
            setSelectedReasonId(matched ? matched.id : initialData?.reason ? OTHER_OPTION : null);
            setOtherReason(matched ? '' : initialData?.reason || '');
            setDetails(initialData?.details || '');
            setImages(initialData?.images || {});
            setIsReasonOpen(false);
            setError('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isVisible, initialData]);

    const isOtherSelected = selectedReasonId === OTHER_OPTION;
    const selectedReason = reasons.find((r) => r.id === selectedReasonId);
    const selectedLabel = isOtherSelected ? 'Other' : selectedReason?.label;

    const selectReason = (id: number | typeof OTHER_OPTION) => {
        setSelectedReasonId(id);
        setIsReasonOpen(false);
        if (error) setError('');
    };

    const handleClose = () => {
        onClose();
    };

    const handleSave = () => {
        const finalReason = isOtherSelected ? otherReason.trim() : selectedReason?.label;
        if (!finalReason) {
            setError(
                isOtherSelected
                    ? 'Please describe the issue with this return.'
                    : 'Please select a reason for this return.',
            );
            return;
        }
        const missingSlot = PHOTO_SLOTS.find((slot) => !images[slot.key]);
        if (missingSlot) {
            setError(`Please upload a photo for "${missingSlot.label}" -- all 4 photos are required.`);
            return;
        }
        onSave({ reason: finalReason, details, images });
        handleClose();
    };

    const pickImage = async (slot: SlotKey) => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'] as ImagePicker.MediaType[],
                quality: 0.8,
                allowsMultipleSelection: false,
            });
            if (result.canceled || result.assets.length === 0) return;

            // Just store the local URI -- no upload yet. The actual upload
            // happens once, for all items, when the user taps "Request Return".
            setImages((prev) => ({ ...prev, [slot]: result.assets[0].uri }));
        } catch {
            // Silently ignore -- the slot just stays empty and the user can retry
        }
    };

    const removeImage = (slot: SlotKey) => {
        setImages((prev) => {
            const next = { ...prev };
            delete next[slot];
            return next;
        });
    };

    function SlotIcon({ type }: { type: string }) {
        if (type === 'camera') return <icons.camera_gray width={24} height={24} />;
        if (type === 'package') return <icons.package_icon width={24} height={24} />;
        return <icons.outline_gallery width={24} height={24} color="#6A6A6A" />;
    }

    return (
        <GorhomBottomSheet
            isVisible={isVisible}
            onClose={onClose}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
                        <BottomSheetScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{
                                paddingHorizontal: 16,
                                paddingTop: 8,
                                paddingBottom: Math.max(adjustedBottom, 16) + 24,
                            }}
                            showsVerticalScrollIndicator={false}
                        >

                            {/* Item Summary */}
                            {item && (
                                <View
                                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, marginBottom: 20, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#919EAB33' }}
                                >
                                    <View style={{ width: 52, height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#919EAB1A' }}>
                                        <Image source={item.image} style={{ width: 40, height: 40 }} resizeMode="contain" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.labelMd} className="font-inter-bold text-[#222222]">{item.name}</Text>
                                        <Text style={s.labelSm} className="font-inter-medium text-brand-subtext" numberOfLines={1}>
                                            {item.pack} • Qty {quantity}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Reason */}
                            <Text className="font-inter-bold text-[#222222] mb-3" style={{ fontSize: moderateScale(14) }}>{"What's the issue with your order?"}</Text>
                            <ReasonDropdown
                                options={reasons}
                                loading={reasonsLoading}
                                isOpen={isReasonOpen}
                                onToggle={() => setIsReasonOpen((v) => !v)}
                                selectedLabel={selectedLabel}
                                selectedId={selectedReasonId}
                                onSelect={(id) => selectReason(id as number)}
                                includeOther
                                isOtherSelected={isOtherSelected}
                                onSelectOther={() => selectReason(OTHER_OPTION)}
                                placeholder="Select the reason"
                            />

                            {/* Spacer so dropdown has room to float over content below */}
                            <View style={{ height: isReasonOpen ? 220 : 0 }} />

                            {isOtherSelected && (
                                <BottomSheetTextInput
                                    placeholder="Describe the issue..."
                                    placeholderTextColor="#6A6A6A"
                                    value={otherReason}
                                    onChangeText={(value) => { setOtherReason(value); if (error) setError(''); }}
                                    multiline
                                    numberOfLines={3}
                                    className="p-4 border border-[#919EAB33] rounded-xl font-inter-medium min-h-[80px] mt-2"
                                    style={{ textAlignVertical: 'top', backgroundColor: '#FFFFFF', fontSize: moderateScale(14) }}
                                />
                            )}

                            {!!error && (
                                <Text className="font-inter-medium text-[#DC2626] mt-3 mb-3" style={{ fontSize: moderateScale(12) }}>{error}</Text>
                            )}

                            {/* Details */}
                            <Text className="font-inter-bold text-[#222222] mb-3" style={{ fontSize: moderateScale(14) }}>Add details</Text>
                            <BottomSheetTextInput
                                multiline
                                numberOfLines={4}
                                placeholder="Please provide more details about the issue with the product"
                                placeholderTextColor="#6A6A6A"
                                className="p-4 border border-[#919EAB33] rounded-xl font-inter-medium min-h-[100px] mb-6"
                                style={{ textAlignVertical: 'top', backgroundColor: '#FFFFFF', fontSize: moderateScale(14) }}
                                value={details}
                                onChangeText={setDetails}
                            />

                            {/* Photo Grid */}
                            <View className="flex-row flex-wrap gap-3 mb-4">
                                {PHOTO_SLOTS.map((slot) => {
                                    const uri = images[slot.key];
                                    return (
                                        <Touchable
                                            key={slot.key}
                                            className="w-[47.5%] h-24 rounded-xl border border-[#919EAB33] items-center justify-center bg-[#FAFAFA] relative overflow-hidden"
                                            activeOpacity={0.7}
                                            onPress={() => pickImage(slot.key)}
                                        >
                                            {uri ? (
                                                <>
                                                    <Image source={{ uri }} className="w-full h-full" resizeMode="cover" />
                                                    <Touchable
                                                        onPress={() => removeImage(slot.key)}
                                                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white items-center justify-center shadow-md"
                                                        style={{ elevation: 4 }}
                                                    >
                                                        <icons.delete_red width={14} height={14} />
                                                    </Touchable>
                                                </>
                                            ) : (
                                                <>
                                                    <SlotIcon type={slot.type} />
                                                    <Text style={s.labelSm} className="font-inter-medium text-brand-subtext mt-2">{slot.label}</Text>
                                                </>
                                            )}
                                        </Touchable>
                                    );
                                })}
                            </View>

                            {/* Action Button */}
                            <Touchable
                                onPress={handleSave}
                                className="bg-[#0F7635] rounded-lg py-4 flex-row items-center justify-center mb-4"
                                activeOpacity={0.8}
                            >
                                <Text style={s.labelLg} className="font-inter-semibold text-white mr-2">
                                    {initialData ? 'Edit the Reason' : 'Add Reason'}
                                </Text>
                                <icons.arrow_forward width={18} height={18} fill="#FFFFFF" />
                            </Touchable>

                        </BottomSheetScrollView>
        </GorhomBottomSheet>
    );
}
