import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { DuplicateFileModal, FileTooLargeModal, InfoModal } from '@/src/components/prescription/preview/sections';
import { components } from '@/src/constants/theme';
import { usePrescriptionUpload } from '@/src/hooks/ui/usePrescriptionUpload';
import { useAuthStore } from '@/src/store/authStore';
import { usePrescriptionDraftStore } from '@/src/store/prescriptionDraftStore';
import { MAX_SIZE_BYTES } from '@/src/utils/prescription';
import { useFocusEffect } from '@react-navigation/native';
import { Redirect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import {
    UploadActions,
    ValidPrescriptionInfo,
    HowItWorks,
    WhyTrustUs
} from './sections';

export const UploadLayout: React.FC = () => {
    const adjustedBottom = useAdjustedBottomInset();
    const { isAuthenticated } = useAuthStore();
    const { clearItems } = usePrescriptionDraftStore();

    const [infoModal, setInfoModal] = useState<{ title: string; message: string; onDismiss?: () => void } | null>(null);
    const [tooLargeSizeMB, setTooLargeSizeMB] = useState<string | null>(null);
    const [duplicateFile, setDuplicateFile] = useState<{ name: string; size?: number; proceed: () => void } | null>(null);
    const { pickImage, takePhoto, pickPdf, proceedAfterTooLarge, discardPendingTooLarge, isProceeding } = usePrescriptionUpload(
        (title, message, onDismiss) => setInfoModal({ title, message, onDismiss }),
        setTooLargeSizeMB,
        (name, size, proceed) => setDuplicateFile({ name, size, proceed }),
    );

    // Clears picked files when the user leaves this screen without
    // continuing — header back button, hardware back, swipe-back gesture,
    // or switching tabs. Skipped when `isProceeding` is set, i.e. the blur
    // is caused by deliberately navigating onward to preview.
    useFocusEffect(
        useCallback(() => {
            return () => {
                if (!isProceeding.current) clearItems();
                isProceeding.current = false;
            };
        }, [clearItems, isProceeding]),
    );

    if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            {infoModal && <InfoModal title={infoModal.title} message={infoModal.message} onClose={() => setInfoModal(null)} onDismiss={infoModal.onDismiss} />}

            <FileTooLargeModal
                visible={!!tooLargeSizeMB}
                selectedSizeLabel={`${tooLargeSizeMB} MB`}
                maxSizeLabel={`${(MAX_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB`}
                onClose={() => {
                    setTooLargeSizeMB(null);
                    proceedAfterTooLarge();
                }}
                onChooseAnother={() => {
                    setTooLargeSizeMB(null);
                    discardPendingTooLarge();
                }}
            />

            <DuplicateFileModal
                fileName={duplicateFile?.name ?? ""}
                fileSizeLabel={
                    duplicateFile?.size != null
                        ? `${(duplicateFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : undefined
                }
                onClose={() => {
                    const proceed = duplicateFile?.proceed;
                    setDuplicateFile(null);
                    proceed?.();
                }}
                onChooseAnother={() => setDuplicateFile(null)}
            />

            <ScreenHeader title="Upload Prescription" />

            <ScrollView
                showsVerticalScrollIndicator={false}
                className="flex-1"
                contentContainerStyle={{
                    padding: 16,
                    gap: 12,
                    paddingBottom: components.tabBar.height + adjustedBottom + 40,
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
