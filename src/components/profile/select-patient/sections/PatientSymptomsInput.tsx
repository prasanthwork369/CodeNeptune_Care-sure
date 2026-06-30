import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { PatientSymptomsInputProps } from '@/src/types/patient';
import { moderateScale } from '@/src/utils/exactScale';

export const PatientSymptomsInput: React.FC<PatientSymptomsInputProps> = ({ value, onChangeText }) => {
    return (
        <View className="mb-4">
            <Text className="font-inter-semibold text-[#1A1C1E] mb-2" style={{ fontSize: moderateScale(13) }}>Help us understand your symptoms</Text>
            <TextInput
                placeholder="Eg: Mild fever and body pain"
                placeholderTextColor="#6A6A6A"
                multiline
                value={value}
                onChangeText={onChangeText}
                className="border border-[#919EAB33] rounded-md px-[14px] pt-3 pb-3 bg-white font-inter text-[#1A1C1E]"
                style={{ minHeight: 100, textAlignVertical: 'top', fontSize: moderateScale(14) }}
            />
        </View>
    );
};
