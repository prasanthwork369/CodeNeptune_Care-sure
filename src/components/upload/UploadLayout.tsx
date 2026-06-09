import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { InfoModal } from '@/src/components/prescription/preview/sections';
import { components } from '@/src/constants/theme';
import { usePrescriptionUpload } from '@/src/hooks/ui/usePrescriptionUpload';
import { useAuthStore } from '@/src/store/authStore';
import { Redirect } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    UploadActions,
    ValidPrescriptionInfo,
    HowItWorks,
    WhyTrustUs
} from './sections';

export const UploadLayout: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { isAuthenticated } = useAuthStore();
    const [infoModal, setInfoModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);
    const { pickImage, takePhoto, pickPdf } = usePrescriptionUpload((title, message, onDismiss) => setInfoModal({ title, message, onDismiss }));

    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            {infoModal && <InfoModal title={infoModal.title} message={infoModal.message} onClose={() => setInfoModal(null)} onDismiss={infoModal.onDismiss} />}
            <ScreenHeader title="Upload Prescription" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    padding: 16,
                    gap: 12,
                    paddingBottom: components.tabBar.height + insets.bottom + 40,
                }}
            >
                <UploadActions
                    onPickImage={pickImage}
                    onTakePhoto={takePhoto}
                    onPickPdf={pickPdf}
                />

                <ValidPrescriptionInfo />

                <HowItWorks />

                <WhyTrustUs />
            </ScrollView>
        </View>
    );
};
