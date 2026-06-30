import { DateWheelPicker } from '@/src/components/ui/DateWheelPicker';
import { icons } from '@/src/constants/icons';
import { ANIMATIONS } from '@/src/constants/images';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { DatePickerModal } from '@/src/components/ui/DatePickerModal';
import { Modal, Pressable, Text, View, Platform } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';

interface ReminderSheetProps {
    isVisible: boolean;
    onClose: () => void;
    onConfirm?: (date: Date) => void;
}

const DAY_OPTIONS = [7, 14, 21, 30];

const addDays = (days: number): Date => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
};

export const ReminderSheet: React.FC<ReminderSheetProps> = ({ isVisible, onClose, onConfirm }) => {
    const [selectedDays, setSelectedDays] = useState<number | null>(14);
    const [customDate, setCustomDate] = useState<Date>(addDays(14));
    const [showPicker, setShowPicker] = useState(false);
    const [tempDate, setTempDate] = useState<Date>(addDays(14));

    const handleDaySelect = (day: number) => {
        setSelectedDays(day);
        setCustomDate(addDays(day));
    };

    const handleSetReminder = () => {
        setCustomDate(tempDate);
        setSelectedDays(null);
        setShowPicker(false);
    };

    const reminderDate = selectedDays !== null ? addDays(selectedDays) : customDate;

    return (
        <>
            {/* ── Main reminder card ── */}
            <Modal
                visible={isVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                navigationBarTranslucent
                onRequestClose={onClose}
            >
                <View className="flex-1 bg-black/60 items-center justify-center px-4">
                    <Pressable className="absolute inset-0" onPress={onClose} />

                    {/* Card */}
                    <View className="bg-white rounded-3xl w-full px-6 pt-6 pb-7">

                        {/* Calendar icon */}
                        <View className="items-center mb-4">
                            <DotLottie
                                source={ANIMATIONS.calendar}
                                autoplay
                                loop
                                style={{ width: 180, height: 180 }}
                            />
                        </View>

                        {/* Title */}
                        <Text className="font-inter-bold text-brand-text text-center mb-1" style={{ fontSize: moderateScale(18, 0.1) }}>
                            {"We'll remind you at the right time"}
                        </Text>

                        {/* Subtitle */}
                        <Text className="font-inter-medium text-brand-subtext text-center mb-5" style={{ fontSize: moderateScale(13, 0.1) }}>
                            When should we remind you
                        </Text>

                        {/* Day chips row */}
                        <View className="flex-row justify-between mb-5" style={{ gap: 5 }}>
                            {DAY_OPTIONS.map((day) => {
                                const isSelected = selectedDays === day;
                                return (
                                    <Touchable
                                        key={day}
                                        onPress={() => handleDaySelect(day)}
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
                                            style={{ color: isSelected ? '#FFFFFF' : '#222222', fontSize: moderateScale(13, 0.1) }}
                                        >
                                            {day} D
                                        </Text>
                                    </Touchable>
                                );
                            })}

                            {/* Custom chip */}
                            <Touchable
                                onPress={() => {
                                    setTempDate(customDate);
                                    setShowPicker(true);
                                }}
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
                                    style={{ color: selectedDays === null ? '#FFFFFF' : '#222222', fontSize: moderateScale(13, 0.1) }}
                                >
                                    Custom
                                </Text>
                            </Touchable>
                        </View>

                        {/* Info banner */}
                        <View
                            className="flex-row items-center rounded-full px-4 py-2.5 mb-5"
                            style={{ backgroundColor: '#ECFDF5' }}
                        >
                            <icons.verified_user_outline width={16} height={16} />
                            <Text className="font-inter-medium text-[#0F7635] pl-1 flex-1" style={{ fontSize: moderateScale(12, 0.1) }}>
                                {"You focus on feeling better, we'll handle the rest"}
                            </Text>
                        </View>

                        {/* CTA */}
                        <Touchable
                            activeOpacity={0.85}
                            onPress={() => { onConfirm?.(reminderDate); onClose(); }}
                            className="bg-[#0F7635] rounded-xl py-4 items-center"
                        >
                            <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(16, 0.1) }}>
                                Yes, Remind me
                            </Text>
                        </Touchable>
                    </View>
                </View>

                {/* ── Date picker bottom sheet ── */}
                <DatePickerModal
                    visible={showPicker}
                    value={tempDate}
                    minimumDate={new Date()}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'inline' : 'default'}
                    onClose={() => setShowPicker(false)}
                    onChange={(date: Date) => {
                        setTempDate(date);
                        setCustomDate(date);
                        setSelectedDays(null);
                        setShowPicker(false);
                    }}
                />

                {/* Android custom wheel picker modal - hidden for now as native picker is active */}
                {/* 
                <Modal
                    visible={showPicker}
                    transparent
                    animationType="slide"
                    statusBarTranslucent
                    navigationBarTranslucent
                    onRequestClose={() => setShowPicker(false)}
                >
                    <View className="flex-1 bg-black/60 justify-end">
                        <Pressable className="absolute inset-0" onPress={() => setShowPicker(false)} />

                        <View className="items-center mb-4 z-10">
                            <Touchable
                                onPress={() => setShowPicker(false)}
                                className="bg-[#424242] w-10 h-10 rounded-full items-center justify-center"
                            >
                                <icons.close_icon width={14} height={14} fill="#FFFFFF" />
                            </Touchable>
                        </View>

                        <View className="bg-white rounded-t-[12px] px-6 pt-6 pb-8">
                            <Text className="font-inter-bold text-brand-text mb-4" style={{ fontSize: moderateScale(16) }}>
                                Remind me at
                            </Text>

                            <DateWheelPicker
                                value={tempDate}
                                onChange={setTempDate}
                            />

                            <Touchable
                                activeOpacity={0.85}
                                onPress={handleSetReminder}
                                className="bg-[#0F7635] rounded-xl py-4 items-center mt-5"
                            >
                                <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(16) }}>
                                    Set Reminder
                                </Text>
                            </Touchable>
                        </View>
                    </View>
                </Modal>
                */}
            </Modal>
        </>
    );
};
