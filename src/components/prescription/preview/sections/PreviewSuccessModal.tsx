import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { Image } from 'expo-image';
import { PreviewSuccessModalProps } from '@/src/types/prescription';
import { moderateScale } from '@/src/utils/exactScale';

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

                        <View className="w-28 h-28 rounded-full bg-[#F6FFF1] items-center justify-center mb-4">
                            <Image source={HOME_IMAGES.presSuccess} style={{ width: 36, height: 36 }} contentFit="contain" />
                        </View>

                        <Text className="font-inter-bold text-[#222222] mb-1.5 text-center" style={{ fontSize: moderateScale(18, 0.1) }}>
                            Upload Successful!
                        </Text>
                        <Text className="font-inter-medium text-[#6A6A6A] text-center leading-5 mb-6" style={{ fontSize: moderateScale(13, 0.1) }}>
                            Your prescription has been{"\n"}uploaded successfully
                        </Text>

                        <Touchable
                            className="w-full items-center justify-center py-4 rounded-lg"
                            style={{ backgroundColor: '#0F7635' }}
                            activeOpacity={0.85}
                            onPress={onContinue}
                        >
                            <Text style={{ fontSize: moderateScale(15, 0.1), fontWeight: '600', color: '#fff', letterSpacing: 0.5 }}>
                                Great
                            </Text>
                        </Touchable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
