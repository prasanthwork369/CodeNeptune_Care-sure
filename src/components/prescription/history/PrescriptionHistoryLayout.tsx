import type { ApiPrescription, PrescriptionHistoryItemData } from "@/src/types/prescription";
import { SearchBar } from "@/src/components/home/sections/SearchBar";
import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import {
  PRESCRIPTION_STATUS,
  PRESCRIPTION_STATUS_LABELS,
} from "@/src/constants/prescription-status";
import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";
import { useLocalSearchParams } from "expo-router";
import React, { useState, useMemo, useCallback } from "react";
import { Text, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { formatOrderId } from "@/src/utils/order";
import { PrescriptionHistoryItem } from "./sections";

// Status options for the filter sheet. `null` = show all.
const STATUS_FILTERS: { label: string; value: number | null }[] = [
  { label: "All", value: null },
  { label: "Pending", value: PRESCRIPTION_STATUS.NEW },
  { label: "Verified", value: PRESCRIPTION_STATUS.APPROVED },
  { label: "Rejected", value: PRESCRIPTION_STATUS.CANCELLED },
];

const formatDate = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const PrescriptionHistoryLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const { source, toPay } = useLocalSearchParams<{
    source?: string;
    toPay?: string;
  }>();
  const { prescriptions, loading, refreshing, refetch } = usePrescriptions({
    category: 2,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const mapItem = (item: ApiPrescription) => ({
    // Same CS-XXXXXX shape My Orders renders, so one reference reads alike everywhere
    id: formatOrderId(item.prescriptionOrderId ?? item.id),
    rawId: item.id,
    status:
      PRESCRIPTION_STATUS_LABELS[
        item.status as keyof typeof PRESCRIPTION_STATUS_LABELS
      ] ?? PRESCRIPTION_STATUS_LABELS[PRESCRIPTION_STATUS.NEW],
    patientName:
      item.ocrData?.patientName ??
      [item.customer?.firstName, item.customer?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim(),
    doctorName: item.doctorName ?? "",
    uploadedDate: formatDate(item.createdAt),
    image: item.imageUrls ?? [],
    source: source ?? undefined,
    toPay: toPay ?? undefined,
    prescriptionOrderId: item.prescriptionOrderId ?? null,
    reviewNotes: item.reviewNotes ?? null,
    rejectionReasons: item.ocrData?.rejectionReasons ?? [],
  });

  const query = search.trim().toLowerCase();

  const items = useMemo(() => {
    return prescriptions
      .filter((p) => statusFilter === null || p.status === statusFilter)
      .map(mapItem)
      .filter((item: ReturnType<typeof mapItem>) => {
        if (!query) return true;
        return (
          item.id.toLowerCase().includes(query) ||
          item.patientName.toLowerCase().includes(query) ||
          item.doctorName.toLowerCase().includes(query)
        );
      });
  }, [prescriptions, query, source, toPay, statusFilter]);

  const renderItem = useCallback(
    ({ item }: { item: PrescriptionHistoryItemData }) => (
      <PrescriptionHistoryItem item={item} />
    ),
    [],
  );

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Prescriptions" />

      <View className="px-5 pt-6">
        <SearchBar
          placeholder="Search by ID, patient or doctor"
          onSearch={setSearch}
        />
      </View>

      {/* Status filter chips — always visible, "All" selected by default */}
      <View
        className="flex-row flex-wrap px-5 pt-4"
        style={{ gap: exactScale(8) }}
      >
        {STATUS_FILTERS.map((opt) => {
          const selected = statusFilter === opt.value;
          return (
            <Touchable
              key={String(opt.value)}
              activeOpacity={0.8}
              onPress={() => setStatusFilter(opt.value)}
              className="rounded-full border"
              style={{
                paddingHorizontal: exactScale(16),
                paddingVertical: exactScale(8),
                borderColor: selected ? "#0F7635" : "#E0E0E0",
                backgroundColor: selected ? "#0F7635" : "#FFFFFF",
              }}
            >
              <Text
                className="font-inter-medium"
                style={{
                  fontSize: moderateScale(13),
                  color: selected ? "#FFFFFF" : "#6A6A6A",
                }}
              >
                {opt.label}
              </Text>
            </Touchable>
          );
        })}
      </View>

      {loading ? (
        <View style={{ padding: 20, gap: 12 }}>
          <ShimmerBlock height={exactScale(110)} borderRadius={12} />
          <ShimmerBlock height={exactScale(110)} borderRadius={12} />
          <ShimmerBlock height={exactScale(110)} borderRadius={12} />
        </View>
      ) : (
        <FlashList
          data={items}
          // rawId, not the display id — formatOrderId keeps only 6 chars and two can collide
          keyExtractor={(item) => item.rawId}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: adjustedBottom + 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text
                className="font-inter-medium text-brand-subtext"
                style={{ fontSize: moderateScale(14) }}
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
