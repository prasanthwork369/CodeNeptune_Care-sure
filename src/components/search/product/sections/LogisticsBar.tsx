import React from 'react';
import { View, Text } from 'react-native';
import { logisticsBarStyles as s } from '../../search.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { moderateScale } from '@/src/utils/exactScale';

interface LogisticsBarProps {
    deliveryTime?: string;
    pincode?: string;
    onChangeLocation?: () => void;
}

export const LogisticsBar: React.FC<LogisticsBarProps> = ({
    deliveryTime = '10pm, Tomorrow',
    pincode = '600006',
    onChangeLocation,
}) => {
    return (
        <View className="mx-4 bg-white border border-[#919EAB33] rounded-[12px] flex-row items-center justify-between px-4 py-2 mb-6">
            <View className="flex-row items-center border-r border-[#F3F4F6] pr-4" style={{ flexShrink: 0 }}>
                <icons.shopping_bag width={s.bagIcon.width} height={s.bagIcon.height} />
                <Text className="font-inter text-brand-text ml-2" style={{ fontSize: moderateScale(12) }}>
                    Get by <Text className="font-inter-bold text-brand-text">{deliveryTime}</Text>
                </Text>
            </View>
            <View className="flex-row items-center pl-4 flex-1" style={{ minWidth: 0 }}>
                <icons.location width={s.locIcon.width} height={s.locIcon.height} />
                <Text
                    style={[s.text, { flexShrink: 1 }]}
                    className="font-inter-semibold text-brand-text mx-2"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {pincode}
                </Text>
                <Touchable onPress={onChangeLocation} style={{ flexShrink: 0 }}>
                    <Text style={s.change} className="font-inter-semibold text-brand-primary">Change</Text>
                </Touchable>
            </View>
        </View>
    );
};
