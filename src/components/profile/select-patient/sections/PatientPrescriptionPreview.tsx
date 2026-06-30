import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { PatientPrescriptionPreviewProps } from '@/src/types/patient';
import { moderateScale } from '@/src/utils/exactScale';

const isPdf = (uri: string, type?: string) =>
    type === 'application/pdf' || uri.toLowerCase().endsWith('.pdf');

export const PatientPrescriptionPreview: React.FC<PatientPrescriptionPreviewProps> = ({ items, onAddPress, onItemPress }) => {
    if (items.length === 0) return null;

    return (
        <View className="mb-4">
            <Text className="font-inter-semibold text-[#1A1C1E] mb-[10px]" style={{ fontSize: moderateScale(14) }}>Prescription</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row" style={{ gap: 10 }}>
                    <Touchable onPress={onAddPress} activeOpacity={0.8} className="w-[72px] h-[72px] rounded-[10px] border border-[#919EAB33] bg-[#FCFDFF] items-center justify-center">
                        <icons.add_photo width={24} height={24} />
                    </Touchable>
                    {items.map((item, index) => (
                        <Touchable key={index} activeOpacity={0.8} onPress={() => onItemPress?.(index)} className="w-[72px] h-[72px] rounded-[10px] overflow-hidden border border-[#919EAB33] bg-[#F9FAFB]">
                            {isPdf(item.localUri, item.type) ? (
                                <View className="flex-1 items-center justify-center">
                                    <icons.upload_file width={22} height={22} />
                                    <Text className="font-inter-bold text-[#1A1C1E] mt-0.5" style={{ fontSize: moderateScale(8) }}>PDF</Text>
                                </View>
                            ) : (
                                <Image source={{ uri: item.localUri }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                            )}
                        </Touchable>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
