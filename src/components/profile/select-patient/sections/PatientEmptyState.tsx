import { Touchable } from '@/src/components/ui/Touchable';
import React from 'react';
import { Image, Text, View } from 'react-native';

interface PatientEmptyStateProps {
    onAddPress: () => void;
}

export const PatientEmptyState: React.FC<PatientEmptyStateProps> = ({ onAddPress }) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 60 }}>
            <Image
                source={require('../../../../../assets/images/upload/no_patient.png')}
                style={{ width: 220, height: 220, marginBottom: 24 }}
                resizeMode="contain"
            />
            <Text style={{ fontSize: 22, fontFamily: 'Inter-Bold', color: '#1C2024', marginBottom: 10, textAlign: 'center' }}>
                No Patients Added Yet
            </Text>
            <Text style={{ fontSize: 14, fontFamily: 'Inter-Regular', color: '#637381', textAlign: 'center', lineHeight: 20, marginBottom: 28, maxWidth: 280 }}>
                Patient details help doctors provide better care
            </Text>
            <Touchable
                onPress={onAddPress}
                activeOpacity={0.85}
                style={{
                    backgroundColor: '#0F7635',
                    borderRadius: 10,
                    paddingVertical: 14,
                    paddingHorizontal: 28,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    shadowColor: '#0F7635',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 4,
                }}
            >
                <Text style={{ fontSize: 18, color: '#fff', fontFamily: 'Inter-Bold', marginTop: -2 }}>+</Text>
                <Text style={{ fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#fff' }}>
                    Add Patient
                </Text>
            </Touchable>
        </View>
    );
};
