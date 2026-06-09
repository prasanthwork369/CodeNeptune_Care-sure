import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { PRESCRIPTION_STATUS, PRESCRIPTION_STATUS_LABELS } from '@/src/constants/prescription-status';
import { usePrescriptions } from '@/src/hooks/queries/usePrescriptions';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PrescriptionHistoryItem } from './sections';

const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const PrescriptionHistoryLayout: React.FC = () => {
    const insets = useSafeAreaInsets();
    const { source, toPay } = useLocalSearchParams<{ source?: string; toPay?: string }>();
    const { prescriptions, loading, refreshing, refetch } = usePrescriptions({ category: 2 });

    const mapItem = (item: any) => ({
        id: item.prescriptionOrderId ?? item.id.slice(0, 8).toUpperCase(),
        rawId: item.id,
        status: PRESCRIPTION_STATUS_LABELS[item.status as keyof typeof PRESCRIPTION_STATUS_LABELS] ?? PRESCRIPTION_STATUS_LABELS[PRESCRIPTION_STATUS.NEW],
        patientName: item.ocrData?.patientName ?? [item.customer?.firstName, item.customer?.lastName].filter(Boolean).join(' ').trim(),
        doctorName: item.doctorName ?? '',
        uploadedDate: formatDate(item.createdAt),
        image: item.imageUrls ?? [],
        source: source ?? undefined,
        toPay: toPay ?? undefined,
    });

    return (
        <View className="flex-1 bg-white">
            <ScreenHeader title="My Prescriptions" />
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator color="#0F7635" />
                </View>
            ) : (
                <FlatList
                    data={prescriptions.map(mapItem)}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <PrescriptionHistoryItem item={item} />
                    )}
                    contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 20, flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                    refreshing={refreshing}
                    onRefresh={refetch}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-16">
                            <Text className="text-[14px] font-inter-medium text-brand-subtext">No prescriptions found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};
