import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { HOME_IMAGES } from '@/src/constants/images';

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
            style={{padding: 16 }}
        >
            <Text className="text-[17px] font-inter-bold mb-4 pl-1" style={{ color: '#6B2A75' }}>
                Know Your Medicine
            </Text>

            <View className="bg-white rounded-[12px] px-5 py-6 mb-7 border border-[#E5E7EB]">
                <View className="flex-row items-center mb-6">
                    <View className="w-[48px] h-[48px] bg-[#F1F7FF] rounded-[6px] items-center justify-center mr-4">
                        <Image source={HOME_IMAGES.chemical} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] font-inter-bold text-[#111827] mb-1">Manufacturer/Marketer</Text>
                        <Text style={{ color: '#009989' }} className="text-[14px] font-inter-semibold">{manufacturer}</Text>
                    </View>
                </View>

                <View className="flex-row items-center mb-6">
                    <View className="w-[48px] h-[48px] bg-[#F4F1FF] rounded-[6px] items-center justify-center mr-4">
                        <Image source={HOME_IMAGES.medicine} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] font-inter-bold text-[#111827] mb-1">Consume Type</Text>
                        <Text className="text-[14px] font-inter-medium text-[#6B7280]">{consumeType}</Text>
                    </View>
                </View>

                <View className="flex-row items-center">
                    <View className="w-[48px] h-[48px] bg-[#F1F7FF] rounded-[6px] items-center justify-center mr-4">
                        <Image source={HOME_IMAGES.deliveryBox} style={{ width: 24, height: 24 }} resizeMode="contain" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-[15px] font-inter-bold text-[#111827] mb-1">Return Policy</Text>
                        <Text style={{ color: '#009989' }} className="text-[14px] font-inter-semibold">{returnPolicy}</Text>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};
