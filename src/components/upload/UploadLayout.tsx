import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { DuplicateFileModal, FileTooLargeModal, InfoModal } from '@/src/components/prescription/preview/sections';
import { components } from '@/src/constants/theme';
import { usePrescriptionUpload } from '@/src/hooks/ui/usePrescriptionUpload';
import { useAuthStore } from '@/src/store/authStore';
import { MAX_SIZE_BYTES } from '@/src/utils/prescription';
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
    const [tooLargeSizeMB, setTooLargeSizeMB] = useState<string | null>(null);
    const [duplicateFile, setDuplicateFile] = useState<{ name: string; size?: number } | null>(null);
    const { pickImage, takePhoto, pickPdf } = usePrescriptionUpload(
        (title, message, onDismiss) => setInfoModal({ title, message, onDismiss }),
        setTooLargeSizeMB,
        (name, size) => setDuplicateFile({ name, size }),
    );

    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            {infoModal && <InfoModal title={infoModal.title} message={infoModal.message} onClose={() => setInfoModal(null)} onDismiss={infoModal.onDismiss} />}

            <FileTooLargeModal
                visible={!!tooLargeSizeMB}
                selectedSizeLabel={`${tooLargeSizeMB} MB`}
                maxSizeLabel={`${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB`}
                onClose={() => setTooLargeSizeMB(null)}
            />

            <DuplicateFileModal
                fileName={duplicateFile?.name ?? ""}
                fileSizeLabel={
                    duplicateFile?.size != null
                        ? `${(duplicateFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : undefined
                }
                onClose={() => setDuplicateFile(null)}
            />

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
