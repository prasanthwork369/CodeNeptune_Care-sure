import React from 'react';
import { View, Text } from 'react-native';
import { RequiresPrescriptionWarningProps } from '@/src/types/prescription';

export const RequiresPrescriptionWarning: React.FC<RequiresPrescriptionWarningProps> = ({ 
    itemCount, 
    items 
}) => {
    return (
        <View style={{ backgroundColor: '#FFFFFF', borderColor: '#919EAB22', borderWidth: 1 }} className="p-3 rounded-md">
            <View className="flex-row items-center mb-2">
                <View 
                    style={{ 
                        width: 18, 
                        height: 18, 
                        borderRadius: 10, 
                        backgroundColor: '#E56F07', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginRight: 8 
                    }}
                >
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700', lineHeight: 14 }}>i</Text>
                </View>
                <Text style={{ color: '#E56F07' }} className="text-[13px] font-inter-bold">
                    {itemCount} Item{itemCount > 1 ? 's' : ''} Requires Prescription
                </Text>
            </View>
            {items.map((item) => (
                <View key={item.id} className="flex-row items-start ml-1 mb-0.5">
                    <Text style={{ color: '#6A6A6A', marginRight: 6, lineHeight: 18 }}>{'•'}</Text>
                    <Text 
                        style={{ color: '#6A6A6A' }} 
                        className="text-[12px] font-inter-medium leading-[18px] flex-1"
                    >
                        {item.medicineName}
                    </Text>
                </View>
            ))}
        </View>
    );
};
