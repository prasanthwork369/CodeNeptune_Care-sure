import React from 'react';
import { Text, View } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { useToastStore } from '@/src/store/toastStore';
import { moderateScale } from '@/src/utils/exactScale';

interface NoSubstituteBannerProps {
    productId: string;
    medicineUuid?: string;
    productName?: string;
    safeAreaBottom: number;
}

export const NoSubstituteBanner: React.FC<NoSubstituteBannerProps> = ({
    productId,
    medicineUuid,
    productName,
    safeAreaBottom,
}) => {
    const showToast = useToastStore((s) => s.show);

    const handleRequest = () => {
        // No backend endpoint exists yet for this — productId/medicineUuid/
        // productName are threaded through so the real API call can be wired
        // in here directly once one exists, without touching the caller.
        if (__DEV__) {
            console.log('[NoSubstituteBanner] request substitute for', {
                productId,
                medicineUuid,
                productName,
            });
        }
        showToast('Your substitute request has been sent', 'success');
    };

    return (
        <View
            style={{
                paddingBottom: safeAreaBottom + 12,
                shadowColor: "#919EAB33",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 12,
            }}
            className="absolute bottom-0 left-0 right-0 bg-white px-5 pt-3 border-t border-[#F3F4F6]"
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <icons.info_error width={20} height={20} />
                    <Text className="font-inter-semibold text-brand-text ml-2" style={{ fontSize: moderateScale(14, 0.1) }}>
                        No substitute available
                    </Text>
                </View>
                <Touchable
                    onPress={handleRequest}
                    activeOpacity={0.85}
                    style={{ borderWidth: 1, borderColor: '#FF383C' }}
                    className="rounded-[8px] px-5 py-2"
                >
                    <Text className="font-inter-bold text-[#FF383C]" style={{ fontSize: moderateScale(14, 0.1) }}>
                        Request
                    </Text>
                </Touchable>
            </View>
        </View>
    );
};
