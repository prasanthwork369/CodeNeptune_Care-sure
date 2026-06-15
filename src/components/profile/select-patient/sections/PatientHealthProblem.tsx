import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { PatientHealthProblemProps } from '@/src/types/patient';
import { RemoteIcon } from '@/src/components/ui/RemoteIcon';
import { resolveAssetUrl } from '@/src/utils/urls';

export const PatientHealthProblem: React.FC<PatientHealthProblemProps> = ({ selected, onPress, customText, setCustomText }) => {
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
                        {selected.icon && (selected.icon.startsWith('http') || selected.icon.startsWith('/') || selected.icon.includes('.')) ? (
                            <RemoteIcon uri={resolveAssetUrl(selected.icon)} size={24} style={{ borderRadius: 12 }} />
                        ) : (
                            <Text className="text-[20px] leading-[24px]">{selected.icon}</Text>
                        )}
                        <Text className="text-[14px] font-inter-medium text-[#1A1C1E]">{selected.label}</Text>
                    </View>
                ) : (
                    <Text className="text-[14px] font-inter-medium text-[#6A6A6A]">Select</Text>
                )}
                <icons.down_arrow width={16} height={16} />
            </Touchable>

            {selected?.id === 'other' && setCustomText && (
                <View className="mt-2">
                    <TextInput
                        value={customText}
                        onChangeText={setCustomText}
                        placeholder="Type the health problem..."
                        placeholderTextColor="#919EAB"
                        className="w-full text-[14px] font-inter text-[#1A1C1E] bg-white border border-[#919EAB33] rounded-md px-[14px] py-3"
                    />
                </View>
            )}
        </View>
    );
};
