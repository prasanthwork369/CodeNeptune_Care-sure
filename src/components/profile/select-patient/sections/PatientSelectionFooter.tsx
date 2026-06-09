import React from 'react';
import { View, Text, Image } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { HOME_IMAGES } from '@/src/constants/images';
import { PatientSelectionFooterProps } from '@/src/types/patient';

export const PatientSelectionFooter: React.FC<PatientSelectionFooterProps> = ({ 
    toPay, 
    patientName, 
    safeAreaBottom, 
    onProceed 
}) => {
    return (
        <View 
            className="bg-white px-4 pt-4" 
            style={{ 
                borderTopWidth: 1, 
                borderTopColor: '#919EAB22', 
                paddingBottom: safeAreaBottom + 16 
            }}
        >
            <View className="flex-row items-center pb-4">
                <Image 
                    source={HOME_IMAGES.verifiedUser} 
                    style={{ width: 22, height: 22, marginRight: 10 }} 
                    resizeMode="contain" 
                />
                <View className="flex-1">
                    <Text className="text-[14px] font-inter-bold text-[#1A1C1E]">
                        Take care, {patientName ?? 'there'}
                    </Text>
                    <Text className="text-[12px] font-inter-medium text-[#6A6A6A] mt-0.5">
                        Your medicines will be there when you need them
                    </Text>
                </View>
            </View>
            <View style={{ height: 1, backgroundColor: '#919EAB22' }} />
            <View className="flex-row items-center pt-4">
                <View className="mr-4">
                    <Text className="text-[11px] font-inter-medium text-[#6A6A6A]">To Pay</Text>
                    <Text className="text-[18px] font-inter-extrabold text-[#1A1C1E]">₹{Number(toPay).toFixed(2)}</Text>
                </View>
                <Touchable 
                    activeOpacity={0.85} 
                    onPress={onProceed} 
                    className="flex-1 items-center ml-5 justify-center py-4 rounded-lg bg-[#0F7635]"
                >
                    <Text className="text-[15px] font-inter-semibold text-white">Proceed</Text>
                </Touchable>
            </View>
        </View>
    );
};
