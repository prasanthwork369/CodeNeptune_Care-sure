import React from 'react';
import { Modal, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { icons } from '@/src/constants/icons';

interface WalletInfoModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const WalletInfoModal: React.FC<WalletInfoModalProps> = ({ isVisible, onClose }) => {
    const { bottom } = useSafeAreaInsets();

    return (
        <Modal
            visible={isVisible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/60">
                <Touchable
                    activeOpacity={1}
                    className="flex-1"
                    onPress={onClose}
                />

                {/* Close Button above the sheet */}
                <View className="items-center mb-4">
                    <Touchable
                        onPress={onClose}
                        activeOpacity={0.9}
                        style={{ backgroundColor: '#424242' }}
                        className="w-12 h-12 rounded-full items-center justify-center shadow-lg"
                    >
                        <icons.close_icon width={18} height={18} fill="#D9D9D9" />
                    </Touchable>
                </View>

                {/* Bottom Sheet Content */}
                <View className="bg-white rounded-t-2xl p-8 shadow-2xl" style={{ paddingBottom: Math.max(bottom + 24, 40) }}>
                    <Text className="text-[18px] font-inter-bold text-[#212B36] mb-6">
                        How Your Balance Is Used
                    </Text>

                    <View className="gap-y-4">
                        <View className="flex-row items-start">
                            <Text className="text-[16px] font-inter text-[#6A6A6A] mt-[-2px] mr-2">•</Text>
                            <Text className="text-[12px] font-inter text-[#6A6A6A] flex-1 leading-6">
                                Your added money is used first when placing an order
                                Corporate credits are applied after that
                            </Text>
                        </View>

                       
                    </View>
                </View>
            </View>
        </Modal>
    );
};
