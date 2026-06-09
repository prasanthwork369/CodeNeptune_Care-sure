import React from 'react';
import { View, Text, Image } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { LinearGradient } from 'expo-linear-gradient';
import { HOME_IMAGES } from '@/src/constants/images';
import { UploadMethodCardProps } from '@/src/types/prescription';

const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? '#0F7635' : '#C4C4C4', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        {selected && <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#0F7635' }} />}
    </View>
);

export const UploadMethodCard: React.FC<UploadMethodCardProps> = ({ isSelected, onSelect }) => {
    return (
        <Touchable activeOpacity={0.92} onPress={onSelect}>
            <LinearGradient 
                colors={['#FCF5FF', '#E8F3FF']} 
                start={{ x: 0, y: 0.5 }} 
                end={{ x: 1, y: 0.5 }} 
                style={{ borderRadius: 14, borderWidth: 1, borderColor: '#919EAB33', padding: 14 }}
            >
                <View style={{ backgroundColor: '#D0ECFD', alignSelf: 'flex-start', marginBottom: 12 }} className="rounded px-2 py-0.5">
                    <Text style={{ color: '#1A1C1E', fontSize: 10 }} className="font-inter-semibold uppercase tracking-wider">Order Now</Text>
                </View>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-start flex-1 pr-4">
                        <Image source={HOME_IMAGES.prescription} style={{ width: 30, height: 30 }} resizeMode="contain" />
                        <View className="flex-1 ml-3">
                            <Text className="text-[14px] font-inter-bold text-[#1A1C1E]">Upload Prescription</Text>
                            <Text className="text-[12px] font-inter-medium text-[#6A6A6A] mt-0.5 leading-[17px]">
                                The Following Item Requires Verification Before Purchase
                            </Text>
                        </View>
                    </View>
                    <RadioButton selected={isSelected} />
                </View>
            </LinearGradient>
        </Touchable>
    );
};
