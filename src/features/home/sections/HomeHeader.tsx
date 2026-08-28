import { ShimmerBlock } from "@/src/components/ui/shimmer";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { usePrescriptionBanner } from "@/src/features/home/hooks/usePrescriptionBanner";
import type { DeliveryLocation } from "@/src/features/home/types";
import { useNotifications } from "@/src/features/notifications/hooks/useNotifications";
import { useWalletBalance } from "@/src/features/wallet/hooks/useWallet";
import { useNav } from "@/src/hooks/useNav";
import { useAuthStore } from "@/src/store/authStore";
import { useLocationStore } from "@/src/store/locationStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import { exactScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./HomeHeader.styles";

// How long the "delivered here" hint stays up before fading on its own.
const LOCATION_HINT_AUTO_DISMISS_MS = 4000;
// Lets Home settle in before the hint appears on a fresh open, rather than
// popping in mid-entrance.
const LOCATION_HINT_INITIAL_DELAY_MS = 700;

const DeliveryLocationHint: React.FC = () => {
  const visible = useLocationStore((store) => store.justConfirmedLocation);
  const setJustConfirmedLocation = useLocationStore(
    (store) => store.setJustConfirmedLocation,
  );

  useEffect(() => {
    const timer = setTimeout(
      () => setJustConfirmedLocation(true),
      LOCATION_HINT_INITIAL_DELAY_MS,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(
      () => setJustConfirmedLocation(false),
      LOCATION_HINT_AUTO_DISMISS_MS,
    );
    return () => clearTimeout(timer);
  }, [visible, setJustConfirmedLocation]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      exiting={FadeOut.duration(150)}
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: exactScale(-10),
        zIndex: 20,
      }}
    >
      <View style={s.locationHintArrow} />
      <View style={s.locationHintBubble}>
        <Text style={s.locationHintText}>
          Your order will be delivered here
        </Text>
        <Touchable
          onPress={() => setJustConfirmedLocation(false)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={{ marginLeft: exactScale(8) }}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <icons.close_small
            width={exactScale(12)}
            height={exactScale(12)}
            fill="#FFFFFF"
          />
        </Touchable>
      </View>
    </Animated.View>
  );
};

const NotificationIcon = icons.notification;

interface HomeHeaderProps {
  location: DeliveryLocation;
  onPressLocation?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = React.memo(
  ({ location, onPressLocation }) => {
    const router = useNav();
    const insets = useSafeAreaInsets();
    const { balance, loading: balanceLoading } = useWalletBalance();
    const isAuthenticated = useAuthStore((st) => st.isAuthenticated);
    const { latestPrescription, hasPendingPrescription } =
      usePrescriptionBanner();

    // Field selectors
    const lastSeenRxId = useNotificationStore((st) => st.lastSeenRxId);
    const lastSeenRxStatus = useNotificationStore((st) => st.lastSeenRxStatus);
    const setLastSeenRx = useNotificationStore((st) => st.setLastSeenRx);
    const syncRxUnread = useNotificationStore((st) => st.syncRxUnread);
    const clearRxUnreadDisplay = useNotificationStore(
      (st) => st.clearRxUnreadDisplay,
    );
    const displayedRxUnread = useNotificationStore((st) => st.displayedRxUnread);
    const { unreadCount: apiUnreadCount } = useNotifications();
    const isRxUnread =
      hasPendingPrescription &&
      latestPrescription &&
      (latestPrescription.id !== lastSeenRxId ||
        String(latestPrescription.status) !== lastSeenRxStatus);

    useEffect(() => {
      syncRxUnread(!!isRxUnread);
    }, [isRxUnread, syncRxUnread]);

    const unreadCount = apiUnreadCount + (displayedRxUnread ? 1 : 0);

    const isBalancePending =
      isAuthenticated && (balanceLoading || balance == null);
    const walletDisplay =
      balance != null
        ? `₹${Number(balance.walletBalance) % 1 === 0 ? Number(balance.walletBalance).toFixed(0) : Number(balance.walletBalance).toFixed(2)}`
        : "₹0";

    return (
      <View
        style={[
          s.root,
          { paddingTop: insets.top + exactScale(10) },
        ]}
      >
        {/* Left: Delivery Location */}
        <View style={s.leftContainer}>
          <Text style={s.deliverLabel}>
            DELIVER TO
          </Text>
          <Touchable
            activeOpacity={0.1}
            onPress={onPressLocation}
            accessibilityRole="button"
            accessibilityLabel={`Change delivery location, current ${location.shortCity || location.city}`}
            style={s.locationTouchable}
          >
            {/* City only */}
            <Text
              style={s.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location.shortCity || location.city}
            </Text>
            <icons.arrow_drop_down
              fill="#1C1B1F"
              style={s.dropDownIcon}
            />
          </Touchable>
          <DeliveryLocationHint />
        </View>

        {/* Right: Wallet + Notification */}
        <View style={s.rightContainer}>
          <Touchable
            onPress={() => router.push("/profile/wallet")}
            style={s.walletTouchable}
            accessibilityRole="button"
            accessibilityLabel={
              isBalancePending
                ? "Wallet, balance loading"
                : `Wallet, balance ${walletDisplay}`
            }
          >
            <View style={s.iconBtn}>
              <Image
                source={HOME_IMAGES.wallet}
                style={s.walletIcon}
                contentFit="contain"
              />
            </View>
            <View style={s.walletBadgeWrap}>
              {isBalancePending ? (
                <ShimmerBlock
                  width={exactScale(28)}
                  height={exactScale(10)}
                  borderRadius={4}
                />
              ) : (
                <Text
                  style={s.walletBadgeText}
                  numberOfLines={1}
                >
                  {walletDisplay}
                </Text>
              )}
            </View>
          </Touchable>

          <Touchable
            onPress={() => {
              if (isRxUnread && latestPrescription) {
                setLastSeenRx(
                  latestPrescription.id,
                  String(latestPrescription.status),
                );
              }
              clearRxUnreadDisplay();
              router.push("/notifications");
            }}
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
            style={s.notificationBtn}
          >
            <NotificationIcon color={colors.text} style={s.notificationIcon} />
            {unreadCount > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </Touchable>
        </View>
      </View>
    );
  },
);
HomeHeader.displayName = "HomeHeader";
