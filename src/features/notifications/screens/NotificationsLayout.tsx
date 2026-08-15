import { NotificationLog } from "@/src/api/in-app-notification.api";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import {
  useDismissAllNotifications,
  useDismissNotification,
  useMarkNotificationRead,
} from "@/src/hooks/mutations/useNotificationMutations";
import { useNotifications } from "@/src/hooks/queries/useNotifications";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { useToastStore } from "@/src/store/toastStore";
import { exactScale } from "@/src/utils/exactScale";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import {
  NotificationRow,
  SECTION_ORDER,
  getSectionKey,
} from "../components/NotificationRow";
import { NotificationsSkeleton } from "../components/NotificationsSkeleton";
import { styles as s } from "../notifications.styles";

export const NotificationsLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const router = useNav();
  const showToast = useToastStore((state) => state.show);
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const { notifications, isLoading, isRefetching, isError, refetch } =
    useNotifications();
  const { mutate: dismiss, mutateAsync: dismissAsync } =
    useDismissNotification();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: dismissAll, isPending: isClearingAll } =
    useDismissAllNotifications();
  const [isEntryLoading, setIsEntryLoading] = useState(true);

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
        router.push("/profile/wallet");
        return;
      }

      // Orders → track when we have an id, otherwise the orders list
      if (event.startsWith("order.")) {
        if (notification.orderId) {
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
    [closeOpenRow, markRead, router],
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
        <ScrollView
          className="flex-1"
          overScrollMode="auto"
          contentContainerStyle={[
            s.content,
            {
              paddingBottom: adjustedBottom + exactScale(16),
              flexGrow: 1,
            },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => {
                closeOpenRow();
                void refetch();
              }}
              tintColor="#0F7635"
              colors={["#0F7635"]}
            />
          }
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
        >
          {showError && (
            <View
              className="flex-1 items-center justify-center"
              style={{ paddingHorizontal: exactScale(24) }}
            >
              <Text style={s.errorTitle}>Unable to load notifications</Text>
              <Text style={s.errorSub}>
                Please check your connection and try again.
              </Text>
              <Touchable
                onPress={() => void refetch()}
                style={s.retryButton}
                accessibilityLabel="Retry loading notifications"
              >
                <Text style={s.retryText}>Try Again</Text>
              </Touchable>
            </View>
          )}

          {showEmpty && (
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
          )}

          {sections.map((section, sectionIndex) => (
            <View
              key={section.key}
              style={[s.section, sectionIndex === 0 && s.firstSection]}
            >
              <Text style={s.sectionHeader}>{section.key}</Text>
              {section.items.map((notification, idx) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  section={section.key}
                  isLast={idx === section.items.length - 1}
                  onPress={handlePress}
                  onDismiss={handleDismiss}
                  onMarkRead={handleMarkRead}
                  onDelete={handleSwipeDelete}
                  onInteraction={closeOpenRow}
                  onWillOpen={handleRowWillOpen}
                  onDidClose={handleRowDidClose}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
