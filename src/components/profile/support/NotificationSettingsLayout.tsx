import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { CustomSwitch } from '@/src/components/ui/CustomSwitch';
import { useNotificationPreferences } from '@/src/hooks/queries/useNotificationPreferences';
import { UpdateNotificationPreferencesInput } from '@/src/api/notification-preferences.api';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { moderateScale } from '@/src/utils/exactScale';
import { useAdjustedBottomInset } from '@/src/hooks/ui/useBottomInset';

// Only the boolean preference fields are togglable keys.
type PreferenceKey = keyof UpdateNotificationPreferencesInput;

// Screen structure mirrors the web: "Order Updates" is a grouped header with
// SMS + Email channel sub-rows, while Health/Promotions are single toggles.
type Section =
  | {
      type: 'group';
      header: string;
      items: { label: string; desc: string; key: PreferenceKey }[];
    }
  | { type: 'single'; label: string; desc: string; key: PreferenceKey };

const SECTIONS: Section[] = [
  {
    type: 'group',
    header: 'Order Updates',
    items: [
      { label: 'SMS', desc: 'Order status alerts via text message', key: 'orderUpdatesSmsEnabled' },
      { label: 'Email', desc: 'Order status alerts via email', key: 'orderUpdatesEmailEnabled' },
    ],
  },
  {
    type: 'single',
    label: 'Health Updates',
    desc: 'Receive reminders to refill prescriptions',
    key: 'healthUpdatesEnabled',
  },
  {
    type: 'single',
    label: 'Promotions & Offers',
    desc: 'Updates on latest discounts and coupons',
    key: 'promotionsOffersEnabled',
  },
];

const Divider = () => (
  <View style={{ height: 1, backgroundColor: '#E5E7EB', marginHorizontal: 20 }} />
);

const NotificationSkeleton = () => (
  <View style={{ marginTop: 8 }}>
    {[1, 2, 3, 4].map((_, index) => (
      <View key={index}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <View style={{ flex: 1, marginRight: 16 }}>
            <Skeleton width="40%" height={15} style={{ marginBottom: 8 }} />
            <Skeleton width="70%" height={12} />
          </View>
          <Skeleton width={44} height={24} borderRadius={12} />
        </View>
        {index < 3 && <Divider />}
      </View>
    ))}
  </View>
);

export const NotificationSettingsLayout: React.FC = () => {
  const { preferences, isLoading, updating, updatePreferences } = useNotificationPreferences();
  const adjustedBottom = useAdjustedBottomInset();

  const handleToggle = async (key: PreferenceKey, value: boolean) => {
    await updatePreferences({ [key]: value });
  };

  // A single label + description + switch row (used for both channel sub-rows
  // and single-toggle sections). `bold` marks a top-level section title.
  const ToggleRow = ({
    label,
    desc,
    keyName,
    bold,
  }: {
    label: string;
    desc: string;
    keyName: PreferenceKey;
    bold?: boolean;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <View style={{ flex: 1, marginRight: 16 }}>
        <Text style={{ fontSize: moderateScale(15), fontWeight: bold ? '700' : '500', color: '#111827', marginBottom: 3 }}>
          {label}
        </Text>
        <Text style={{ fontSize: moderateScale(13), color: '#6B7280', lineHeight: moderateScale(18) }}>
          {desc}
        </Text>
      </View>
      <CustomSwitch
        value={preferences?.[keyName] ?? false}
        onValueChange={(v) => handleToggle(keyName, v)}
        disabled={updating}
      />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScreenHeader title="Notification" showBorder backgroundColor="#FFFFFF" />

      {isLoading ? (
        <NotificationSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 8,
            paddingBottom: adjustedBottom + 24,
          }}
        >
          {SECTIONS.map((section, index) => (
            <View key={section.type === 'group' ? section.header : section.label}>
              {section.type === 'group' ? (
                <View>
                  {/* Group header — no toggle, just labels the channel rows below */}
                  <Text
                    style={{
                      fontSize: moderateScale(15),
                      fontWeight: '700',
                      color: '#111827',
                      paddingHorizontal: 20,
                      paddingTop: 14,
                      paddingBottom: 2,
                    }}
                  >
                    {section.header}
                  </Text>
                  {section.items.map((item) => (
                    <ToggleRow key={item.key} label={item.label} desc={item.desc} keyName={item.key} />
                  ))}
                </View>
              ) : (
                <ToggleRow label={section.label} desc={section.desc} keyName={section.key} bold />
              )}
              {index < SECTIONS.length - 1 && <Divider />}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
