import { SearchBar } from "@/src/components/home/sections/SearchBar";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
    PRESCRIPTION_STATUS,
    PRESCRIPTION_STATUS_LABELS,
} from "@/src/constants/prescription-status";
import { usePrescriptions } from "@/src/hooks/queries/usePrescriptions";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrescriptionHistoryItem } from "./sections";

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
  const insets = useSafeAreaInsets();
  const { source, toPay } = useLocalSearchParams<{
    source?: string;
    toPay?: string;
  }>();
  const { prescriptions, loading, refreshing, refetch } = usePrescriptions({
    category: 2,
  });
  const [search, setSearch] = useState("");

  const mapItem = (item: any) => ({
    id: item.prescriptionOrderId ?? item.id.slice(0, 8).toUpperCase(),
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
  });

  const query = search.trim().toLowerCase();
  const items = prescriptions
    .map(mapItem)
    .filter((item: ReturnType<typeof mapItem>) => {
      if (!query) return true;
      return (
        item.id.toLowerCase().includes(query) ||
        item.patientName.toLowerCase().includes(query) ||
        item.doctorName.toLowerCase().includes(query)
      );
    });

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Prescriptions" />

      <View
        className="flex-row items-stretch px-5 pt-6"
        style={{ gap: 12 }}
      >
        <View className="flex-1">
          <SearchBar placeholder="Search Prescription" onSearch={setSearch} />
        </View>
        <Touchable
          activeOpacity={0.8}
          className="aspect-square items-center justify-center rounded-md border border-[#919EAB33] bg-white"
        >
          <icons.filter_list width={28} height={28} />
        </Touchable>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#0F7635" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PrescriptionHistoryItem item={item} />}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refetch}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-16">
              <Text className="text-[14px] font-inter-medium text-brand-subtext">
                No prescriptions found
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};
