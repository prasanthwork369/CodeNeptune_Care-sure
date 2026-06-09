import { icons } from '@/src/constants/icons';
import { orderStyles as s } from './orders.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState, useEffect } from 'react';
import {
    Image, ScrollView, Text, View, Modal,
    TextInput, KeyboardAvoidingView, Platform, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

export type ReturnReason = {
    reason: string;
    details: string;
    images: string[];
};

interface ReturnReasonModalProps {
    isVisible: boolean;
    onClose: () => void;
    item: { name: string; image: any; pack: string } | null;
    quantity: number;
    initialData: ReturnReason | null;
    onSave: (data: ReturnReason) => void;
}

const PHOTO_SLOTS = [
    { label: 'Front View', type: 'camera' },
    { label: 'Back View', type: 'camera' },
    { label: 'Packaging', type: 'package' },
    { label: 'Issue Photo', type: 'photo' },
];

const EASE_OUT = Easing.out(Easing.cubic);

export function ReturnReasonModal({ isVisible, onClose, item, quantity, initialData, onSave }: ReturnReasonModalProps) {
    const [reason, setReason] = useState(initialData?.reason || '');
    const [details, setDetails] = useState(initialData?.details || '');
    const [images, setImages] = useState<string[]>(initialData?.images || []);

    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    const sheetY         = useSharedValue(screenHeight);
    const overlayOpacity = useSharedValue(0);
    const panY           = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            setReason(initialData?.reason || '');
            setDetails(initialData?.details || '');
            setImages(initialData?.images || []);
            panY.value           = 0;
            overlayOpacity.value = withTiming(1, { duration: 220, easing: EASE_OUT });
            sheetY.value         = withSpring(0, { damping: 26, stiffness: 280, mass: 0.9 });
        } else {
            panY.value           = 0;
            overlayOpacity.value = withTiming(0, { duration: 200, easing: EASE_OUT });
            sheetY.value         = withTiming(screenHeight, { duration: 260, easing: EASE_OUT });
        }
    }, [isVisible, initialData]);

    const overlayStyle = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
    const sheetStyle   = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value + panY.value }],
    }));

    const handleClose = () => {
        overlayOpacity.value = withTiming(0, { duration: 200, easing: EASE_OUT });
        sheetY.value = withTiming(screenHeight, { duration: 260, easing: EASE_OUT }, (done) => {
            if (done) runOnJS(onClose)();
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            panY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
            if (e.translationY > 100 || e.velocityY > 800) {
                runOnJS(handleClose)();
            } else {
                panY.value = withSpring(0, { damping: 22, stiffness: 300 });
            }
        });

    const handleSave = () => {
        onSave({
            reason: reason || 'Damaged Product',
            details: details || 'The packaging was torn when it arrived.',
            images: images.length > 0 ? images : [
                'https://picsum.photos/200/200?random=1',
                'https://picsum.photos/200/200?random=2',
                'https://picsum.photos/200/200?random=3',
                'https://picsum.photos/200/200?random=4',
            ]
        });
        handleClose();
    };

    function SlotIcon({ type }: { type: string }) {
        if (type === 'camera') return <icons.camera_gray width={24} height={24} />;
        if (type === 'package') return <icons.package_icon width={24} height={24} />;
        return <icons.outline_gallery width={24} height={24} />;
    }

    return (
        <Modal visible={isVisible} transparent animationType="none" onRequestClose={handleClose}>
            {/* Backdrop */}
            <Animated.View
                style={[{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                }, overlayStyle]}
            />

            {/* Sheet */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[{
                    position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center',
                }, sheetStyle]}>

                    {/* Close button above sheet */}
                    <View style={{ marginBottom: 12 }}>
                        <Touchable
                            onPress={handleClose}
                            activeOpacity={0.9}
                            style={{ backgroundColor: '#424242', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                        >
                            <icons.close_icon width={20} height={20} fill="#FFFFFF" />
                        </Touchable>
                    </View>

                    {/* White card */}
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' }}
                    >
                        {/* Drag handle */}
                        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginTop: 12, marginBottom: 4 }} />

                        <ScrollView
                            style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: Math.max(insets.bottom, 16) + 16 }}
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
                            <Text className="text-[14px] font-inter-bold text-[#222222] mb-3">What's the issue with your order?</Text>
                            <Touchable
                                className="flex-row items-center justify-between p-4 border border-[#919EAB33] rounded-xl mb-5"
                                activeOpacity={0.7}
                                style={{ backgroundColor: '#FFFFFF' }}
                            >
                                <Text style={s.labelMd} className="font-inter-medium text-[#222222]">
                                    {reason || 'Select the reason'}
                                </Text>
                                <icons.down_arrow width={16} height={16} fill="#222222" />
                            </Touchable>

                            {/* Details */}
                            <Text className="text-[14px] font-inter-bold text-[#222222] mb-3">Add details</Text>
                            <TextInput
                                multiline
                                numberOfLines={4}
                                placeholder="Please provide more details about the issue with the product"
                                placeholderTextColor="#919EAB"
                                className="p-4 border border-[#919EAB33] rounded-xl text-[14px] font-inter-medium min-h-[100px] mb-6"
                                style={{ textAlignVertical: 'top', backgroundColor: '#FFFFFF' }}
                                value={details}
                                onChangeText={setDetails}
                            />

                            {/* Photo Grid */}
                            <View className="flex-row flex-wrap gap-3 mb-4">
                                {PHOTO_SLOTS.map((slot, idx) => (
                                    <Touchable
                                        key={idx}
                                        className="w-[47.5%] h-24 rounded-xl border border-[#919EAB33] items-center justify-center bg-[#FAFAFA] relative overflow-hidden"
                                        activeOpacity={0.7}
                                    >
                                        {images[idx] ? (
                                            <>
                                                <Image source={{ uri: images[idx] }} className="w-full h-full" resizeMode="cover" />
                                                <Touchable
                                                    onPress={() => {
                                                        const newImages = [...images];
                                                        newImages.splice(idx, 1);
                                                        setImages(newImages);
                                                    }}
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
                                ))}
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

                        </ScrollView>
                    </KeyboardAvoidingView>
                </Animated.View>
            </GestureDetector>
        </Modal>
    );
}
