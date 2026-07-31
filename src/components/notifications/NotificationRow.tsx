import { NotificationLog } from "@/src/api/inAppNotification.api";
import { CardOptionsMenu } from "@/src/components/ui/CardOptionsMenu";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useCallback, useRef, useState } from "react";
import { Text, TextStyle, View } from "react-native";
import { SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import { SwipeableNotificationRow } from "./SwipeableNotificationRow";
import { styles as s } from "./notifications.styles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

export const SECTION_ORDER = [
  "TODAY",
  "YESTERDAY",
  "THIS WEEK",
  "EARLIER",
] as const;
export type SectionKey = (typeof SECTION_ORDER)[number];

export function getSectionKey(iso: string): SectionKey {
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

interface NotificationRowProps {
  notification: NotificationLog;
  section: SectionKey;
  isLast: boolean;
  onPress: (notification: NotificationLog) => void;
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  onInteraction: () => void;
  onWillOpen: (methods: SwipeableMethods) => void;
  onDidClose: (methods: SwipeableMethods) => void;
}

/**
 * One swipeable notification. Memoized and taking only id-based callbacks, so
 * the list can hand every row the same stable handlers and untouched rows skip
 * re-rendering when one row's state changes.
 */
const NotificationRowBase: React.FC<NotificationRowProps> = ({
  notification,
  section,
  isLast,
  onPress,
  onDismiss,
  onMarkRead,
  onDelete,
  onInteraction,
  onWillOpen,
  onDidClose,
}) => {
  const handlePress = useCallback(
    () => onPress(notification),
    [onPress, notification],
  );
  const handleDismiss = useCallback(
    () => onDismiss(notification.id),
    [onDismiss, notification.id],
  );
  const handleMarkRead = useCallback(
    () => onMarkRead(notification.id),
    [onMarkRead, notification.id],
  );
  const handleDelete = useCallback(
    () => onDelete(notification.id),
    [onDelete, notification.id],
  );

  return (
    <SwipeableNotificationRow
      isLast={isLast}
      onDelete={handleDelete}
      onWillOpen={onWillOpen}
      onDidClose={onDidClose}
    >
      <NotificationRowItem
        notification={notification}
        section={section}
        onPress={handlePress}
        onDismiss={handleDismiss}
        onMarkRead={handleMarkRead}
        onInteraction={onInteraction}
      />
    </SwipeableNotificationRow>
  );
};

export const NotificationRow = React.memo(NotificationRowBase);
