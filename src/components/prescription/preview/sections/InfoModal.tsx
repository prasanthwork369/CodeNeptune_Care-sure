import React from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { moderateScale } from '@/src/utils/exactScale';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface InfoModalProps {
    title: string;
    message: string;
    onClose: () => void;
    onDismiss?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ title, message, onClose, onDismiss }) => {
    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const handleClose = () => {
        onClose();
        onDismiss?.();
    };
    return (
        <Modal visible transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={handleClose}>
            <Pressable className="flex-1 bg-black/50 items-center justify-center px-6" onPress={handleClose}>
                <Pressable
                    onPress={(e) => e.stopPropagation()}
                    style={{
                        maxHeight: Math.max(0, screenHeight - insets.top - insets.bottom - 32),
                    }}
                >
                    <View className="bg-white rounded-2xl px-6 py-6 w-full" style={{ maxHeight: '100%' }}>
                        <Text className="font-inter-bold text-[#0F1724] mb-2" style={{ fontSize: moderateScale(17) }}>
                            {title}
                        </Text>
                        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{ flexShrink: 1, marginBottom: 24 }}>
                            <Text className="font-inter-medium text-[#6A6A6A] leading-5" style={{ fontSize: moderateScale(13) }}>
                                {message}
                            </Text>
                        </ScrollView>
                        <View className="items-end">
                            <Touchable
                                activeOpacity={0.85}
                                className="items-center justify-center py-2.5 px-8 rounded-full bg-brand-primary"
                                onPress={handleClose}
                            >
                                <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(14) }}>
                                    Got it
                                </Text>
                            </Touchable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};
