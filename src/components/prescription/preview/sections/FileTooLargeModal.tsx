import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';

interface FileTooLargeModalProps {
    visible: boolean;
    selectedSizeLabel: string;
    maxSizeLabel: string;
    onClose: () => void;
    onChooseAnother?: () => void;
}

export const FileTooLargeModal: React.FC<FileTooLargeModalProps> = ({
    visible,
    selectedSizeLabel,
    maxSizeLabel,
    onClose,
    onChooseAnother,
}) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
        <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onClose}>
            <Pressable onPress={e => e.stopPropagation()} className="w-full">
                <View className="bg-white rounded-[20px] px-5 pt-6 pb-5 w-full items-center relative">
                    <Touchable
                        onPress={onClose}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F1F2F4] items-center justify-center"
                    >
                        <icons.close_dark width={14} height={14} />
                    </Touchable>

                    <View className="w-20 h-20 rounded-full bg-[#FDEAEA] items-center justify-center mb-4">
                        <Image source={HOME_IMAGES.prescriptionInfo} style={{ width: 36, height: 36 }} contentFit="contain" />
                    </View>

                    <Text className="font-inter-bold text-[#0F1724] mb-1.5 text-center" style={{ fontSize: moderateScale(18) }}>
                        Oops! File is too large
                    </Text>
                    <Text className="font-inter-medium text-[#6A6A6A] text-center leading-5 mb-5" style={{ fontSize: moderateScale(13) }}>
                        Upload a file under {maxSizeLabel} to continue
                    </Text>

                    <View className="w-full bg-white border border-[#919EAB33] rounded-[12px] px-4 mb-5">
                        <View className="flex-row items-center justify-between py-3 border-b border-[#F0F0F0]">
                            <View className="flex-row items-center">
                                <View className="w-7 h-7 rounded-[6px] bg-[#FDEAEA] items-center justify-center mr-2.5">
                                    <Image source={HOME_IMAGES.prescriptionInstructions} style={{ width: 16, height: 16 }} contentFit="contain" />
                                </View>
                                <Text className="font-inter-medium text-[#0F1724]" style={{ fontSize: moderateScale(13) }}>Selected file size</Text>
                            </View>
                            <Text className="font-inter-bold text-[#E0383D]" style={{ fontSize: moderateScale(13) }}>{selectedSizeLabel}</Text>
                        </View>
                        <View className="flex-row items-center justify-between py-3">
                            <View className="flex-row items-center">
                                <View className="w-7 h-7 rounded-full bg-[#E8F5E9] items-center justify-center mr-2.5">
                                    <icons.verified_user width={16} height={16} fill="#0F7635" />
                                </View>
                                <Text className="font-inter-medium text-[#0F1724]" style={{ fontSize: moderateScale(13) }}>Maximum allowed</Text>
                            </View>
                            <Text className="font-inter-bold text-brand-primary" style={{ fontSize: moderateScale(13) }}>{maxSizeLabel}</Text>
                        </View>
                    </View>

                    <Touchable
                        onPress={onChooseAnother ?? onClose}
                        activeOpacity={0.85}
                        className="w-full bg-brand-primary rounded-lg py-3.5 items-center"
                    >
                        <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(15) }}>Choose Another File</Text>
                    </Touchable>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);
