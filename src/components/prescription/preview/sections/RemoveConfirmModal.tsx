import { icons } from '@/src/constants/icons';
import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

interface RemoveConfirmModalProps {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const RemoveConfirmModal: React.FC<RemoveConfirmModalProps> = ({ visible, onConfirm, onCancel }) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
        <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onCancel}>
            <Pressable onPress={e => e.stopPropagation()}>
                <View className="bg-white rounded-2xl px-6 py-6 w-full">
                    <Text className="text-[17px] font-inter-bold text-[#0F1724] mb-2">Remove Prescription</Text>
                    <Text className="text-[13px] font-inter-medium text-[#6A6A6A] mb-6 leading-5">
                        Are you sure you want to remove this prescription from your list?
                    </Text>
                    <View className="flex-row gap-3">
                        <Touchable
                            activeOpacity={0.7}
                            className="flex-1 items-center justify-center py-3.5 rounded-xl border border-[#919EAB33]"
                            onPress={onCancel}
                        >
                            <Text className="text-[14px] font-inter-semibold text-[#6A6A6A]">Cancel</Text>
                        </Touchable>
                        <Touchable
                            activeOpacity={0.85}
                            className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-xl bg-[#C22923]"
                            onPress={onConfirm}
                        >
                            <icons.delete_red width={16} height={16} fill="#FFFFFF" />
                            <Text className="text-[14px] font-inter-semibold text-white">Remove</Text>
                        </Touchable>
                    </View>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);
