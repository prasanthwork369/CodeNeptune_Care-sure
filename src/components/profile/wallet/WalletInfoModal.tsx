import React from 'react';
import { Text, View } from 'react-native';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";

interface WalletInfoModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const WalletInfoModal: React.FC<WalletInfoModalProps> = ({ isVisible, onClose }) => {
    const adjustedBottom = useAdjustedBottomInset();

    return (
        <GorhomBottomSheet
            isVisible={isVisible}
            onClose={onClose}
            backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
            <BottomSheetView className="p-8" style={{ paddingBottom: Math.max(adjustedBottom + 24, 40) }}>
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
            </BottomSheetView>
        </GorhomBottomSheet>
    );
};
