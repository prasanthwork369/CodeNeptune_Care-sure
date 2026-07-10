import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { moderateScale } from '@/src/utils/exactScale';

interface PendingPrescriptionModalProps {
    visible: boolean;
    onViewPrescriptions: () => void;
    onClose: () => void;
}

export const PendingPrescriptionModal: React.FC<PendingPrescriptionModalProps> = ({ visible, onViewPrescriptions, onClose }) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
        <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={onClose}>
            <Pressable onPress={e => e.stopPropagation()}>
                <View className="bg-white rounded-2xl px-6 py-6 w-full">
                    <Text className="font-inter-bold text-[#0F1724] mb-2" style={{ fontSize: moderateScale(17) }}>Prescription Pending</Text>
                    <Text className="font-inter-medium text-[#6A6A6A] mb-6 leading-5" style={{ fontSize: moderateScale(13) }}>
                        You already have a prescription under review. Please wait for approval or use your existing prescription.
                    </Text>
                    <View className="flex-row gap-3">
                        <Touchable activeOpacity={0.7} className="flex-1 items-center justify-center py-3.5 rounded-xl border border-[#919EAB33]" onPress={onClose}>
                            <Text className="font-inter-semibold text-[#6A6A6A]" style={{ fontSize: moderateScale(14) }}>Cancel</Text>
                        </Touchable>
                        <Touchable activeOpacity={0.85} className="flex-1 items-center justify-center py-3.5 rounded-xl bg-brand-primary" onPress={onViewPrescriptions}>
                            <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(14) }}>View</Text>
                        </Touchable>
                    </View>
                </View>
            </Pressable>
        </Pressable>
    </Modal>
);
