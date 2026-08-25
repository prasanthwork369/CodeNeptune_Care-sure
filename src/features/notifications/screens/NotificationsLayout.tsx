import type { NotificationLog } from "../types";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  useDismissAllNotifications,
  useDismissNotification,
  useMarkNotificationRead,
} from "@/src/features/notifications/hooks/useNotificationMutations";
import { useNotifications } from "@/src/features/notifications/hooks/useNotifications";
import { usePrefetchOrder } from "@/src/features/orders/hooks/useOrderById";
import { usePrefetchWallet } from "@/src/features/wallet/hooks/useWallet";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useNav } from "@/src/hooks/useNav";
import { useToastStore } from "@/src/store/toastStore";
import { exactScale } from "@/src/utils/exactScale";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { RefreshControl, Text, View } from "react-native";
import { ListRenderItem } from "@shopify/flash-list";
import { AppFlashList } from "@/src/components/lists/AppFlashList";
import {
  NotificationRow,
  SECTION_ORDER,
  SectionKey,
  getSectionKey,
} from "../components/NotificationRow";
import { NotificationsSkeleton } from "../components/NotificationsSkeleton";
import { styles as s } from "../notifications.styles";

// Flattened so FlashList can virtualize section headers and notification rows
// as a single scrollable list instead of mounting every row up front.
type NotificationListRow =
  | { rowType: "header"; key: string; label: SectionKey; isFirst: boolean }
  | {
      rowType: "notification";
      key: string;
      notification: NotificationLog;
      section: SectionKey;
      isLast: boolean;
    };

export const NotificationsLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const router = useNav();
  const showToast = useToastStore((state) => state.show);
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const { notifications, isLoading, isRefetching, isError, error, refetch } =
    useNotifications();
  const errorState = useQueryErrorState(error);
  const { mutate: dismiss, mutateAsync: dismissAsync } =
    useDismissNotification();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: dismissAll, isPending: isClearingAll } =
    useDismissAllNotifications();
  const prefetchOrder = usePrefetchOrder();
  const prefetchWallet = usePrefetchWallet();
  const [isEntryLoading, setIsEntryLoading] = useState(true);
  // Lifted out of the row: FlashList unmounts rows scrolled out of the
  // render window, so local "View More" state there resets back to
  // collapsed on scroll-away/back. Keyed by id here so it survives that.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(),
  );

  useFocusEffect(
    useCallback(() => {
      setIsEntryLoading(true);
      refetch().finally(() => setIsEntryLoading(false));
    }, [refetch]),
  );

  // Memoized, or every notification is re-grouped on every state change.
  const sections = useMemo(
    () =>
      SECTION_ORDER.map((key) => ({
        key,
        items: notifications.filter((n) => getSectionKey(n.createdAt) === key),
      })).filter((g) => g.items.length > 0),
    [notifications],
  );

  // Flattened rows for FlashList — one entry per section header, one per
  // notification. `getItemType` (below) keeps the two shapes from being
  // recycled into each other.
  const rows = useMemo<NotificationListRow[]>(() => {
    const out: NotificationListRow[] = [];
    sections.forEach((section, sectionIndex) => {
      out.push({
        rowType: "header",
        key: `header-${section.key}`,
        label: section.key,
        isFirst: sectionIndex === 0,
      });
      section.items.forEach((notification, idx) => {
        out.push({
          rowType: "notification",
          key: notification.id,
          notification,
          section: section.key,
          isLast: idx === section.items.length - 1,
        });
      });
    });
    return out;
  }, [sections]);

  const showError =
    !isLoading && !isEntryLoading && isError && notifications.length === 0;
  const showEmpty =
    !isLoading && !isEntryLoading && !isError && notifications.length === 0;
  const shouldShowInitialShimmer =
    (isLoading || isEntryLoading) && notifications.length === 0;

  const closeOpenRow = useCallback(() => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  }, []);

  // Stable across renders so the memoized rows don't re-render on every tick.
  const handlePress = useCallback(
    (notification: NotificationLog) => {
      closeOpenRow();
      if (!notification.isRead) markRead(notification.id);

      const { event } = notification;
      const prescriptionOrderId =
        notification.metadata?.prescriptionOrderId ?? notification.orderId;

      // Prescription verified with a linked order → jump straight to comparison.
      // prescriptionId must be the actual prescription's id (from metadata), NOT
      // notification.id — the refill reminder API 404s on a wrong id.
      if (event === "prescription.approved" && prescriptionOrderId) {
        router.push({
          pathname: "/(prescription)/medicine-comparison",
          params: {
            prescriptionOrderId,
            prescriptionId: notification.metadata?.prescriptionId ?? "",
          },
        });
        return;
      }

      // Any other prescription update (uploaded, under review, rejected, …) →
      // the prescription history list, so the row is never a dead end.
      if (event.startsWith("prescription.") || event.includes("review")) {
        router.push("/prescription-history");
        return;
      }

      // Wallet / coins → wallet screen
      if (event.startsWith("wallet.") || event.includes("coin")) {
        prefetchWallet();
        router.push("/profile/wallet");
        return;
      }

      // Orders → track when we have an id, otherwise the orders list
      if (event.startsWith("order.")) {
        if (notification.orderId) {
          prefetchOrder(notification.orderId);
          router.push({
            pathname: "/profile/orders/track",
            params: { orderId: notification.orderId },
          });
        } else {
          router.push("/profile/orders");
        }
        return;
      }

      // Unknown event: the user is already on the notifications screen, so there
      // is nowhere more useful to send them — leave them here (already marked read).
    },
    [closeOpenRow, markRead, prefetchOrder, prefetchWallet, router],
  );

  const handleClearAll = () => {
    dismissAll();
  };

  const handleDismiss = useCallback(
    (id: string) => {
      closeOpenRow();
      dismiss(id);
    },
    [closeOpenRow, dismiss],
  );

  const handleMarkRead = useCallback(
    (id: string) => {
      closeOpenRow();
      markRead(id);
    },
    [closeOpenRow, markRead],
  );

  const handleRowWillOpen = useCallback((methods: SwipeableMethods) => {
    if (openSwipeableRef.current !== methods) {
      openSwipeableRef.current?.close();
      openSwipeableRef.current = methods;
    }
  }, []);

  const handleRowDidClose = useCallback((methods: SwipeableMethods) => {
    if (openSwipeableRef.current === methods) {
      openSwipeableRef.current = null;
    }
  }, []);

  const handleSwipeDelete = useCallback(
    async (notificationId: string) => {
      try {
        await dismissAsync(notificationId);
      } catch (error) {
        showToast("Unable to delete notification. Please try again.", "error");
        throw error;
      }
    },
    [dismissAsync, showToast],
  );

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const keyExtractor = useCallback((item: NotificationListRow) => item.key, []);

  const getItemType = useCallback(
    (item: NotificationListRow) => item.rowType,
    [],
  );

  const renderItem: ListRenderItem<NotificationListRow> = useCallback(
    ({ item }) => {
      if (item.rowType === "header") {
        return (
          <View style={item.isFirst ? s.firstSection : s.section}>
            <Text style={s.sectionHeader}>{item.label}</Text>
          </View>
        );
      }
      return (
        <NotificationRow
          // FlashList recycles the row's component instance across different
          // notifications in the same slot; without a key tied to the
          // notification's own identity, local state (swipe-delete, options
          // menu) survives into the next notification shown there —
          // corrupting row height and causing the jump/overlap/blank-row
          // symptoms. The key forces a clean remount per identity. Expand
          // state is lifted to expandedIds above specifically so it isn't
          // lost on that same remount when scrolling away and back.
          key={item.notification.id}
          notification={item.notification}
          section={item.section}
          isLast={item.isLast}
          onPress={handlePress}
          onDismiss={handleDismiss}
          onMarkRead={handleMarkRead}
          onDelete={handleSwipeDelete}
          onInteraction={closeOpenRow}
          onWillOpen={handleRowWillOpen}
          onDidClose={handleRowDidClose}
          isExpanded={expandedIds.has(item.notification.id)}
          onToggleExpand={handleToggleExpand}
        />
      );
    },
    [
      handlePress,
      handleDismiss,
      handleMarkRead,
      handleSwipeDelete,
      closeOpenRow,
      handleRowWillOpen,
      handleRowDidClose,
      expandedIds,
      handleToggleExpand,
    ],
  );

  const contentContainerStyle = useMemo(
    () => ({
      ...s.content,
      paddingBottom: adjustedBottom + exactScale(16),
      flexGrow: 1,
    }),
    [adjustedBottom],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefetching}
        onRefresh={() => {
          closeOpenRow();
          void refetch();
        }}
        tintColor="#0F7635"
        colors={["#0F7635"]}
      />
    ),
    [isRefetching, closeOpenRow, refetch],
  );

  const listEmptyComponent = showError ? (
    errorState === "offline" ? (
      <NoInternetState
        onRetry={() => void refetch()}
        retrying={isRefetching}
      />
    ) : (
      <RetryState
        title="Unable to load notifications"
        onRetry={() => void refetch()}
        retrying={isRefetching}
      />
    )
  ) : showEmpty ? (
    <View className="flex-1 items-center justify-center">
      <icons.notification
        width={s.emptyIcon.width}
        height={s.emptyIcon.height}
        fill="#D1D5DB"
      />
      <Text
        style={s.emptyTitle}
        className="font-inter-semibold text-brand-subtext mt-4"
      >
        No notifications yet
      </Text>
      <Text
        style={s.emptySub}
        className="font-inter text-[#9CA3AF] mt-1 text-center"
      >
        {"We'll notify you about orders and offers"}
      </Text>
    </View>
  ) : null;

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader
        title="Recent Notification"
        showBorder
        rightSlot={
          notifications.length > 0 ? (
            <Touchable
              onPress={handleClearAll}
              disabled={isClearingAll}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              style={s.clearAllButton}
              accessibilityLabel="Clear all notifications"
            >
              <Text
                style={[s.clearAllText, { color: "#DC2626" }]}
                numberOfLines={1}
              >
                Clear All
              </Text>
            </Touchable>
          ) : null
        }
      />

      {shouldShowInitialShimmer ? (
        <NotificationsSkeleton />
      ) : (
        <AppFlashList
          data={rows}
          keyExtractor={keyExtractor}
          getItemType={getItemType}
          renderItem={renderItem}
          className="flex-1"
          // Explicit on the list itself, not just the ancestor View — the
          // native scroll surface needs its own opaque background so a
          // hardware-layer/overscroll frame can't reveal black underneath it.
          style={{ backgroundColor: "#FFFFFF" }}
          // Rows carry a gesture-handler-wrapped swipeable + variable-height
          // text, so the library's default 250dp pre-render buffer can't keep
          // up with a fast fling in either direction — cells genuinely
          // haven't drawn yet, showing through as black. Same fix already
          // proven on Search Results' heavier cards, scaled to this screen's
          // lighter (~90-110dp) rows.
          drawDistance={800}
          overScrollMode="auto"
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={refreshControl}
          onScrollBeginDrag={closeOpenRow}
          onTouchStart={(event) => {
            touchStartRef.current = {
              x: event.nativeEvent.pageX,
              y: event.nativeEvent.pageY,
            };
          }}
          onTouchEnd={(event) => {
            const deltaX = Math.abs(
              event.nativeEvent.pageX - touchStartRef.current.x,
            );
            const deltaY = Math.abs(
              event.nativeEvent.pageY - touchStartRef.current.y,
            );
            if (deltaX < exactScale(8) && deltaY < exactScale(8)) {
              closeOpenRow();
            }
          }}
          ListEmptyComponent={listEmptyComponent}
        />
      )}
    </View>
  );
};
