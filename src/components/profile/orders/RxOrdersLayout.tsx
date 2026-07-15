import { RxOrdersSkeleton } from "@/src/components/profile/orders/PrescriptionSkeleton";
import {
  Prescription,
  PrescriptionCard,
} from "@/src/components/profile/orders/sections/PrescriptionCard";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import {
  PRESCRIPTION_STATUS,
  PRESCRIPTION_STATUS_LABELS,
} from "@/src/constants/prescription-status";
import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";
import { downloadFile } from "@/src/utils/fileDownload";
import React from "react";
import { FlatList, Text, View } from "react-native";
import { orderStyles as s } from "./orders.styles";

export const RxOrdersLayout: React.FC = () => {
  const { prescriptions, loading, refreshing, refetch } = usePrescriptions({
    category: 2,
  });

  const formatDate = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const mapItem = (item: any): Prescription => ({
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
    imageUrls: item.imageUrls ?? [],
    rejectionReasons: item.ocrData?.rejectionReasons ?? [],
    reviewNotes: item.reviewNotes ?? null,
  });

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Prescriptions" backgroundColor="#FFFFFF" />
      {loading ? (
        <RxOrdersSkeleton />
      ) : (
        <FlatList
          data={prescriptions.map(mapItem)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PrescriptionCard
              item={item}
              onDownloadPress={(url, fileName) => downloadFile(url, fileName)}
            />
          )}
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
