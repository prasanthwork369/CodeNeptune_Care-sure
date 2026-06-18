import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { HOME_IMAGES } from '@/src/constants/images';
import { useNotifications } from '@/src/hooks/queries/useNotifications';
import {
  useDismissNotification,
  useMarkNotificationRead,
} from '@/src/hooks/mutations/useNotificationMutations';
import { useNav } from '@/src/hooks/useNav';
import { NotificationLog } from '@/src/api/inAppNotification.api';
import { NotificationsSkeleton } from './NotificationsSkeleton';
import { styles as s } from './notifications.styles';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Image, Modal, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

const SECTION_ORDER = ['TODAY', 'YESTERDAY', 'THIS WEEK', 'EARLIER'] as const;
type SectionKey = (typeof SECTION_ORDER)[number];

function getSectionKey(iso: string): SectionKey {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return 'TODAY';
  if (date >= startOfYesterday) return 'YESTERDAY';
  if (date >= startOfWeek) return 'THIS WEEK';
  return 'EARLIER';
}

function formatRowTime(iso: string, section: SectionKey): string {
  const date = new Date(iso);
  if (section === 'TODAY') {
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    return `${Math.floor(diffMin / 60)} hr ago`;
  }
  const time = date
    .toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
    .replace(' ', '');
  if (section === 'YESTERDAY') return `Yesterday, ${time}`;
  if (section === 'THIS WEEK') return `${date.toLocaleDateString('en-IN', { weekday: 'short' })}, ${time}`;
  return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}, ${time}`;
}

// ─── Per-type icon/color config ──────────────────────────────────────────────

function getNotificationVisual(n: NotificationLog) {
  const event = n.event;
  if (event === 'prescription.rejected') {
    return { bg: '#FEF2F2', icon: <Image source={HOME_IMAGES.warningIcon} style={s.notifIcon} resizeMode="contain" /> };
  }
  if (event.startsWith('order.')) {
    if (event.includes('cancel')) {
      return { bg: '#FEF2F2', icon: <Image source={HOME_IMAGES.blockIcon} style={s.notifIcon} resizeMode="contain" /> };
    }
    return { bg: '#FFFFF4', icon: <Image source={HOME_IMAGES.bucketCheckIcon} style={s.notifIcon} resizeMode="contain" /> };
  }
  if (event.includes('coin')) {
    return { bg: '#FFFBEB', icon: <icons.coin_group width={s.notifIcon.width} height={s.notifIcon.height} fill="#EA580C" /> };
  }
  if (event.startsWith('wallet.')) {
    const isCredit = n.metadata?.type === 'credit' || event.includes('credit');
    return isCredit
      ? { bg: '#F4FFF7', icon: <icons.account_balance_wallet_green width={s.notifIcon.width} height={s.notifIcon.height} /> }
      : { bg: '#FEF2F2', icon: <icons.account_balance_wallet width={s.notifIcon.width} height={s.notifIcon.height} fill="#DC2626" /> };
  }
  if (event.includes('review')) {
    return { bg: '#F3F8FF', icon: <Image source={HOME_IMAGES.notiHistoryIcon} style={s.notifIcon} resizeMode="contain" /> };
  }
  if (event === 'prescription.uploaded' || event === 'prescription.approved') {
    return { bg: '#F4FFF7', icon: <icons.prescription_green width={s.notifIcon.width} height={s.notifIcon.height} fill="#15803D" /> };
  }
  return { bg: '#F3F4F6', icon: <icons.notification width={s.notifIcon.width} height={s.notifIcon.height} fill="#6B7280" /> };
}

// `subject` is frequently null from the backend — fall back to a title
// derived from the event/metadata so the row never shows a blank title.
function getNotificationTitle(n: NotificationLog): string {
  if (n.subject) return n.subject;
  const event = n.event;
  const orderRef = n.orderId ? ` - #${n.orderId}` : '';

  if (event === 'prescription.uploaded') return 'Prescription Uploaded Successfully';
  if (event === 'prescription.approved') return 'Prescription Verified';
  if (event === 'prescription.rejected') return 'Prescription Rejected';
  if (event.includes('review')) return 'Prescription Under Review';
  if (event.startsWith('order.')) {
    return event.includes('cancel') ? `Order Cancelled${orderRef}` : `Order Placed${orderRef}`;
  }
  if (event.includes('coin')) {
    const isCredit = n.metadata?.type === 'credit' || event.includes('credit');
    return `${isCredit ? '+' : '-'}${n.metadata?.coinsAmount ?? ''} Coins ${isCredit ? 'Credited' : 'Debited'}`;
  }
  if (event.startsWith('wallet.')) {
    const isCredit = n.metadata?.type === 'credit' || event.includes('credit');
    const amount = n.metadata?.walletAmount ?? '0';
    return `Wallet ${isCredit ? 'Credited' : 'Debited'}- ₹${amount}`;
  }
  return 'Notification';
}

// ─── Options popover (pattern reused from RxOrdersLayout) ────────────────────

const OptionsPanel: React.FC<{
  top: number;
  onClose: () => void;
  isRead: boolean;
  onMarkRead: () => void;
  onDismiss: () => void;
}> = ({ top, onClose, isRead, onMarkRead, onDismiss }) => (
  <View style={{ flex: 1 }}>
    <Touchable
      activeOpacity={1}
      onPress={onClose}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
    />
    <View
      style={[
        s.popoverWidth,
        {
          position: 'absolute',
          top,
          right: 16,
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 16,
          elevation: 10,
        },
      ]}
    >
      <Touchable
        activeOpacity={0.7}
        onPress={onDismiss}
        style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
      >
        <icons.close_dark width={s.popoverIcon.width} height={s.popoverIcon.height} />
        <Text style={[s.popoverText, { fontFamily: 'Inter-SemiBold', color: '#111827', marginLeft: 14 }]}>
          Clear
        </Text>
      </Touchable>
      {!isRead && (
        <Touchable
          activeOpacity={0.7}
          onPress={onMarkRead}
          style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
        >
          <icons.done_all width={s.popoverIconAlt.width} height={s.popoverIconAlt.height} fill="#111827" />
          <Text style={[s.popoverText, { fontFamily: 'Inter-SemiBold', color: '#111827', marginLeft: 14 }]}>
            Mark as read
          </Text>
        </Touchable>
      )}
    </View>
  </View>
);

// ─── Notification row ────────────────────────────────────────────────────────

interface NotificationRowItemProps {
  notification: NotificationLog;
  section: SectionKey;
  onPress: () => void;
  onDismiss: () => void;
  onMarkRead: () => void;
  isLast: boolean;
}

const NotificationRowItem: React.FC<NotificationRowItemProps> = ({
  notification,
  section,
  onPress,
  onDismiss,
  onMarkRead,
  isLast,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<{ top: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const triggerRef = useRef<View>(null);
  const visual = getNotificationVisual(notification);
  const body = stripHtml(notification.body);
  const isLong = body.length > 100;

  const openMenu = () => {
    triggerRef.current?.measureInWindow((_x, y, _w, h) => {
      setMenuAnchor({ top: y + h + 4 });
    });
  };

  return (
    <Touchable
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#F0F1F3',
      }}
    >
      {!notification.isRead && (
        <View style={[s.unreadDot, { borderRadius: 999, backgroundColor: '#0F7635', marginTop: 6, marginRight: 6 }]} />
      )}

      <View style={[s.notifIconBox, { borderRadius: 999, backgroundColor: visual.bg, alignItems: 'center', justifyContent: 'center', marginRight: 12 }]}>
        {visual.icon}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.notifTitle}>
          {getNotificationTitle(notification)}
        </Text>
        {isLong && !expanded ? (
          <Text style={[s.notifBody, { marginTop: 2 }]}>
            {body.substring(0, 100)}...{' '}
            <Text
              onPress={(e) => { e.stopPropagation?.(); setExpanded(true); }}
              style={{ color: '#0F7635', fontFamily: 'Inter-SemiBold' }}
            >
              View More
            </Text>
          </Text>
        ) : (
          <Text style={[s.notifBody, { marginTop: 2 }]}>
            {body}
          </Text>
        )}
        <Text style={[s.notifTime, { marginTop: 4 }]}>
          {formatRowTime(notification.createdAt, section)}
        </Text>
      </View>

      <View ref={triggerRef} collapsable={false}>
        <Touchable
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e) => { e.stopPropagation?.(); openMenu(); }}
          style={{ padding: 2 }}
        >
          <icons.dots width={s.dotsIcon.width} height={s.dotsIcon.height} fill="#9CA3AF" />
        </Touchable>
      </View>

      <Modal transparent visible={!!menuAnchor} animationType="fade" onRequestClose={() => setMenuAnchor(null)}>
        <OptionsPanel
          top={menuAnchor?.top ?? 0}
          onClose={() => setMenuAnchor(null)}
          isRead={notification.isRead}
          onMarkRead={() => { setMenuAnchor(null); onMarkRead(); }}
          onDismiss={() => { setMenuAnchor(null); onDismiss(); }}
        />
      </Modal>
    </Touchable>
  );
};

// ─── Main layout ──────────────────────────────────────────────────────────────

export const NotificationsLayout: React.FC = () => {
  const insets = useSafeAreaInsets();
  const router = useNav();

  const { notifications, isLoading, isRefetching, refetch } = useNotifications();
  const { mutate: dismiss } = useDismissNotification();
  const { mutate: markRead } = useMarkNotificationRead();
  const [isEntryLoading, setIsEntryLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsEntryLoading(true);
      refetch().finally(() => setIsEntryLoading(false));
    }, [refetch]),
  );

  const sections = SECTION_ORDER
    .map((key) => ({
      key,
      items: notifications.filter((n) => getSectionKey(n.createdAt) === key),
    }))
    .filter((g) => g.items.length > 0);

  const showEmpty = !isLoading && !isEntryLoading && notifications.length === 0;

  const handlePress = (notification: NotificationLog) => {
    if (!notification.isRead) markRead(notification.id);
    const orderId = notification.metadata?.prescriptionOrderId ?? notification.orderId;
    if (notification.event === 'prescription.approved' && orderId) {
      router.push({
        pathname: '/(prescription)/medicine-comparison',
        params: { prescriptionOrderId: orderId, prescriptionId: notification.id },
      });
    } else if (notification.event === 'prescription.rejected') {
      router.push('/prescription-history');
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Recent Notification" showBorder />

      {isLoading || isEntryLoading ? (
        <NotificationsSkeleton />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#0F7635" colors={['#0F7635']} />
          }
        >
          {showEmpty && (
            <View className="flex-1 items-center justify-center" style={{ paddingTop: 80 }}>
              <icons.notification width={s.emptyIcon.width} height={s.emptyIcon.height} fill="#D1D5DB" />
              <Text style={s.emptyTitle} className="font-inter-semibold text-brand-subtext mt-4">No notifications yet</Text>
              <Text style={s.emptySub} className="font-inter text-[#9CA3AF] mt-1 text-center">
                {"We'll notify you about orders and offers"}
              </Text>
            </View>
          )}

          {sections.map((section) => (
            <View key={section.key} style={{ marginTop: 18 }}>
              <Text style={[s.sectionHeader, { fontFamily: 'Inter-SemiBold', color: '#6A6A6A', letterSpacing: 0, textTransform: 'uppercase', marginBottom: 10 }]}>
                {section.key}
              </Text>
              {section.items.map((notification, idx) => (
                <NotificationRowItem
                  key={notification.id}
                  notification={notification}
                  section={section.key}
                  isLast={idx === section.items.length - 1}
                  onPress={() => handlePress(notification)}
                  onDismiss={() => dismiss(notification.id)}
                  onMarkRead={() => markRead(notification.id)}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
