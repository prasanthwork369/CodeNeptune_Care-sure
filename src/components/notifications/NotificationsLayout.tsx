import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { PRESCRIPTION_STATUS } from '@/src/constants/prescription-status';
import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { usePrescriptionBanner } from '@/src/hooks/ui/usePrescriptionBanner';
import { useNotifications } from '@/src/hooks/queries/useNotifications';
import {
  useDismissNotification,
  useMarkNotificationRead,
  useDismissAllNotifications,
} from '@/src/hooks/mutations/useNotificationMutations';
import { useNotificationStore } from '@/src/store/notificationStore';
import { useNav } from '@/src/hooks/useNav';
import { NotificationLog } from '@/src/api/inAppNotification.api';
import { NotificationsSkeleton } from './NotificationsSkeleton';
import { styles as s } from './notifications.styles';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale } from 'react-native-size-matters';

import PRESCRIPTION_ICON from '../../../assets/images/prescription/prescription-pending.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── Variant config ───────────────────────────────────────────────────────────

const VARIANTS = {
  green:  { iconBg: '#DCFCE7', iconColor: '#15803D', titleColor: '#14532D' },
  red:    { iconBg: '#FEE2E2', iconColor: '#DC2626', titleColor: '#7F1D1D' },
  blue:   { iconBg: '#DBEAFE', iconColor: '#1D4ED8', titleColor: '#1E3A5F' },
  gray:   { iconBg: '#F3F4F6', iconColor: '#6B7280', titleColor: '#111827' },
  orange: { iconBg: '#FED7AA', iconColor: '#EA580C', titleColor: '#7C2D12' },
};

// ─── Prescription status card config ─────────────────────────────────────────

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

// ─── Base notification row ────────────────────────────────────────────────────

interface NotificationRowProps {
  variant?: keyof typeof VARIANTS;
  icon: React.ReactNode;
  title: string;
  body: string;
  rightElement?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const NotificationRow: React.FC<NotificationRowProps> = ({
  variant = 'gray',
  icon,
  title,
  body,
  rightElement,
  actionLabel,
  onAction,
}) => {
  const [expanded, setExpanded] = useState(false);
  const v = VARIANTS[variant];
  const plain = stripHtml(body);
  const isLong = plain.length > 120;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <View
        style={{
          width: scale(40),
          height: scale(40),
          borderRadius: 999,
          backgroundColor: v.iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ fontSize: moderateScale(13.5, 0.3), fontFamily: 'Inter-SemiBold', color: v.titleColor }}>
          {title}
        </Text>

        {isLong && !expanded ? (
          <Text style={{ fontSize: moderateScale(12, 0.3), fontFamily: 'Inter-Regular', color: '#6B7280', lineHeight: 18 }}>
            {plain.substring(0, 120)}...{' '}
            <Text
              onPress={() => setExpanded(true)}
              style={{ color: '#0F7635', fontFamily: 'Inter-SemiBold' }}
            >
              View More
            </Text>
          </Text>
        ) : (
          <Text style={{ fontSize: moderateScale(12, 0.3), fontFamily: 'Inter-Regular', color: '#6B7280', lineHeight: 18 }}>
            {plain}
          </Text>
        )}

        {actionLabel && onAction && (
          <Pressable
            onPress={onAction}
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              marginTop: 4,
              backgroundColor: pressed ? '#EA580C' : '#FB870A',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            })}
          >
            <Text style={{ fontSize: moderateScale(12, 0.3), fontFamily: 'Inter-Bold', color: '#fff' }}>
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>

      {rightElement}
    </View>
  );
};

// ─── Event-based templates ────────────────────────────────────────────────────

interface TemplateProps {
  notification: NotificationLog;
  onAction: () => void;
}

const PrescriptionApprovedTemplate: React.FC<TemplateProps> = ({ notification, onAction }) => (
  <NotificationRow
    variant="green"
    icon={<icons.prescription_green width={scale(20)} height={scale(20)} fill="#15803D" />}
    title={notification.subject || 'Prescription Approved'}
    body={notification.body}
    actionLabel="Review & Order"
    onAction={onAction}
  />
);

const PrescriptionRejectedTemplate: React.FC<TemplateProps> = ({ notification }) => (
  <NotificationRow
    variant="red"
    icon={<icons.prescriptions width={scale(20)} height={scale(20)} fill="#DC2626" />}
    title={notification.subject || 'Prescription Rejected'}
    body={notification.body}
  />
);

const PrescriptionUploadedTemplate: React.FC<TemplateProps> = ({ notification }) => (
  <NotificationRow
    variant="blue"
    icon={<icons.prescriptions width={scale(20)} height={scale(20)} fill="#1D4ED8" />}
    title={notification.subject || 'Prescription Uploaded'}
    body={notification.body}
  />
);

const WalletTemplate: React.FC<{ notification: NotificationLog }> = ({ notification }) => {
  const isCredit =
    notification.metadata?.type === 'credit' || notification.event.includes('credit');
  const isCoins =
    notification.metadata?.coinsAmount !== undefined || notification.event.includes('coin');
  const amount = notification.metadata?.walletAmount ?? notification.metadata?.coinsAmount ?? '0';

  return (
    <NotificationRow
      variant={isCredit ? 'green' : 'red'}
      icon={isCoins
        ? <icons.coin_group width={scale(20)} height={scale(20)} fill={isCredit ? '#15803D' : '#DC2626'} />
        : <icons.account_balance_wallet width={scale(20)} height={scale(20)} fill={isCredit ? '#15803D' : '#DC2626'} />
      }
      title={notification.subject || (isCoins ? 'Coins Updated' : 'Wallet Updated')}
      body={notification.body}
      rightElement={
        <Text style={{
          fontSize: moderateScale(13, 0.3),
          fontFamily: 'Inter-Bold',
          color: isCredit ? '#16A34A' : '#DC2626',
          flexShrink: 0,
          marginLeft: 4,
        }}>
          {isCredit ? '+' : '-'}{isCoins ? `${amount} coins` : `₹${amount}`}
        </Text>
      }
    />
  );
};

const DefaultTemplate: React.FC<{ notification: NotificationLog }> = ({ notification }) => (
  <NotificationRow
    variant="gray"
    icon={<icons.notification width={scale(20)} height={scale(20)} fill="#6B7280" />}
    title={notification.subject || 'Notification'}
    body={notification.body}
  />
);

// ─── Main card wrapper ────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: NotificationLog;
  onDismiss: () => void;
  onRead: () => void;
  children: React.ReactNode;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onDismiss,
  onRead,
  children,
}) => (
  <Pressable
    onPress={onRead}
    style={({ pressed }) => ({
      backgroundColor: pressed ? '#F9FAFB' : notification.isRead ? '#FFFFFF' : '#F8FCF8',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: notification.isRead ? '#F0F1F3' : '#D1FAE5',
      padding: 14,
      marginBottom: 10,
      shadowColor: '#919EAB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    })}
  >
    {/* Header row: date + unread dot + dismiss */}
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Text style={{ flex: 1, fontSize: moderateScale(10, 0.3), fontFamily: 'Inter-SemiBold', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.6 }}>
        {formatDate(notification.createdAt)}
      </Text>
      {!notification.isRead && (
        <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: '#0F7635', marginRight: 8 }} />
      )}
      <Pressable
        onPress={(e) => { e.stopPropagation?.(); onDismiss(); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{ padding: 2 }}
      >
        <icons.close_small width={14} height={14} fill="#9CA3AF" />
      </Pressable>
    </View>

    {children}
  </Pressable>
);

// ─── Main layout ──────────────────────────────────────────────────────────────

export const NotificationsLayout: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useNav();

  const { notifications, isLoading, isRefetching, refetch } = useNotifications();
  const { mutate: dismiss } = useDismissNotification();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: dismissAll } = useDismissAllNotifications();

  const { latestPrescription, hasPendingPrescription, isLoading: isRxLoading } = usePrescriptionBanner();
  const { setLastSeenRx } = useNotificationStore();

  const rxConfig = hasPendingPrescription && latestPrescription
    ? RX_CONFIG[latestPrescription.status as keyof typeof RX_CONFIG]
    : null;

  useEffect(() => {
    if (latestPrescription) {
      setLastSeenRx(latestPrescription.id, latestPrescription.status);
    }
  }, [latestPrescription]);

  const hasAny = notifications.length > 0 || !!rxConfig;
  const showEmpty = !isLoading && !isRxLoading && !hasAny;

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title="Notifications"
        showBorder
        rightSlot={
          notifications.length > 0 ? (
            <Touchable onPress={() => dismissAll()} activeOpacity={0.7}>
              <Text style={s.clearBtn} className="font-inter-semibold text-[#DC2626]">Clear all</Text>
            </Touchable>
          ) : undefined
        }
      />

      {isLoading || isRxLoading ? (
        <NotificationsSkeleton />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0F7635" colors={['#0F7635']} />
          }
        >
          {/* Prescription live-status card */}
          {rxConfig && latestPrescription && (
            <Touchable
              activeOpacity={0.85}
              onPress={() => {
                if (latestPrescription.status === PRESCRIPTION_STATUS.APPROVED && latestPrescription.prescriptionOrderId) {
                  router.push({
                    pathname: '/(prescription)/medicine-comparison',
                    params: {
                      prescriptionOrderId: latestPrescription.prescriptionOrderId,
                      prescriptionId: latestPrescription.id,
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
                  {latestPrescription.status === PRESCRIPTION_STATUS.APPROVED
                    ? <Image source={HOME_IMAGES.prescriptionApproved} style={s.rxIcon} resizeMode="contain" />
                    : latestPrescription.status === PRESCRIPTION_STATUS.CANCELLED
                    ? <Image source={HOME_IMAGES.prescriptionRejected} style={s.rxIcon} resizeMode="contain" />
                    : <Image source={PRESCRIPTION_ICON} style={s.rxIcon} resizeMode="contain" />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.rxTitle}>{rxConfig.title}</Text>
                  <Text style={s.rxSub}>
                    {latestPrescription.status === PRESCRIPTION_STATUS.APPROVED
                      ? 'Tap to view your medicines'
                      : latestPrescription.status === PRESCRIPTION_STATUS.CANCELLED
                      ? 'Tap to resubmit or view details'
                      : 'Our team is reviewing your prescription'}
                  </Text>
                </View>
                <View style={{ backgroundColor: rxConfig.chipBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 10 }}>
                  <Text style={[s.rxChip, { color: rxConfig.chipText }]}>{rxConfig.chipLabel}</Text>
                </View>
              </View>
            </Touchable>
          )}

          {showEmpty && (
            <View className="flex-1 items-center justify-center" style={{ paddingTop: 80 }}>
              <icons.notification width={s.emptyIcon.width} height={s.emptyIcon.height} fill="#D1D5DB" />
              <Text style={s.emptyTitle} className="font-inter-semibold text-brand-subtext mt-4">No notifications yet</Text>
              <Text style={s.emptySub} className="font-inter text-[#9CA3AF] mt-1 text-center">
                We'll notify you about orders and offers
              </Text>
            </View>
          )}

          {notifications.map((notification) => {
            const handleAction = () => {
              if (!notification.isRead) markRead(notification.id);
              const orderId = notification.metadata?.prescriptionOrderId ?? notification.orderId;
              if (orderId) {
                router.push({
                  pathname: '/(prescription)/medicine-comparison',
                  params: { prescriptionOrderId: orderId, prescriptionId: notification.id },
                });
              }
            };

            let content: React.ReactNode;
            if (notification.event === 'prescription.approved') {
              content = <PrescriptionApprovedTemplate notification={notification} onAction={handleAction} />;
            } else if (notification.event === 'prescription.rejected') {
              content = <PrescriptionRejectedTemplate notification={notification} onAction={handleAction} />;
            } else if (notification.event === 'prescription.uploaded') {
              content = <PrescriptionUploadedTemplate notification={notification} onAction={handleAction} />;
            } else if (notification.event.startsWith('wallet.') || notification.event.startsWith('coin')) {
              content = <WalletTemplate notification={notification} />;
            } else {
              content = <DefaultTemplate notification={notification} />;
            }

            return (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onDismiss={() => dismiss(notification.id)}
                onRead={() => { if (!notification.isRead) markRead(notification.id); }}
              >
                {content}
              </NotificationCard>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};
