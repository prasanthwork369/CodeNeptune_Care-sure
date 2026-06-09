import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { PRESCRIPTION_STATUS } from '@/src/constants/prescription-status';
import { usePrescriptions } from '@/src/hooks/queries/usePrescriptions';
import { useAuthStore } from '@/src/store/authStore';
import { useNotificationStore } from '@/src/store/notificationStore';
import { useNav } from '@/src/hooks/useNav';
import { Touchable } from '@/src/components/ui/Touchable';
import React, { useEffect } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { styles as s } from './notifications.styles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { icons } from '@/src/constants/icons';

import { HOME_IMAGES } from '@/src/constants/images';
import PRESCRIPTION_ICON from '../../../assets/images/home/prescription.png';

const RX_CONFIG = {
    [PRESCRIPTION_STATUS.NEW]: {
        title: 'Prescription Under Review',
        iconBg: '#EFF6FF',
        borderColor: '#BFDBFE',
        chipBg: '#DBEAFE',
        chipText: '#1D4ED8',
        chipLabel: 'Under Review',
    },
    [PRESCRIPTION_STATUS.APPROVED]: {
        title: 'Prescription Verified',
        iconBg: '#E6F4EC',
        borderColor: '#D1FAE5',
        chipBg: '#DCFCE7',
        chipText: '#0F7635',
        chipLabel: 'Verified',
    },
    [PRESCRIPTION_STATUS.CANCELLED]: {
        title: 'Prescription Rejected',
        iconBg: '#FEF2F2',
        borderColor: '#FECACA',
        chipBg: '#FEE2E2',
        chipText: '#DC2626',
        chipLabel: 'Rejected',
    },
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export const NotificationsLayout: React.FC = () => {
    const insets = useSafeAreaInsets();
    const router = useNav();
    const { notifications, markAllRead, clear, setLastSeenRx } = useNotificationStore();
    const { isAuthenticated } = useAuthStore();
    const { prescriptions } = usePrescriptions(
        isAuthenticated ? { limit: 1, sortOrder: 'desc', refetchInterval: 3000 } : {}
    );
    const latestRx = prescriptions[0] ?? null;
    const rxConfig = latestRx ? RX_CONFIG[latestRx.status as keyof typeof RX_CONFIG] : null;

    useEffect(() => {
        markAllRead();
        if (latestRx) {
            setLastSeenRx(latestRx.id, latestRx.status);
        }
    }, [latestRx]);

    const hasAny = notifications.length > 0 || !!rxConfig;

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader
                title="Notifications"
                showBorder
                rightSlot={
                    notifications.length > 0 ? (
                        <Touchable onPress={clear} activeOpacity={0.7}>
                            <Text style={s.clearBtn} className="font-inter-semibold text-[#DC2626]">Clear all</Text>
                        </Touchable>
                    ) : undefined
                }
            />
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Prescription status card */}
                {rxConfig && (
                    <Touchable
                        activeOpacity={0.85}
                        onPress={() => {
                            if (latestRx?.status === PRESCRIPTION_STATUS.APPROVED && latestRx?.prescriptionOrderId) {
                                router.push({
                                    pathname: "/(prescription)/medicine-comparison",
                                    params: {
                                        prescriptionOrderId: latestRx.prescriptionOrderId,
                                        prescriptionId: latestRx.id,
                                    },
                                });
                            } else {
                                router.push('/(prescription)/prescription-history' as any);
                            }
                        }}
                        style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: rxConfig.borderColor,
                            padding: 16,
                            marginBottom: 12,
                            shadowColor: '#919EAB',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.08,
                            shadowRadius: 6,
                            elevation: 2,
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[s.rxIconBox, { borderRadius: 20, backgroundColor: rxConfig.iconBg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }]}>
                                {latestRx?.status === PRESCRIPTION_STATUS.APPROVED
                                    ? <Image source={HOME_IMAGES.prescriptionApproved} style={s.rxIcon} resizeMode="contain" />
                                    : latestRx?.status === PRESCRIPTION_STATUS.CANCELLED
                                    ? <Image source={HOME_IMAGES.prescriptionRejected} style={s.rxIcon} resizeMode="contain" />
                                    : <Image source={PRESCRIPTION_ICON} style={s.rxIcon} resizeMode="contain" />
                                }
                            </View>

                            <View style={{ flex: 1 }}>
                                <Text style={s.rxTitle}>
                                    {rxConfig.title}
                                </Text>
                                <Text style={s.rxSub}>
                                    {latestRx?.status === PRESCRIPTION_STATUS.APPROVED
                                        ? 'Tap to view your medicines'
                                        : latestRx?.status === PRESCRIPTION_STATUS.CANCELLED
                                        ? 'Tap to resubmit or view details'
                                        : 'Our team is reviewing your prescription'}
                                </Text>
                            </View>

                            <View
                                style={{
                                    backgroundColor: rxConfig.chipBg,
                                    borderRadius: 999,
                                    paddingHorizontal: 10,
                                    paddingVertical: 5,
                                    marginLeft: 10,
                                }}
                            >
                                <Text style={[s.rxChip, { color: rxConfig.chipText }]}>
                                    {rxConfig.chipLabel}
                                </Text>
                            </View>
                        </View>
                    </Touchable>
                )}

                {!hasAny ? (
                    <View className="flex-1 items-center justify-center" style={{ paddingTop: 80 }}>
                        <icons.notification width={s.emptyIcon.width} height={s.emptyIcon.height} fill="#D1D5DB" />
                        <Text style={s.emptyTitle} className="font-inter-semibold text-brand-subtext mt-4">No notifications yet</Text>
                        <Text style={s.emptySub} className="font-inter text-[#9CA3AF] mt-1 text-center">
                            We'll notify you about orders and offers
                        </Text>
                    </View>
                ) : (
                    notifications.map((item) => (
                        <View
                            key={item.id}
                            className="bg-white rounded-2xl p-4 mb-3"
                            style={{ borderWidth: 1, borderColor: item.isRead ? '#F0F1F3' : '#D1FAE5' }}
                        >
                            <View className="flex-row items-start">
                                <View style={[s.notifIconBox, { borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2, backgroundColor: '#E9F6ED' }]}>
                                    <icons.notification width={s.notifIcon.width} height={s.notifIcon.height} fill="#0F7635" />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center justify-between">
                                        <Text style={s.notifTitle} className="font-inter-semibold text-brand-text flex-1 pr-2" numberOfLines={1}>
                                            {item.title}
                                        </Text>
                                        {!item.isRead && (
                                            <View className="w-2 h-2 rounded-full bg-brand-primary" />
                                        )}
                                    </View>
                                    {item.body ? (
                                        <Text style={s.notifBody} className="font-inter text-[#6A6A6A] mt-0.5" numberOfLines={2}>
                                            {item.body}
                                        </Text>
                                    ) : null}
                                    <Text style={s.notifTime} className="font-inter-medium text-[#9CA3AF] mt-1.5">
                                        {formatDate(item.receivedAt)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};
