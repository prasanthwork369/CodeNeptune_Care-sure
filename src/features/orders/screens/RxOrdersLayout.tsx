import type { ApiPrescription } from "@/src/features/prescription/types";
import { getPrescriptionImageUrls } from "@/src/features/prescription/utils/prescription";
import { RxOrdersSkeleton } from "../components/PrescriptionSkeleton";
import {
  Prescription,
  PrescriptionCard,
} from "../sections/PrescriptionCard";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import {
  PRESCRIPTION_STATUS,
  PRESCRIPTION_STATUS_LABELS,
} from "@/src/features/prescription/constants/prescription-status";
import { usePrescriptions } from "@/src/features/prescription/hooks/usePrescriptions";
import { requireInternet } from "@/src/utils/offline";
import { downloadFile } from "@/src/utils/fileDownload";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import React, { useCallback, useMemo } from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../orders.styles";

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
    // Keep undefined as-is: undefined = "list didn't include it, fetch it";
    // null = "known: no reminder set". The hook treats them differently.
    reminder: item.reminder,
  };
}

export const RxOrdersLayout: React.FC = () => {
  const { prescriptions, loading, refreshing, refetch } = usePrescriptions({
    category: 2,
  });

  const data = useMemo(() => prescriptions.map(mapItem), [prescriptions]);

  const keyExtractor = useCallback((item: Prescription) => item.id, []);

  // Stable across every row/render — downloads fetch over the network, so
  // gate before starting one. Kept out of renderItem so PrescriptionCard's
  // memo isn't defeated by a fresh function identity on every row render.
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

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Prescriptions" backgroundColor="#FFFFFF" />
      {loading ? (
        <RxOrdersSkeleton />
      ) : (
        <AppFlashList
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text
                style={s.labelMd}
                className="font-inter-medium text-[#6A6A6A]"
              >
                No prescriptions found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
