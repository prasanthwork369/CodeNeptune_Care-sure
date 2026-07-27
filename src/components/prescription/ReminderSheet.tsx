import { icons } from '@/src/constants/icons';
import { ANIMATIONS } from '@/src/constants/images';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { DatePickerModal } from '@/src/components/ui/DatePickerModal';
import { ReminderFrequencyDays, ReminderInput } from '@/src/types/prescription';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReminderSheetProps {
    isVisible: boolean;
    onClose: () => void;
    /** Recurring frequency (chips) or one-time custom date — matches the backend contract. */
    onConfirm?: (input: ReminderInput) => void;
}

const DAY_OPTIONS: ReminderFrequencyDays[] = [7, 14, 21, 30];

const addDays = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};

// "YYYY-MM-DD" from local parts — toISOString() could shift the day across UTC.
const toDateOnly = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const ReminderSheet: React.FC<ReminderSheetProps> = ({ isVisible, onClose, onConfirm }) => {
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    // selectedDays null means the custom date is active.
    const [selectedDays, setSelectedDays] = useState<ReminderFrequencyDays | null>(14);
    const [customDate, setCustomDate] = useState<Date>(addDays(14));
    const [showPicker, setShowPicker] = useState(false);

    const handleConfirm = () => {
        // Date only — the backend owns the delivery hour, same as frequencyDays.
        onConfirm?.(selectedDays !== null ? { frequencyDays: selectedDays } : { remindAt: toDateOnly(customDate) });
        onClose();
    };

    return (
        <Modal visible={isVisible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 items-center justify-center px-4">
                <Pressable className="absolute inset-0" onPress={onClose} />

                {/* Card */}
                <View
                    className="bg-white rounded-3xl w-full overflow-hidden"
                    style={{
                        maxHeight: Math.max(0, screenHeight - insets.top - insets.bottom - 32),
                    }}
                >
                    <ScrollView
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                        style={{ flexShrink: 1 }}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
                    >
                        {/* Calendar icon */}
                        <View className="items-center mb-4">
                            <DotLottie source={ANIMATIONS.calendar} autoplay loop style={{ width: 180, height: 180 }} />
                        </View>

                        {/* Title */}
                        <Text className="font-inter-bold text-brand-text text-center mb-1" style={{ fontSize: moderateScale(18) }}>
                            {"We'll remind you at the right time"}
                        </Text>

                        {/* Subtitle */}
                        <Text className="font-inter-medium text-brand-subtext text-center mb-5" style={{ fontSize: moderateScale(13) }}>
                            When should we remind you
                        </Text>

                        {/* Day chips row */}
                        <View className="flex-row justify-between mb-5" style={{ gap: 5 }}>
                            {DAY_OPTIONS.map((day) => {
                                const isSelected = selectedDays === day;
                                return (
                                    <Touchable
                                        key={day}
                                        onPress={() => setSelectedDays(day)}
                                        activeOpacity={0.8}
                                        className="flex-1 py-2 rounded-full items-center justify-center"
                                        style={{
                                            backgroundColor: isSelected ? '#0F7635' : '#FFFFFF',
                                            borderWidth: 1,
                                            borderColor: isSelected ? '#0F7635' : '#919EAB33',
                                        }}
                                    >
                                        <Text
                                            className="font-inter-semibold"
                                            style={{
                                                color: isSelected ? '#FFFFFF' : '#222222',
                                                fontSize: moderateScale(13),
                                            }}
                                        >
                                            {day} D
                                        </Text>
                                    </Touchable>
                                );
                            })}

                            {/* Custom chip — one-time reminder on a picked date */}
                            <Touchable
                                onPress={() => setShowPicker(true)}
                                activeOpacity={0.8}
                                className="flex-1 py-2.5 px-1 rounded-full items-center justify-center"
                                style={{
                                    backgroundColor: selectedDays === null ? '#0F7635' : '#FFFFFF',
                                    borderWidth: 1,
                                    borderColor: selectedDays === null ? '#0F7635' : '#919EAB33',
                                }}
                            >
                                <Text
                                    className="font-inter-semibold"
                                    style={{
                                        color: selectedDays === null ? '#FFFFFF' : '#222222',
                                        fontSize: moderateScale(13),
                                    }}
                                >
                                    Custom
                                </Text>
                            </Touchable>
                        </View>

                        {/* Info banner */}
                        <View className="flex-row items-center rounded-full px-4 py-2.5" style={{ backgroundColor: '#ECFDF5' }}>
                            <icons.verified_user_outline width={16} height={16} />
                            <Text className="font-inter-medium text-[#0F7635] pl-1 flex-1" style={{ fontSize: moderateScale(12) }}>
                                {"You focus on feeling better, we'll handle the rest"}
                            </Text>
                        </View>
                    </ScrollView>

                    {/* CTA */}
                    <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}>
                        <Touchable activeOpacity={0.85} onPress={handleConfirm} className="bg-[#0F7635] rounded-xl py-4 items-center">
                            <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(16) }}>
                                Yes, Remind me
                            </Text>
                        </Touchable>
                    </View>
                </View>
            </View>

            {/* Custom date picker — date only; delivery hour is the backend's call */}
            <DatePickerModal
                visible={showPicker}
                value={customDate}
                minimumDate={new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onClose={() => setShowPicker(false)}
                onChange={(date: Date) => {
                    setCustomDate(date);
                    setSelectedDays(null);
                    setShowPicker(false);
                }}
            />
        </Modal>
    );
};
