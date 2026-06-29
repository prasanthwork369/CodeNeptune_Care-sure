import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { colors } from "@/src/constants/theme";
import { useNotifications } from "@/src/hooks/queries/useNotifications";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";
import { useNav } from "@/src/hooks/useNav";
import { useNotificationStore } from "@/src/store/notificationStore";
import type { DeliveryLocation } from "@/src/types/home";
import { Image } from "expo-image";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./HomeHeader.styles";
import { exactScale } from "@/src/utils/exactScale";

const NotificationIcon = icons.notification;

interface HomeHeaderProps {
  location: DeliveryLocation;
  onPressLocation?: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  location,
  onPressLocation,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const { balance } = useWalletBalance();
  const { latestPrescription, hasPendingPrescription } =
    usePrescriptionBanner();

  const { lastSeenRxId, lastSeenRxStatus } = useNotificationStore();
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
      style={{ paddingTop: insets.top + exactScale(10) }}
    >
      {/* Left: Delivery Location */}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.deliverLabel} className="font-inter-semibold uppercase">
          DELIVER TO
        </Text>
        <Touchable
          activeOpacity={0.1}
          onPress={onPressLocation}
          accessibilityRole="button"
          accessibilityLabel={`Change delivery location, current ${location.label || location.city}`}
          className="flex-row items-center mt-1.5"
          style={{ minWidth: 0 }}
        >
          <Text
            style={[s.locationText, { flexShrink: 1 }]}
            className="font-inter-bold capitalize"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location.pincode
              ? `${location.city} - ${location.pincode}`
              : location.label &&
                  location.label !== "DELIVER TO" &&
                  location.label !== location.city
                ? `${location.label} - ${location.city}`
                : location.city}
          </Text>
          <icons.arrow_drop_down
            fill="#1C1B1F"
            style={[s.dropDownIcon, { flexShrink: 0 }]}
          />
        </Touchable>
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
          onPress={() => router.push("/notifications")}
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
};
