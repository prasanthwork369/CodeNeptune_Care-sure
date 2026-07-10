import React from 'react';
import { View, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { ChooseMethodFooterProps } from '@/src/types/prescription';
import { moderateScale } from '@/src/utils/exactScale';

export const ChooseMethodFooter: React.FC<ChooseMethodFooterProps> = ({ 
    toPay, 
    safeAreaBottom, 
    canProceed, 
    onProceed,
    buttonLabel
}) => {
    return (
        <View 
            className="bg-white border-t border-[#919EAB33] px-4 flex-row items-center justify-between" 
            style={{ paddingTop: 12, paddingBottom: safeAreaBottom + 12 }}
        >
            <View>
                <Text className="font-inter-medium text-brand-text" style={{ fontSize: moderateScale(11) }}>To Pay</Text>
                <Text className="font-inter-extrabold text-brand-text" style={{ fontSize: moderateScale(18) }}>₹{Number(toPay).toFixed(2)}</Text>
            </View>
            <Touchable
                activeOpacity={0.85}
                onPress={onProceed}
                disabled={!canProceed}
                className="flex-1 ml-10 rounded-lg py-4 items-center"
                style={{ backgroundColor: canProceed ? '#0F7635' : '#919EAB66' }}
            >
                <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(15) }}>
                    {buttonLabel}
                </Text>
            </Touchable>
        </View>
    );
};
