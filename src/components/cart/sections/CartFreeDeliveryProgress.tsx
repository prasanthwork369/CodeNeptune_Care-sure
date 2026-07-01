import { exactScale } from '@/src/utils/exactScale';
import React from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { LinearGradient } from 'expo-linear-gradient';
import { icons } from '@/src/constants/icons';
import { CartFreeDeliveryProgressProps } from '@/src/types/cart';

export const CartFreeDeliveryProgress: React.FC<CartFreeDeliveryProgressProps> = ({ 
    remainingForFreeDelivery, 
    progress 
}) => {
    return (
        <LinearGradient 
            colors={['#FFF6ED', '#FFFFFF']} 
            start={{ x: 0.5, y: 0 }} 
            end={{ x: 0.5, y: 1 }} 
            style={{ marginHorizontal: exactScale(16), marginTop: exactScale(12), borderRadius: 12, borderWidth: 1, borderColor: '#919EAB33' }}
        >
            <View className="px-4 py-4">
                <View className="flex-row items-center">
                    <icons.moped_package width={22} height={20} />
                    <Text style={s.progressText} className="font-inter-medium text-[#1A1C1E] ml-2">
                        {remainingForFreeDelivery > 0 ? (
                            <>Shop <Text className="font-inter-extrabold">₹{Number(remainingForFreeDelivery).toFixed(2)}</Text> more to free delivery</>
                        ) : (
                            <Text className="font-inter-semibold">{"You've unlocked free delivery!"}</Text>
                        )}
                    </Text>
                </View>
                <View className="h-[6px] bg-[#F1E2C9] rounded-full mt-3 overflow-hidden">
                    <View 
                        className="h-full bg-[#0B0D10] rounded-full" 
                        style={{ width: `${Math.round(progress * 100)}%` }} 
                    />
                </View>
            </View>
        </LinearGradient>
    );
};
