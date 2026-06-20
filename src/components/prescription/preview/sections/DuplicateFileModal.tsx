import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface DuplicateFileModalProps {
    fileName: string;
    fileSizeLabel?: string;
    uploadedLabel?: string;
    onClose: () => void;
    onChooseAnother?: () => void;
}

export const DuplicateFileModal: React.FC<DuplicateFileModalProps> = ({
    fileName,
    fileSizeLabel,
    uploadedLabel = 'Uploaded just now',
    onClose,
    onChooseAnother,
}) => (
    <Modal visible={!!fileName} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
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

                    <Text className="text-[18px] font-inter-bold text-[#0F1724] mb-1.5 text-center">
                        Duplicate File
                    </Text>
                    <Text className="text-[13px] font-inter-medium text-[#6A6A6A] text-center leading-5 mb-5">
                        A file with the same name(&quot;{fileName}&quot;) has already been uploaded
                    </Text>

                    <View className="w-full flex-row items-center bg-white border border-[#919EAB33] rounded-[12px] px-3 py-3 mb-5">
                        <View className="w-10 h-10 rounded-[8px] bg-[#FDEAEA] items-center justify-center mr-3">
                            <Image source={HOME_IMAGES.prescriptionMedicine} style={{ width: 22, height: 22 }} contentFit="contain" />
                        </View>
                        <View className="flex-1">
                            <Text numberOfLines={1} className="text-[13px] font-inter-semibold text-[#0F1724]">
                                {fileName}
                            </Text>
                            <Text className="text-[12px] font-inter-medium text-[#6A6A6A] mt-0.5">
                                {[fileSizeLabel, uploadedLabel].filter(Boolean).join(' | ')}
                            </Text>
                        </View>
                    </View>

                    <Touchable
                        onPress={onChooseAnother ?? onClose}
                        activeOpacity={0.85}
                        className="w-full bg-brand-primary rounded-lg py-3.5 items-center"
                    >
                        <Text className="text-[15px] font-inter-bold text-white">Choose Another File</Text>
                    </Touchable>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);
