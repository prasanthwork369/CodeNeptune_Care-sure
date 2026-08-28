import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Touchable } from "@/src/components/ui/Touchable";
import {
  PRESCRIPTION_STATUS,
  PRESCRIPTION_STATUS_LABELS,
} from "@/src/features/prescription/constants/prescription-status";
import { usePrescriptions } from "@/src/features/prescription/hooks/usePrescriptions";
import type {
  ApiPrescription,
  PrescriptionHistoryItemData,
} from "@/src/features/prescription/types";
import { getPrescriptionImageUrls } from "@/src/features/prescription/utils/prescription";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useLiveScreenState } from "@/src/hooks/ui/useLiveScreenState";
import { exactScale } from "@/src/utils/exactScale";
import { formatOrderId } from "@/src/utils/order";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { PrescriptionHistoryItem } from "../sections/history";
import { styles as s } from "./PrescriptionHistoryLayout.styles";

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
  const { source, toPay, fromPreview } = useLocalSearchParams<{
    source?: string;
    toPay?: string;
    fromPreview?: string;
  }>();
  const { prescriptions, loading, refreshing, error, refetch } =
    usePrescriptions({
      category: 2,
    });
  // Live, like My Orders: statuses (pending/verified/rejected) move
  // server-side, so offline replaces the screen rather than showing a cached
  // list whose status may already be wrong.
  const liveState = useLiveScreenState({
    error,
    hasData: prescriptions.length > 0,
    loading,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);

  const query = search.trim().toLowerCase();

  const items = useMemo(() => {
    const mapItem = (item: ApiPrescription) => ({
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
      image: getPrescriptionImageUrls(item),
      source: source ?? undefined,
      toPay: toPay ?? undefined,
      fromPreview: fromPreview ?? undefined,
      prescriptionOrderId: item.prescriptionOrderId ?? null,
      reviewNotes: item.reviewNotes ?? null,
      rejectionReasons: item.ocrData?.rejectionReasons ?? [],
    });

    return prescriptions
      .filter((p) => statusFilter === null || p.status === statusFilter)
      .map(mapItem)
      .filter((item) => {
        if (!query) return true;
        return (
          item.id.toLowerCase().includes(query) ||
          item.patientName.toLowerCase().includes(query) ||
          item.doctorName.toLowerCase().includes(query) ||
          item.uploadedDate.toLowerCase().includes(query)
        );
      });
  }, [prescriptions, statusFilter, source, toPay, fromPreview, query]);

  const renderItem = useCallback(
    ({ item }: { item: PrescriptionHistoryItemData }) => (
      <PrescriptionHistoryItem item={item} />
    ),
    [],
  );

  if (liveState) {
    return (
      <View style={s.root}>
        <ScreenHeader title="My Prescriptions" />
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
      <ScreenHeader title="My Prescriptions" />

      {/* Search */}
      <SearchBar
        placeholder="Search with order id or date..."
        onSearch={setSearch}
      />

      {/* Filter tabs */}
      <View style={s.filtersRow}>
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <Touchable
              key={f.label}
              onPress={() => setStatusFilter(f.value)}
              activeOpacity={0.8}
              style={[s.filterPill, active && s.filterPillActive]}
            >
              <Text
                style={[
                  s.filterPillText,
                  active && s.filterPillTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Touchable>
          );
        })}
      </View>

      {/* List */}
      <AppFlashList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          ...s.listContent,
          paddingBottom: adjustedBottom + exactScale(16),
        }}
        refreshing={refreshing}
        onRefresh={refetch}
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: exactScale(12) }}>
              {[1, 2, 3].map((k) => (
                <ShimmerBlock
                  key={k}
                  height={exactScale(160)}
                  borderRadius={exactScale(12)}
                />
              ))}
            </View>
          ) : (
            <View style={s.emptyCenter}>
              <Text style={s.emptyTitle}>
                No prescriptions found
              </Text>
              <Text style={s.emptySubtitle}>
                {search ? "Try a different search" : "Your uploaded prescriptions will appear here"}
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};
