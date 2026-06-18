import React from 'react';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { DotLottie } from '@lottiefiles/dotlottie-react-native';
import { icons } from '@/src/constants/icons';
import { ANIMATIONS } from '@/src/constants/images';
import { PreviewSuccessModalProps } from '@/src/types/prescription';

export const PreviewSuccessModal: React.FC<PreviewSuccessModalProps> = ({
    visible,
    onClose,
    onContinue,
    safeAreaBottom
}) => {
    return (
        <GorhomBottomSheet
            isVisible={visible}
            onClose={onClose}
            backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
        >
            <BottomSheetView
                className="items-center px-6 pt-8"
                style={{ paddingBottom: Math.max(safeAreaBottom + 16, 32) }}
            >
                <DotLottie source={ANIMATIONS.orderPlaced} autoplay loop={false} style={{ width: 160, height: 160 }} />
                <Text style={{ fontSize: 20, fontFamily: 'Inter_700Bold', color: '#1A1C1E', marginTop: 8, marginBottom: 16 }}>
                    Prescription Uploaded!
                </Text>
                <View
                    className="flex-row items-center px-4 py-2 rounded-full mb-6"
                    style={{ backgroundColor: '#F2FFFA', borderWidth: 1, borderColor: '#0F763522' }}
                >
                    <icons.verified_user width={14} height={14} fill="#0F7635" />
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: '#0F7635', marginLeft: 6 }}>
                        Your prescription has been submitted successfully
                    </Text>
                </View>
                <Touchable
                    className="w-full items-center justify-center py-4 rounded-xl"
                    style={{ backgroundColor: '#0F7635' }}
                    activeOpacity={0.85}
                    onPress={onContinue}
                >
                    <Text style={{ fontSize: 15, fontFamily: 'Inter_600SemiBold', color: '#fff', letterSpacing: 0.5 }}>
                        Continue
                    </Text>
                </Touchable>
            </BottomSheetView>
        </GorhomBottomSheet>
    );
};
