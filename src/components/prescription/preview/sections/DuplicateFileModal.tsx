import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image } from 'expo-image';
import React from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
}) => {
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();

    return (
        <Modal visible={!!fileName} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onClose}>
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    className="w-full"
                    style={{
                        maxHeight: Math.max(0, screenHeight - insets.top - insets.bottom - 32),
                    }}
                >
                    <View className="bg-white rounded-[20px] w-full relative overflow-hidden" style={{ maxHeight: '100%' }}>
                        <Touchable onPress={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F1F2F4] items-center justify-center z-10">
                            <icons.close_dark width={14} height={14} />
                        </Touchable>

                        <ScrollView
                            bounces={false}
                            showsVerticalScrollIndicator={false}
                            style={{ flexShrink: 1 }}
                            contentContainerStyle={{
                                alignItems: 'center',
                                paddingHorizontal: 20,
                                paddingTop: 24,
                            }}
                        >
                            <View className="w-20 h-20 rounded-full bg-[#FDEAEA] items-center justify-center mb-4">
                                <Image source={HOME_IMAGES.prescriptionInfo} style={{ width: 36, height: 36 }} contentFit="contain" />
                            </View>

                            <Text className="font-inter-bold text-[#0F1724] mb-1.5 text-center" style={{ fontSize: moderateScale(18) }}>
                                Duplicate File
                            </Text>
                            <Text className="font-inter-medium text-[#6A6A6A] text-center leading-5 mb-5" style={{ fontSize: moderateScale(13) }}>
                                A file with the same name(&quot;{fileName}&quot;) has already been uploaded
                            </Text>

                            <View className="w-full flex-row items-center bg-white border border-[#919EAB33] rounded-[12px] px-3 py-3">
                                <View className="w-10 h-10 rounded-[8px] bg-[#FDEAEA] items-center justify-center mr-3">
                                    <Image source={HOME_IMAGES.prescriptionMedicine} style={{ width: 22, height: 22 }} contentFit="contain" />
                                </View>
                                <View className="flex-1">
                                    <Text numberOfLines={1} className="font-inter-semibold text-[#0F1724]" style={{ fontSize: moderateScale(13) }}>
                                        {fileName}
                                    </Text>
                                    <Text className="font-inter-medium text-[#6A6A6A] mt-0.5" style={{ fontSize: moderateScale(12) }}>
                                        {[fileSizeLabel, uploadedLabel].filter(Boolean).join(' | ')}
                                    </Text>
                                </View>
                            </View>
                        </ScrollView>

                        <View className="px-5 pt-5 pb-5">
                            <Touchable
                                onPress={onChooseAnother ?? onClose}
                                activeOpacity={0.85}
                                className="w-full bg-brand-primary rounded-lg py-3.5 items-center"
                            >
                                <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(15) }}>
                                    Choose Another File
                                </Text>
                            </Touchable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
