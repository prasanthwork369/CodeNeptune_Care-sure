import React from 'react';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { PatientHealthProblemProps } from '@/src/types/patient';

export const PatientHealthProblem: React.FC<PatientHealthProblemProps> = ({ selected, onPress }) => {
    return (
        <View className="mb-4">
            <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">Select Your Health Problem</Text>
            <Touchable 
                onPress={onPress} 
                className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] py-[10px] bg-white" 
                activeOpacity={0.85}
            >
                {selected ? (
                    <View className="flex-row items-center gap-[10px]">
                        <Text className="text-[20px] leading-[24px]">{selected.emoji}</Text>
                        <Text className="text-[14px] font-inter-medium text-[#1A1C1E]">{selected.label}</Text>
                    </View>
                ) : (
                    <Text className="text-[14px] font-inter text-[#919EAB]">Select</Text>
                )}
                <icons.down_arrow width={16} height={16} />
            </Touchable>
        </View>
    );
};
