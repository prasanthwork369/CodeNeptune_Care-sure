import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { HOME_IMAGES } from '@/src/constants/images';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

interface KnowYourMedicineProps {
    manufacturer: string;
    consumeType?: string;
    returnPolicy?: string;
}

export const KnowYourMedicine: React.FC<KnowYourMedicineProps> = ({
    manufacturer,
    consumeType = 'Oral',
    returnPolicy = 'Not Returnable',
}) => {
    return (
        <LinearGradient
            colors={['#FCEBFE', '#FFFFFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{ padding: exactScale(16) }}
        >
            <Text className="font-inter-bold mb-4 pl-1" style={{ color: '#6B2A75', fontSize: moderateScale(17, 0.1) }}>
                Know Your Medicine
            </Text>

            <View className="bg-white rounded-[12px] px-5 py-6 mb-7 border border-[#E5E7EB]">
                <View className="flex-row items-center mb-6">
                    <View className="bg-[#F1F7FF] rounded-[6px] items-center justify-center mr-4" style={{ width: exactScale(48), height: exactScale(48) }}>
                        <Image source={HOME_IMAGES.chemical} style={{ width: exactScale(24), height: exactScale(24) }} contentFit="contain" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-inter-bold text-[#111827] mb-1" style={{ fontSize: moderateScale(15, 0.1) }}>Manufacturer/Marketer</Text>
                        <Text style={{ color: '#009989', fontSize: moderateScale(14, 0.1) }} className="font-inter-semibold">{manufacturer}</Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-6">
                    <View className="bg-[#F4F1FF] rounded-[6px] items-center justify-center mr-4" style={{ width: exactScale(48), height: exactScale(48) }}>
                        <Image source={HOME_IMAGES.medicine} style={{ width: exactScale(24), height: exactScale(24) }} contentFit="contain" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-inter-bold text-[#111827] mb-1" style={{ fontSize: moderateScale(15, 0.1) }}>Consume Type</Text>
                        <Text className="font-inter-medium text-[#6B7280]" style={{ fontSize: moderateScale(14, 0.1) }}>{consumeType}</Text>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <View className="bg-[#F1F7FF] rounded-[6px] items-center justify-center mr-4" style={{ width: exactScale(48), height: exactScale(48) }}>
                        <Image source={HOME_IMAGES.deliveryBox} style={{ width: exactScale(24), height: exactScale(24) }} contentFit="contain" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-inter-bold text-[#111827] mb-1" style={{ fontSize: moderateScale(15, 0.1) }}>Return Policy</Text>
                        <Text style={{ color: '#009989', fontSize: moderateScale(14, 0.1) }} className="font-inter-semibold">{returnPolicy}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};
