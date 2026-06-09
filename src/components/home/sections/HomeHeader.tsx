import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { colors } from '@/src/constants/theme';
import type { DeliveryLocation } from '@/src/types/home';
import { useWalletBalance } from '@/src/hooks/queries/useWallet';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { styles as s } from './HomeHeader.styles';
import { Touchable } from '@/src/components/ui/Touchable';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNav } from '@/src/hooks/useNav';
import { useNotificationStore } from '@/src/store/notificationStore';
import { useAuthStore } from '@/src/store/authStore';
import { usePrescriptions } from '@/src/hooks/queries/usePrescriptions';

const NotificationIcon = icons.notification;

interface HomeHeaderProps {
    location: DeliveryLocation;
    onPressLocation?: () => void;
}


export const HomeHeader: React.FC<HomeHeaderProps> = ({ location, onPressLocation }) => {
    const router = useNav();
    const insets = useSafeAreaInsets();
    const { balance } = useWalletBalance();
    const { isAuthenticated } = useAuthStore();
    const { prescriptions } = usePrescriptions(
        isAuthenticated ? { limit: 1, sortOrder: 'desc', refetchInterval: 3000 } : {}
    );
    const latestRx = prescriptions[0] ?? null;

    const { lastSeenRxId, lastSeenRxStatus } = useNotificationStore();
    const isRxUnread = latestRx && (latestRx.id !== lastSeenRxId || latestRx.status !== lastSeenRxStatus);
    const unreadCount = isRxUnread ? 1 : 0;

    const walletDisplay = balance != null
        ? `₹${Number(balance.walletBalance) % 1 === 0 ? Number(balance.walletBalance).toFixed(0) : Number(balance.walletBalance).toFixed(2)}`
        : '₹0';

    return (
        <View
            className="flex-row justify-between items-center px-5 pb-2"
            style={{ paddingTop: Math.max(insets.top, 20) + 8 }}
        >
            {/* Left: Delivery Location */}
            <View>
                <Text style={s.deliverLabel} className="font-inter-semibold text-[#333232] uppercase tracking-[1px]">
                    DELIVER TO
                </Text>
                <Touchable
                    activeOpacity={0.10}
                    onPress={onPressLocation}
                    accessibilityRole="button"
                    accessibilityLabel={`Change delivery location, current ${location.label || location.city}`}
                    className="flex-row items-center mt-0.5"
                >
                    <Text style={s.locationText} className="font-inter-bold text-brand-text">
                        {(location.label && location.label !== 'DELIVER TO' && location.label !== location.city)
                            ? `${location.label} - ${location.city}`
                            : location.city}
                    </Text>
                    <MaterialIcons name="arrow-drop-down" size={moderateScale(24, 0.3)} color={colors.text} className="ml-0.5" />
                </Touchable>
            </View>

            {/* Right: Wallet + Notification */}
            <View className="flex-row items-start gap-3">
                <Touchable
                    onPress={() => router.push('/profile/wallet')}
                    className="items-center"
                    accessibilityRole="button"
                    accessibilityLabel={`Wallet, balance ${walletDisplay}`}
                >
                    <View style={s.iconBtn} className="rounded-full justify-center items-center bg-white shadow-sm shadow-[#919EAB33] [elevation:2]">
                        <Image source={HOME_IMAGES.wallet} style={s.walletIcon} contentFit="contain" />
                    </View>
                    <View style={s.walletBadgeWrap} className="rounded-[18px] px-1 py-0.5 -mt-3 items-center justify-center bg-white">
                        <Text style={s.walletBadgeText} className="font-inter-bold text-brand-text leading-none">{walletDisplay}</Text>
                    </View>
                </Touchable>

                <Touchable
                    onPress={() => router.push('/notifications')}
                    accessibilityRole="button"
                    accessibilityLabel={`Notifications, ${unreadCount} unread`}
                    style={s.iconBtn}
                    className="rounded-full justify-center items-center bg-white shadow-sm shadow-[#919EAB33] [elevation:2] relative"
                >
                    <NotificationIcon width={moderateScale(24, 0.3)} height={moderateScale(24, 0.3)} color={colors.text} />
                    {unreadCount > 0 && (
                        <View style={s.badge} className="absolute -top-1 -right-1 bg-[#C22923] rounded-full items-center justify-center px-1 border border-white">
                            <Text style={s.badgeText} className="font-inter-bold text-white leading-none">{unreadCount}</Text>
                        </View>
                    )}
                </Touchable>
            </View>
        </View>
    );
};
