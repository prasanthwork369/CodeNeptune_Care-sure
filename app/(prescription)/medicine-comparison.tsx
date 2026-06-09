import { MedicineComparisonLayout } from '@/src/components/prescription/MedicineComparisonLayout';
import { usePrescriptionOrderMedicines } from '@/src/hooks/queries/usePrescriptionOrderMedicines';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export default function MedicineComparisonScreen() {
    const { prescriptionOrderId, prescriptionId } = useLocalSearchParams<{ prescriptionOrderId: string; prescriptionId?: string }>();
    const { medicines, isLoading, refetch } = usePrescriptionOrderMedicines(prescriptionOrderId ?? '');

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
                <Text style={{ fontSize: 15, fontFamily: 'Inter-Medium', color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
                    No medicine comparison available for this prescription yet.
                </Text>
                <TouchableOpacity
                    onPress={() => refetch()}
                    style={{ backgroundColor: '#0F7635', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32 }}
                    activeOpacity={0.85}
                >
                    <Text style={{ fontSize: 14, fontFamily: 'Inter-SemiBold', color: '#fff' }}>Refresh</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return <MedicineComparisonLayout medicines={medicines} prescriptionId={prescriptionId} />;
}
