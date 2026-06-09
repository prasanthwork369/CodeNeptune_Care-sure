import React, { useState } from 'react';
import { View, Text, TextInput, ActivityIndicator } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { PatientContactInfoProps } from '@/src/types/patient';

export const PatientContactInfo: React.FC<PatientContactInfoProps> = ({ 
    phone, 
    isEditing, 
    onEdit, 
    onSave, 
    saving 
}) => {
    const [localValue, setLocalValue] = useState(phone);

    return (
        <View className="mb-4">
            <Text className="text-[13px] font-inter-semibold text-[#222222] mb-2">Doctor will reach you at</Text>
            <View 
                className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] bg-white"
                style={{ minHeight: 52 }}
            >
                {isEditing ? (
                    <TextInput 
                        className="flex-1 text-[14px] font-inter-semibold text-[#1A1C1E] py-3" 
                        value={localValue} 
                        onChangeText={setLocalValue} 
                        keyboardType="phone-pad" 
                        maxLength={15} 
                        autoFocus 
                        placeholderTextColor="#919EAB" 
                        placeholder="Enter phone number" 
                    />
                ) : (
                    <Text 
                        className="flex-1 text-[14px] py-3" 
                        style={{ 
                            fontFamily: phone ? 'Inter_600SemiBold' : 'Inter_400Regular', 
                            color: phone ? '#1A1C1E' : '#919EAB' 
                        }}
                    >
                        {phone || 'e.g. +91 98765 43210'}
                    </Text>
                )}
                <Touchable 
                    onPress={() => isEditing ? onSave(localValue) : onEdit()} 
                    disabled={saving} 
                    activeOpacity={0.7} 
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#0F7635" />
                    ) : (
                        <Text className="text-[13px] font-inter-bold text-[#0F7635]">
                            {isEditing ? 'Done' : 'Edit'}
                        </Text>
                    )}
                </Touchable>
            </View>
        </View>
    );
};
