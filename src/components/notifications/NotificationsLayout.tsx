import { NotificationLog } from "@/src/api/inAppNotification.api";
import { CardOptionsMenu } from "@/src/components/ui/CardOptionsMenu";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
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
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextStyle,
  View,
} from "react-native";
import { NotificationsSkeleton } from "./NotificationsSkeleton";
import { SwipeableNotificationRow } from "./SwipeableNotificationRow";
import { styles as s } from "./notifications.styles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

const SECTION_ORDER = ["TODAY", "YESTERDAY", "THIS WEEK", "EARLIER"] as const;
type SectionKey = (typeof SECTION_ORDER)[number];

function getSectionKey(iso: string): SectionKey {
  const date = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (date >= startOfToday) return "TODAY";
  if (date >= startOfYesterday) return "YESTERDAY";
  if (date >= startOfWeek) return "THIS WEEK";
  return "EARLIER";
}

function formatRowTime(iso: string, section: SectionKey): string {
  const date = new Date(iso);
  if (section === "TODAY") {
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    return `${Math.floor(diffMin / 60)} hr ago`;
  }
  const time = date
    .toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "");
  if (section === "YESTERDAY") return `Yesterday, ${time}`;
  if (section === "THIS WEEK")
    return `${date.toLocaleDateString("en-IN", { weekday: "short" })}, ${time}`;
  return `${date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}, ${time}`;
}

// ─── Per-type icon/color config ──────────────────────────────────────────────

function getNotificationVisual(n: NotificationLog) {
  const event = n.event;
  if (event === "prescription.rejected") {
    return {
      bg: "#FEF2F2",
      icon: (
        <Image
          source={HOME_IMAGES.warningIcon}
          style={s.notifIcon}
          contentFit="contain"
        />
      ),
    };
  }
  if (event.startsWith("order.")) {
    if (event.includes("cancel")) {
      return {
        bg: "#FEF2F2",
        icon: (
          <Image
            source={HOME_IMAGES.blockIcon}
            style={s.notifIcon}
            contentFit="contain"
          />
        ),
      };
    }
    return {
      bg: "#FFFFF4",
      icon: (
        <Image
          source={HOME_IMAGES.bucketCheckIcon}
          style={s.notifIcon}
          contentFit="contain"
        />
      ),
    };
  }
  if (event.includes("coin")) {
    const isCredit = n.metadata?.type === "credit" || event.includes("credit");
    return isCredit
      ? {
          bg: "#F4FFF7",
          icon: (
            <Image
              source={HOME_IMAGES.coinCredit}
              style={s.notifIcon}
              contentFit="contain"
            />
          ),
        }
      : {
          bg: "#FEF2F2",
          icon: (
            <Image
              source={HOME_IMAGES.coinDebit}
              style={[s.notifIcon, { tintColor: "#DC2626" }]}
              contentFit="contain"
            />
          ),
        };
  }
  if (event.startsWith("wallet.")) {
    const isCredit = n.metadata?.type === "credit" || event.includes("credit");
    return isCredit
      ? {
          bg: "#F4FFF7",
          icon: (
            <icons.account_balance_wallet_green
              width={s.notifIcon.width}
              height={s.notifIcon.height}
            />
          ),
        }
      : {
          bg: "#FEF2F2",
          icon: (
            <icons.account_balance_wallet_red
              width={s.notifIcon.width}
              height={s.notifIcon.height}
            />
          ),
        };
  }
  if (event.includes("review")) {
    return {
      bg: "#F3F8FF",
      icon: (
        <Image
          source={HOME_IMAGES.notiHistoryIcon}
          style={s.notifIcon}
          contentFit="contain"
        />
      ),
    };
  }
  if (event === "prescription.uploaded" || event === "prescription.approved") {
    return {
      bg: "#F4FFF7",
      icon: (
        <icons.prescription_green
          width={s.notifIcon.width}
          height={s.notifIcon.height}
          fill="#15803D"
        />
      ),
    };
  }
  return {
    bg: "#F3F4F6",
    icon: (
      <icons.notification
        width={s.notifIcon.width}
        height={s.notifIcon.height}
        fill="#6B7280"
      />
    ),
  };
}

// `subject` is frequently null from the backend — fall back to a title
// derived from the event/metadata so the row never shows a blank title.
function getNotificationTitle(n: NotificationLog): string {
  if (n.subject) return n.subject;
  const event = n.event;
  const orderRef = n.orderId ? ` - #${n.orderId}` : "";

  if (event === "prescription.uploaded")
    return "Prescription Uploaded Successfully";
  if (event === "prescription.approved") return "Prescription Verified";
  if (event === "prescription.rejected") return "Prescription Rejected";
  if (event.includes("review")) return "Prescription Under Review";
  if (event.startsWith("order.")) {
    return event.includes("cancel")
      ? `Order Cancelled${orderRef}`
      : `Order Placed${orderRef}`;
  }
  if (event.includes("coin")) {
    const isCredit = n.metadata?.type === "credit" || event.includes("credit");
    return `${isCredit ? "+" : "-"}${n.metadata?.coinsAmount ?? ""} Coins ${isCredit ? "Credited" : "Debited"}`;
  }
  if (event.startsWith("wallet.")) {
    const isCredit = n.metadata?.type === "credit" || event.includes("credit");
    const amount = n.metadata?.walletAmount ?? "0";
    return `Wallet ${isCredit ? "Credited" : "Debited"}- ₹${amount}`;
  }
  return "Notification";
}

// ─── Notification row ────────────────────────────────────────────────────────

const optionRowStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  paddingHorizontal: exactScale(16),
  paddingVertical: exactScale(14),
};

const optionTextStyle: TextStyle = {
  fontWeight: "600",
  color: "#111827",
  marginLeft: exactScale(14),
};

interface NotificationRowItemProps {
  notification: NotificationLog;
  section: SectionKey;
  onPress: () => void;
  onDismiss: () => void;
  onMarkRead: () => void;
  onInteraction: () => void;
}

const NotificationRowItem: React.FC<NotificationRowItemProps> = ({
  notification,
  section,
  onPress,
  onDismiss,
  onMarkRead,
  onInteraction,
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
    <Touchable activeOpacity={0.7} onPress={onPress} style={s.notifRow}>
      <View style={s.notifLeading}>
        {!notification.isRead && <View style={s.unreadDot} />}
        <View
          style={[
            s.notifIconBox,
            s.notifIconPosition,
            {
              borderRadius: 999,
              backgroundColor: visual.bg,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          {visual.icon}
        </View>
      </View>

      <View style={s.notifCopy}>
        <Text style={s.notifTitle}>{getNotificationTitle(notification)}</Text>
        {isLong && !expanded ? (
          <Text style={[s.notifBody, { marginTop: exactScale(5) }]}>
            {body.substring(0, 100)}...{" "}
            <Text
              onPress={(e) => {
                e.stopPropagation?.();
                setExpanded(true);
              }}
              style={{ color: "#0F7635", fontWeight: "600" }}
            >
              View More
            </Text>
          </Text>
        ) : (
          <Text style={[s.notifBody, { marginTop: exactScale(5) }]}>
            {body}
          </Text>
        )}
        <Text style={[s.notifTime, { marginTop: exactScale(6) }]}>
          {formatRowTime(notification.createdAt, section)}
        </Text>
      </View>

      <View ref={triggerRef} collapsable={false}>
        <Touchable
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e) => {
            e.stopPropagation?.();
            onInteraction();
            openMenu();
          }}
          style={s.optionsTarget}
          accessibilityLabel="Notification options"
        >
          <icons.dots
            width={s.dotsIcon.width}
            height={s.dotsIcon.height}
            fill="#6A6A6A"
          />
        </Touchable>
      </View>

      <CardOptionsMenu
        useModal
        modalVisible={!!menuAnchor}
        onClose={() => setMenuAnchor(null)}
        popoverStyle={[
          s.popoverWidth,
          {
            position: "absolute",
            top: menuAnchor?.top ?? 0,
            right: 16,
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 10,
          },
        ]}
        items={[
          {
            key: "clear",
            icon: (
              <icons.close_dark
                width={s.popoverIcon.width}
                height={s.popoverIcon.height}
              />
            ),
            label: "Clear",
            rowStyle: optionRowStyle,
            textStyle: [s.popoverText, optionTextStyle],
            onPress: () => {
              setMenuAnchor(null);
              onDismiss();
            },
          },
          ...(!notification.isRead
            ? [
                {
                  key: "markRead",
                  icon: (
                    <icons.done_all
                      width={s.popoverIconAlt.width}
                      height={s.popoverIconAlt.height}
                      fill="#111827"
                    />
                  ),
                  label: "Mark as read",
                  rowStyle: optionRowStyle,
                  textStyle: [s.popoverText, optionTextStyle],
                  onPress: () => {
                    setMenuAnchor(null);
                    onMarkRead();
                  },
                },
              ]
            : []),
        ]}
      />
    </Touchable>
  );
};

// ─── Main layout ──────────────────────────────────────────────────────────────

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

  const handlePress = (notification: NotificationLog) => {
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
  };

  const handleClearAll = () => {
    dismissAll();
  };

  const closeOpenRow = useCallback(() => {
    openSwipeableRef.current?.close();
    openSwipeableRef.current = null;
  }, []);

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
                <SwipeableNotificationRow
                  key={notification.id}
                  isLast={idx === section.items.length - 1}
                  onDelete={() => handleSwipeDelete(notification.id)}
                  onWillOpen={handleRowWillOpen}
                  onDidClose={handleRowDidClose}
                >
                  <NotificationRowItem
                    notification={notification}
                    section={section.key}
                    onPress={() => {
                      closeOpenRow();
                      handlePress(notification);
                    }}
                    onDismiss={() => {
                      closeOpenRow();
                      dismiss(notification.id);
                    }}
                    onMarkRead={() => {
                      closeOpenRow();
                      markRead(notification.id);
                    }}
                    onInteraction={closeOpenRow}
                  />
                </SwipeableNotificationRow>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
