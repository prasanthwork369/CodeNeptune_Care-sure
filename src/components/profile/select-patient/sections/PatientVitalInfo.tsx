import React from 'react';
import { View, Text } from 'react-native';
import { icons } from '@/src/constants/icons';
import { PatientVitalInfoProps } from '@/src/types/patient';

export const PatientVitalInfo: React.FC<PatientVitalInfoProps> = ({ age, gender }) => {
    return (
        <View className="flex-row mb-4" style={{ gap: 12 }}>
            <View className="flex-1">
                <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">Age</Text>
                <View className="border border-[#919EAB33] rounded-lg px-[14px] py-[14px] bg-white">
                    <Text className="text-[14px] font-inter-semibold text-[#1A1C1E]">{age || '—'}</Text>
                </View>
            </View>
            <View>
                <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">Gender</Text>
                <View className="flex-row items-center bg-[#F1FFF6] border border-[#0F763533] rounded-lg px-4 py-[14px]">
                    {gender === 'FEMALE' ? <icons.female width={18} height={18} color="#0F7635" /> : <icons.male width={18} height={18} color="#0F7635" />}
                    <Text className="ml-1.5 text-[13px] font-inter-semibold text-[#0F7635]">
                        {gender ? gender.charAt(0) + gender.slice(1).toLowerCase() : '—'}
                    </Text>
                </View>
            </View>
        </View>
    );
};
