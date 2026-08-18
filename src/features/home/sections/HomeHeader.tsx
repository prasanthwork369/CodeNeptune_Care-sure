import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useNotifications } from "@/src/hooks/queries/useNotifications";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { usePrescriptionBanner } from "@/src/features/home/hooks/usePrescriptionBanner";
import { useNav } from "@/src/hooks/useNav";
import { useLocationStore } from "@/src/store/locationStore";
import { useNotificationStore } from "@/src/store/notificationStore";
import type { DeliveryLocation } from "@/src/features/home/types";
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

  // Also greets the delivery location on a fresh Home open, not just after an
  // explicit address change — mirrors it fading in once, then hiding again.
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
        marginTop: exactScale(1),
        zIndex: 20,
      }}
    >
      <View style={s.locationHintArrow} />
      <View className="flex-row items-center" style={s.locationHintBubble}>
        <Text
          style={s.locationHintText}
          className="font-inter-medium flex-shrink"
        >
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
    const { balance } = useWalletBalance();
    const { latestPrescription, hasPendingPrescription } =
      usePrescriptionBanner();

    // Field selectors, or unrelated notification writes re-render this header.
    const lastSeenRxId = useNotificationStore((s) => s.lastSeenRxId);
    const lastSeenRxStatus = useNotificationStore((s) => s.lastSeenRxStatus);
    const setLastSeenRx = useNotificationStore((s) => s.setLastSeenRx);
    const { unreadCount: apiUnreadCount } = useNotifications();
    const isRxUnread =
      hasPendingPrescription &&
      latestPrescription &&
      (latestPrescription.id !== lastSeenRxId ||
        String(latestPrescription.status) !== lastSeenRxStatus);
    const unreadCount = apiUnreadCount + (isRxUnread ? 1 : 0);

    const walletDisplay =
      balance != null
        ? `₹${Number(balance.walletBalance) % 1 === 0 ? Number(balance.walletBalance).toFixed(0) : Number(balance.walletBalance).toFixed(2)}`
        : "₹0";

    return (
      <View
        className="flex-row justify-between items-center px-5 pb-2"
        // Keep controls below the status bar/notch with only a compact visual gap.
        style={{ paddingTop: insets.top + exactScale(2) }}
      >
        {/* Left: Delivery Location */}
        <View style={{ flex: 1, minWidth: 0, position: "relative" }}>
          <Text
            style={s.deliverLabel}
            className="font-inter-semibold uppercase"
          >
            DELIVER TO
          </Text>
          <Touchable
            activeOpacity={0.1}
            onPress={onPressLocation}
            accessibilityRole="button"
            accessibilityLabel={`Change delivery location, current ${location.shortCity || location.city}`}
            className="flex-row items-center mt-1.5"
            style={{ minWidth: 0 }}
          >
            {/* City only — serviceability is already enforced when picking a location. */}
            <Text
              style={[s.locationText, { flexShrink: 1 }]}
              className="font-inter-bold capitalize"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {location.shortCity || location.city}
            </Text>
            <icons.arrow_drop_down
              fill="#1C1B1F"
              style={[s.dropDownIcon, { flexShrink: 0 }]}
            />
          </Touchable>
          <DeliveryLocationHint />
        </View>

        {/* Right: Wallet + Notification */}
        <View className="flex-row items-start gap-3" style={{ flexShrink: 0 }}>
          <Touchable
            onPress={() => router.push("/profile/wallet")}
            className="items-center"
            accessibilityRole="button"
            accessibilityLabel={`Wallet, balance ${walletDisplay}`}
          >
            <View
              style={s.iconBtn}
              className="rounded-full justify-center items-center bg-white"
            >
              <Image
                source={HOME_IMAGES.wallet}
                style={s.walletIcon}
                contentFit="contain"
              />
            </View>
            <View style={[s.walletBadgeWrap, { marginTop: -exactScale(14) }]}>
              <Text style={s.walletBadgeText} className="font-inter-bold">
                {walletDisplay}
              </Text>
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
              router.push("/notifications");
            }}
            accessibilityRole="button"
            accessibilityLabel={`Notifications, ${unreadCount} unread`}
            style={s.notificationBtn}
            className="justify-center items-center bg-white relative"
          >
            <NotificationIcon color={colors.text} style={s.notificationIcon} />
            {unreadCount > 0 && (
              <View
                style={s.badge}
                className="absolute -top-1 -right-1 bg-[#C22923] rounded-full items-center justify-center px-1 border border-white"
              >
                <Text
                  style={s.badgeText}
                  className="font-inter-bold text-white leading-none"
                >
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
