import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Touchable } from '@/src/components/ui/Touchable';
import { LinearGradient } from 'expo-linear-gradient';
import { HOME_IMAGES } from '@/src/constants/images';
import { CallMethodCardProps } from '@/src/types/prescription';
import { moderateScale } from '@/src/utils/exactScale';

const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: selected ? '#0F7635' : '#C4C4C4', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        {selected && <View style={{ width: 11, height: 11, borderRadius: 5.5, backgroundColor: '#0F7635' }} />}
    </View>
);

export const CallMethodCard: React.FC<CallMethodCardProps> = ({ isSelected, onSelect }) => {
    return (
        <View style={{ borderRadius: 14, borderWidth: 1, borderColor: '#919EAB33', overflow: 'hidden', backgroundColor: '#fff' }}>
            <Touchable activeOpacity={0.92} onPress={onSelect}>
                <LinearGradient 
                    colors={['#FCF5FF', '#E8F3FF']} 
                    start={{ x: 0, y: 0.5 }} 
                    end={{ x: 1, y: 0.5 }} 
                    style={{ padding: 14 }}
                >
                    <View style={{ backgroundColor: '#D0ECFD', alignSelf: 'flex-start', marginBottom: 12 }} className="rounded px-2 py-0.5">
                        <Text style={{ color: '#1A1C1E', fontSize: moderateScale(10) }} className="font-inter-semibold uppercase tracking-wider">Call Us</Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-start flex-1 pr-4">
                            <View className="w-11 h-11 items-center justify-center">
                                <Image source={HOME_IMAGES.stethoscope} style={{ width: 36, height: 36 }} contentFit="contain" />
                            </View>
                            <View className="flex-1 ml-3">
                                <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: moderateScale(14) }}>{"Don't have a prescription? Call us"}</Text>
                                <Text className="font-inter-medium text-[#6A6A6A] mt-0.5" style={{ fontSize: moderateScale(12), lineHeight: moderateScale(17) }}>
                                    Our pharmacists will assist you and help you complete your order.
                                </Text>
                            </View>
                        </View>
                        <RadioButton selected={isSelected} />
                    </View>
                </LinearGradient>
            </Touchable>
        </View>
    );
};
