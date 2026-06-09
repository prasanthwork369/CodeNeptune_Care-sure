import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';

interface InfoModalProps {
    title: string;
    message: string;
    onClose: () => void;
    onDismiss?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, message, onClose, onDismiss }) => {
    const handleClose = () => { onClose(); onDismiss?.(); };
    return (
        <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
            <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={handleClose}>
                <Pressable onPress={e => e.stopPropagation()}>
                    <View className="bg-white rounded-2xl px-6 py-6 w-full">
                        <Text className="text-[17px] font-inter-bold text-[#0F1724] mb-2">{title}</Text>
                        <Text className="text-[13px] font-inter-medium text-[#6A6A6A] mb-6 leading-5">{message}</Text>
                        <View className="items-end">
                            <Touchable activeOpacity={0.85} className="items-center justify-center py-2.5 px-8 rounded-full bg-brand-primary" onPress={handleClose}>
                                <Text className="text-[14px] font-inter-semibold text-white">Got it</Text>
                            </Touchable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
