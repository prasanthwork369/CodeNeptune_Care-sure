import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { CustomSwitch } from '@/src/components/ui/CustomSwitch';
import { useNotificationPreferences } from '@/src/hooks/queries/useNotificationPreferences';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

const ITEMS = [
    {
        label: 'Order Updates',
        desc: 'Get SMS and email alerts for your order status',
        key: 'orderUpdatesEnabled' as const,
    },
    {
        label: 'Health Updates',
        desc: 'Receive reminders to refill prescriptions',
        key: 'healthUpdatesEnabled' as const,
    },
    {
        label: 'Promotions & Offers',
        desc: 'Updates on latest discounts and coupons',
        key: 'promotionsOffersEnabled' as const,
    },
];

export const NotificationSettingsLayout: React.FC = () => {
    const { preferences, isLoading, updating, updatePreferences } = useNotificationPreferences();

    const handleToggle = async (key: 'orderUpdatesEnabled' | 'healthUpdatesEnabled' | 'promotionsOffersEnabled', value: boolean) => {
        await updatePreferences({ [key]: value });
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#F5F6FB' }}>
            <ScreenHeader title="Notification" showBorder backgroundColor="#FFFFFF" />

            {isLoading ? (
                <ActivityIndicator color="#0F7635" style={{ marginTop: 40 }} />
            ) : (
                <View style={{ marginTop: 8 }}>
                    {ITEMS.map((item, index) => (
                        <View key={item.label}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    backgroundColor: '#F5F6FB',
                                    paddingHorizontal: 20,
                                    paddingVertical: 16,
                                }}
                            >
                                <View style={{ flex: 1, marginRight: 16 }}>
                                    <Text style={{ fontSize: 15, fontFamily: 'Inter-Bold', color: '#111827', marginBottom: 3 }}>
                                        {item.label}
                                    </Text>
                                    <Text style={{ fontSize: 13, fontFamily: 'Inter', color: '#6B7280', lineHeight: 18 }}>
                                        {item.desc}
                                    </Text>
                                </View>
                                <CustomSwitch
                                    value={preferences?.[item.key] ?? false}
                                    onValueChange={(v) => handleToggle(item.key, v)}
                                    disabled={updating}
                                />
                            </View>
                            {index < ITEMS.length - 1 && (
                                <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};
