import { MedicineComparisonLayout } from '@/src/components/prescription/medicine-comparison/MedicineComparisonLayout';
import { useComparisonPrescriptionId } from '@/src/hooks/useComparisonPrescriptionId';
import { usePrescriptionOrderMedicines } from '@/src/hooks/queries/usePrescriptionOrderMedicines';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';

export default function MedicineComparisonScreen() {
    const { prescriptionOrderId, prescriptionId } = useLocalSearchParams<{ prescriptionOrderId: string; prescriptionId?: string }>();
    const { medicines, isLoading, refetch } = usePrescriptionOrderMedicines(prescriptionOrderId ?? '');
    // Entry points without a prescriptionId (notifications) resolve it via the order id.
    const resolvedPrescriptionId = useComparisonPrescriptionId(prescriptionId, prescriptionOrderId);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
                <ActivityIndicator size="large" color="#0F7635" />
            </View>
        );
    }

    if (medicines.length === 0) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB', padding: 24 }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
                    No medicine comparison available for this prescription yet.
                </Text>
                <Touchable
                    onPress={() => refetch()}
                    style={{ backgroundColor: '#0F7635', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
                    activeOpacity={0.85}
                >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Refresh</Text>
                </Touchable>
            </View>
        );
    }

    return (
        <MedicineComparisonLayout
            medicines={medicines}
            prescriptionId={resolvedPrescriptionId}
            prescriptionOrderId={prescriptionOrderId}
        />
    );
}
