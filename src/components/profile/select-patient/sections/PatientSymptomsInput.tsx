import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { PatientSymptomsInputProps } from '@/src/types/patient';

export const PatientSymptomsInput: React.FC<PatientSymptomsInputProps> = ({ value, onChangeText }) => {
    return (
        <View className="mb-4">
            <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">Help us understand your symptoms</Text>
            <TextInput 
                placeholder="Eg: Mild fever and body pain" 
                placeholderTextColor="#919EAB" 
                multiline 
                value={value} 
                onChangeText={onChangeText} 
                className="border border-[#919EAB33] rounded-md px-[14px] pt-3 pb-3 bg-white text-[14px] font-inter text-[#1A1C1E]" 
                style={{ minHeight: 100, textAlignVertical: 'top' }} 
            />
        </View>
    );
};
