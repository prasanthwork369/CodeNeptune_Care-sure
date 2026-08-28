import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import {
  DuplicateFileModal,
  FileTooLargeModal,
  InfoModal,
} from "@/src/features/prescription/sections/preview";
import { components } from "@/src/constants/theme";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { usePrescriptionUpload } from "../hooks/usePrescriptionUpload";
import { useAuthStore } from "@/src/store/authStore";
import { usePrescriptionDraftStore } from "@/src/store/prescriptionDraftStore";
import { Redirect, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, View } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale } from "@/src/utils/exactScale";
import {
  UploadActions,
  ValidPrescriptionInfo,
  HowItWorks,
  WhyTrustUs,
} from "../sections/upload";
import { styles as s } from "./UploadLayout.styles";

export const UploadLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const isAuthenticated = useAuthStore((st) => st.isAuthenticated);
  const clearItems = usePrescriptionDraftStore((st) => st.clearItems);

  const [infoModal, setInfoModal] = useState<{
    title: string;
    message: string;
    onDismiss?: () => void;
  } | null>(null);
  const [tooLargeSizeMB, setTooLargeSizeMB] = useState<string | null>(null);
  const {
    maxSizeLabel,
    isFetching: isConfigFetching,
    refetch: refetchConfig,
  } = useUploadConfig();
  const [duplicateFile, setDuplicateFile] = useState<{
    name: string;
    size?: number;
    proceed: () => void;
  } | null>(null);
  const {
    pickImage,
    takePhoto,
    pickPdf,
    proceedAfterTooLarge,
    discardPendingTooLarge,
    isProceeding,
  } = usePrescriptionUpload(
    (title, message, onDismiss) => setInfoModal({ title, message, onDismiss }),
    setTooLargeSizeMB,
    (name, size, proceed) => setDuplicateFile({ name, size, proceed }),
  );

  // The screen's own content is static, but every action on it leads straight
  // into a server upload, so it follows the same live-screen rule as the rest
  // of that flow. "error" stays unreachable in practice — the upload config is
  // SQLite-seeded — but the gate is uniform.
  const liveState = useLiveScreenState({ error: null, hasData: true });

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

  // Everything on this screen exists to start an upload, and the upload itself
  // is gated in PreviewLayout. Without this the user picks a file, lands on
  // Preview and only then gets told there is no connection — so the dead end is
  // moved to the front, where the choice is still cheap to abandon.
  if (liveState) {
    return (
      <View style={s.root}>
        <ScreenHeader title="Upload Prescription" />
        {liveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetchConfig()}
            retrying={isConfigFetching}
          />
        ) : (
          <RetryState
            onRetry={() => void refetchConfig()}
            retrying={isConfigFetching}
          />
        )}
      </View>
    );
  }

  return (
    <View style={s.root}>
      {infoModal && (
        <InfoModal
          title={infoModal.title}
          message={infoModal.message}
          onClose={() => setInfoModal(null)}
          onDismiss={infoModal.onDismiss}
        />
      )}

      <FileTooLargeModal
        visible={!!tooLargeSizeMB}
        selectedSizeLabel={`${tooLargeSizeMB} MB`}
        maxSizeLabel={maxSizeLabel}
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
        overScrollMode="auto"
        style={s.scrollView}
        contentContainerStyle={[
          s.scrollContent,
          {
            paddingBottom:
              components.tabBar.height + adjustedBottom + exactScale(40),
          },
        ]}
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
