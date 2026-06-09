import React from 'react';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { useLocationStore } from '@/src/store/locationStore';

interface LogisticsBarProps {
    deliveryTime?: string;
    pincode?: string;
    onChangeLocation?: () => void;
}

export const LogisticsBar: React.FC<LogisticsBarProps> = ({
    deliveryTime = '10pm, Tomorrow',
    pincode,
    onChangeLocation,
}) => {
    const storeLocation = useLocationStore((s) => s.location);
    const storePincode = useLocationStore((s) => s.pincode);

    // Prioritize the location label (like 'Home', 'Office'), then fallback to the pincode, and finally 'Select Location'
    const displayLabel = storeLocation?.label || pincode || storePincode || 'Select ';

    return (
        <View className="mx-4 bg-white border border-[#919EAB33] rounded-[12px] flex-row items-center justify-between px-4 py-4 mb-6">
            <View className="flex-row items-center border-r border-[#F3F4F6] pr-4">
                <icons.shopping_bag width={20} height={20} />
                <Text className="text-[12px] font-inter text-brand-text ml-2">
                    Get by <Text className="font-inter-bold text-brand-text">{deliveryTime}</Text>
                </Text>
            </View>
            <View className="flex-row items-center pl-4">
                <icons.location width={18} height={18} />
                <Text className="text-[12px] font-inter-semibold text-brand-text mx-2">{displayLabel}</Text>
                <Touchable onPress={onChangeLocation}>
                    <Text className="text-[14px] font-inter-semibold text-brand-primary">Change</Text>
                </Touchable>
            </View>
        </View>
    );
};
