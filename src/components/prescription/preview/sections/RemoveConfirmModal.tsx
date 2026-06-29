import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import { Image, type ImageSource } from 'expo-image';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';

interface RemoveConfirmModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    icon?: ImageSource;
    iconBg?: string;
    confirmBg?: string;
}

export const RemoveConfirmModal: React.FC<RemoveConfirmModalProps> = ({
    visible,
    onConfirm,
    onCancel,
    title = 'Remove Prescription',
    message = 'Are you sure you want to remove this prescription from your list?',
    confirmLabel = 'Remove',
    cancelLabel = 'Cancel',
    icon,
    iconBg = '#FDEAEA',
    confirmBg = '#C22923',
}) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
        <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onCancel}>
            <Pressable onPress={e => e.stopPropagation()} className="w-full">
                <View className="bg-white rounded-2xl px-6 py-6 w-full relative">
                    {icon && (
                        <Touchable
                            onPress={onCancel}
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F1F2F4] items-center justify-center"
                        >
                            <icons.close_dark width={14} height={14} />
                        </Touchable>
                    )}

                    {icon && (
                        <View
                            className="self-center w-28 h-28 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: iconBg }}
                        >
                            <Image source={icon} style={{ width: 36, height: 36 }} contentFit="contain" />
                        </View>
                    )}

                    <Text
                        className={`font-inter-bold text-[#222222] mb-2 ${icon ? 'text-center' : ''}`}
                        style={{ fontSize: moderateScale(17, 0.1) }}
                    >
                        {title}
                    </Text>
                    <Text
                        className={`font-inter-medium text-[#6A6A6A] mb-6 leading-5 ${icon ? 'text-center' : ''}`}
                        style={{ fontSize: moderateScale(13, 0.1) }}
                    >
                        {message}
                    </Text>
                    <View className="flex-row gap-4">
                        <Touchable
                            activeOpacity={0.7}
                            className="flex-1 items-center justify-center py-3.5 rounded-lg border border-[#919EAB33]"
                            onPress={onCancel}
                        >
                            <Text className="font-inter-semibold text-[#222222]" style={{ fontSize: moderateScale(14, 0.1) }}>{cancelLabel}</Text>
                        </Touchable>
                        <Touchable
                            activeOpacity={0.85}
                            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-lg"
                            style={{ backgroundColor: confirmBg }}
                            onPress={onConfirm}
                        >
                            {!icon && <icons.delete_red width={16} height={16} fill="#FFFFFF" />}
                            <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(14, 0.1) }}>{confirmLabel}</Text>
                        </Touchable>
                    </View>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);
