import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { PreviewSuccessModalProps } from '@/src/types/prescription';

export const PreviewSuccessModal: React.FC<PreviewSuccessModalProps> = ({
    visible,
    onContinue,
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onContinue}>
            <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onContinue}>
                <Pressable onPress={e => e.stopPropagation()} className="w-full">
                    <View className="bg-white rounded-[20px] px-6 pt-6 pb-6 w-full items-center relative">
                        <Touchable
                            onPress={onContinue}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F1F2F4] items-center justify-center"
                        >
                            <icons.close_dark width={14} height={14} />
                        </Touchable>

                        <View className="w-20 h-20 rounded-full bg-[#E8F5E9] items-center justify-center mb-4">
                            <icons.check_circle width={36} height={36} fill="#0F7635" />
                        </View>

                        <Text className="text-[18px] font-inter-bold text-[#0F1724] mb-1.5 text-center">
                            Upload Successful!
                        </Text>
                        <Text className="text-[13px] font-inter-medium text-[#6A6A6A] text-center leading-5 mb-6">
                            Your prescription has been{"\n"}uploaded successfully
                        </Text>

                        <Touchable
                            className="w-full items-center justify-center py-4 rounded-xl"
                            style={{ backgroundColor: '#0F7635' }}
                            activeOpacity={0.85}
                            onPress={onContinue}
                        >
                            <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff', letterSpacing: 0.5 }}>
                                Great
                            </Text>
                        </Touchable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
