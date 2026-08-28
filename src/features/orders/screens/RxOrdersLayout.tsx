import type { ApiPrescription } from "@/src/features/prescription/types";
import { getPrescriptionImageUrls } from "@/src/features/prescription/utils/prescription";
import { RxOrdersSkeleton } from "../components/PrescriptionSkeleton";
import {
  Prescription,
  PrescriptionCard,
} from "../sections/PrescriptionCard";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import {
  PRESCRIPTION_STATUS,
  PRESCRIPTION_STATUS_LABELS,
} from "@/src/features/prescription/constants/prescription-status";
import { usePrescriptions } from "@/src/features/prescription/hooks/usePrescriptions";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { requireInternet } from "@/src/utils/offline";
import { downloadFile } from "@/src/utils/fileDownload";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import { styles as s } from "./RxOrdersLayout.styles";
import React, { useCallback, useMemo } from "react";
import { Text, View } from "react-native";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapItem(item: ApiPrescription): Prescription {
  return {
    id: item.id,
    rxId: item.prescriptionOrderId ?? `#${item.id}`,
    prescriptionOrderId: item.prescriptionOrderId ?? null,
    status:
      PRESCRIPTION_STATUS_LABELS[
        item.status as keyof typeof PRESCRIPTION_STATUS_LABELS
      ] ?? PRESCRIPTION_STATUS_LABELS[PRESCRIPTION_STATUS.NEW],
    date: formatDate(item.createdAt),
    patient: [item.customer?.firstName, item.customer?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim(),
    doctor: item.doctorName ?? "",
    imageUrls: getPrescriptionImageUrls(item),
    rejectionReasons: item.ocrData?.rejectionReasons ?? [],
    reviewNotes: item.reviewNotes ?? null,
    reminder: item.reminder,
  };
}

export const RxOrdersLayout: React.FC = () => {
  const { prescriptions, loading, refreshing, error, refetch } =
    usePrescriptions({
      category: 2,
    });

  const data = useMemo(() => prescriptions.map(mapItem), [prescriptions]);

  const liveState = useLiveScreenState({
    error,
    hasData: data.length > 0,
    loading,
  });

  const keyExtractor = useCallback((item: Prescription) => item.id, []);

  const handleDownloadPress = useCallback((url: string, fileName: string) => {
    if (!requireInternet()) return;
    downloadFile(url, fileName);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Prescription }) => (
      <PrescriptionCard item={item} onDownloadPress={handleDownloadPress} />
    ),
    [handleDownloadPress],
  );

  if (liveState) {
    return (
      <View style={s.root}>
        <ScreenHeader title="My Prescriptions" backgroundColor="#FFFFFF" />
        {liveState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        ) : (
          <RetryState
            title="Couldn't load prescriptions"
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        )}
      </View>
    );
  }

  return (
    <View style={s.root}>
      <ScreenHeader title="My Prescriptions" backgroundColor="#FFFFFF" />
      {loading ? (
        <RxOrdersSkeleton />
      ) : (
        <AppFlashList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={s.emptyWrap}>
              <Text style={s.emptyText}>
                No prescriptions found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
