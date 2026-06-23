import { Touchable } from "@/src/components/ui/Touchable";
import { ANIMATIONS } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWebsiteContent } from "@/src/hooks/queries/useWebsiteContent";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { walletService } from "@/src/services/wallet.service";
import { useAuthStore } from "@/src/store/authStore";
import { SignupBonusPopupContent } from "@/src/types/signupBonus";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Modal, Text, View, Pressable, TouchableWithoutFeedback } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BONUS_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface BonusData {
  wallet: number;
  coins: number;
}

const BADGE_ICON_BG = ["#FDF5FF", "#FFF8EC", "#E9F5FF"];

// Badge icons are always remote URLs from the CMS -- no local fallback.
const BadgeIcon = ({ icon }: { icon: string }) => (
  <Image source={{ uri: icon }} style={{ width: 16, height: 16 }} resizeMode="contain" />
);

interface Props {
  testMode?: boolean;
  onClose?: () => void;
}

export const SignupBonusPopup: React.FC<Props> = ({
  testMode = false,
  onClose,
}) => {
  const { isAuthenticated, user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { data: content } = useWebsiteContent('signup_bonus_popup') as {
    data?: SignupBonusPopupContent;
  };
  const { data: cartWalletSettings } = useCartWalletSettings();
  const walletSettings = cartWalletSettings?.wallet;
  const isBonusOn = walletSettings
    ? walletSettings.isWalletBonusActive || walletSettings.isCoinsBonusActive
    : true;
  const [isOpen, setIsOpen] = useState(testMode);
  const [bonusData, setBonusData] = useState<BonusData | null>(
    testMode ? { wallet: 100, coins: 50 } : null,
  );
  const [showConfetti, setShowConfetti] = useState(testMode);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (testMode) return;

    if (!isAuthenticated || !user?.id) return;

    // isFirstTimeLogin is set by the backend and shared across web and
    // mobile -- once either platform has shown the popup (or skipped it
    // because bonuses are off), the backend flips it to false so it never
    // shows again on any device.
    if (user.isFirstTimeLogin === false) return;

    // Wait until we've actually landed on the Home screen before
    // checking/showing the bonus — avoids it popping up mid-navigation
    // (OTP screen -> Home transition).
    if (pathname !== "/") return;

    let cancelled = false;
    let confettiTimer: ReturnType<typeof setTimeout> | null = null;

    const checkBonus = async () => {
      // Wait for wallet/coins bonus settings to load before deciding whether
      // to fetch logs — if admin has disabled both bonuses, skip entirely.
      if (!cartWalletSettings) return;
      if (!isBonusOn) {
        markShown();
        return;
      }

      try {
        const logs = await walletService.getLogs(5, 0);
        if (cancelled) return;

        const signupLog = logs.find(
          (log) => log.referenceType === "signup_bonus",
        );

        if (signupLog) {
          const age = Date.now() - new Date(signupLog.createdAt).getTime();
          if (age < BONUS_WINDOW_MS) {
            setBonusData({
              wallet: Number(signupLog.walletAmount),
              coins: Number(signupLog.coinsAmount),
            });
            setShowConfetti(true);
            setIsOpen(true);
            confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
          }
          markShown();
        }
      } catch (err) {
        if (__DEV__)
          console.error("[SignupBonusPopup] failed to check wallet logs", err);
      }
    };

    // Mirrors the backend, which already flips isFirstTimeLogin to false on
    // the first profile fetch -- this just keeps local state (and the
    // profile query cache) in sync so this session doesn't re-check.
    const markShown = () => {
      const updatedUser = { ...user, isFirstTimeLogin: false };
      setUser(updatedUser);
      queryClient.setQueryData(QUERY_KEYS.CUSTOMER.PROFILE, updatedUser);
    };

    checkBonus();

    return () => {
      cancelled = true;
      if (confettiTimer) clearTimeout(confettiTimer);
    };
  }, [
    isAuthenticated,
    user?.id,
    user?.isFirstTimeLogin,
    pathname,
    cartWalletSettings,
    isBonusOn,
    setUser,
    queryClient,
  ]);

  const hasWallet = bonusData && bonusData.wallet > 0;
  const hasCoins = bonusData && bonusData.coins > 0;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {
        setIsOpen(false);
        onClose?.();
      }}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
        onPress={() => {
          setIsOpen(false);
          onClose?.();
        }}
      >
        <TouchableWithoutFeedback>
          <LinearGradient
            colors={["#F3F9FF", "#FDF5FF", "#F1E6FF"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={{ width: "100%", borderRadius: 24, overflow: "hidden" }}
          >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 18,
              paddingBottom: 6,
              minHeight: 76,
            }}
          >
            <Text
              className="font-medium text-[#222222]"
              style={{ fontSize: 14 }}
            >
              {content?.greeting || "Hi there!"}
            </Text>
            <Text
              className="font-inter-extrabold text-[#222222]"
              style={{ fontSize: 19, marginTop: 2 }}
            >
              {content?.title || "Welcome to CareSure"}
            </Text>
            <Text
              className="font-inter text-[#6A6A6A]"
              style={{ fontSize: 12, marginTop: 3 }}
            >
              {content?.subtitle || "You've got rewards waiting for you"}
            </Text>

            <Svg
              width={200}
              height={200}
              style={{ position: "absolute", top: -50, right: -70 }}
            >
              <Defs>
                <RadialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#E9D5FF" stopOpacity={0.8} />
                  <Stop offset="100%" stopColor="#E9D5FF" stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect width={200} height={200} fill="url(#giftGlow)" />
            </Svg>

            {!!content?.giftImage && (
              <Image
                source={{ uri: content.giftImage }}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -8,
                  width: 145,
                  height: 115,
                }}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Wallet card */}
          <View
            style={{
              marginHorizontal: 16,
              marginTop: 4,
              marginBottom: 12,
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 14,
              borderWidth: 1,
              borderColor: "#919EAB33",
            }}
          >
            <Text
              className="font-inter-semibold text-[#222222]"
              style={{ fontSize: 14, marginBottom: 10 }}
            >
              {content?.walletTitle || "Your Wallet"}
            </Text>

            {content?.coinImage && (
              <Image
                source={{ uri: content.coinImage }}
                style={{
                  position: "absolute",
                  top: -28,
                  right: 14,
                  width: 56,
                  height: 56,
                }}
                resizeMode="contain"
              />
            )}

            <View className="flex-row" style={{ gap: 10, marginBottom: 12 }}>
              {hasCoins && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#FFF8EC",
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#FFE9BF",
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: "#FFE9BF",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                      }}
                    >
                      {!!content?.coinsIcon && (
                        <Image
                          source={{ uri: content.coinsIcon }}
                          style={{ width: 38, height: 38 }}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                    <View>
                      <Text
                        className="font-inter-medium text-[#222222]"
                        style={{ fontSize: 10, letterSpacing: 1 }}
                      >
                        {(content?.coinsLabel || "COINS").toUpperCase()}
                      </Text>
                      <Text
                        className="font-inter-extrabold "
                        style={{ fontSize: 22, lineHeight: 26,color: "#E28F1C" }}
                      >
                        {bonusData!.coins}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {hasWallet && (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: "#D8FFE6",
                    borderRadius: 14,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#A6F0C0",
                  }}
                >
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 16,
                        backgroundColor: "#D8FFE6",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 8,
                      }}
                    >
                      {!!content?.balanceIcon && (
                        <Image
                          source={{ uri: content.balanceIcon }}
                          style={{ width: 38, height: 38 }}
                          resizeMode="contain"
                        />
                      )}
                    </View>
                    <View>
                      <Text
                        className="font-inter-medium text-[#222222]"
                        style={{ fontSize: 10, letterSpacing: 1 }}
                      >
                        {(content?.balanceLabel || "BALANCE").toUpperCase()}
                      </Text>
                      <Text
                        className="font-inter-bold text-[#0F7635]"
                        style={{ fontSize: 22, lineHeight: 26 }}
                      >
                        ₹{Number(bonusData!.wallet).toFixed(0)}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Feature highlights — API-driven only, no local fallback */}
            {!!content?.badges?.length && (
              <LinearGradient
                colors={["#FDF5FF", "#F3F9FF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, marginTop: 2 }}
              >
                <View
                  className="flex-row items-center"
                  style={{ paddingVertical: 10, paddingHorizontal: 8 }}
                >
                  {content.badges.map((badge, index, arr) => (
                    <React.Fragment key={index}>
                      <View className="flex-1 items-center">
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 10,
                            backgroundColor: BADGE_ICON_BG[index % BADGE_ICON_BG.length],
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 4,
                          }}
                        >
                          <BadgeIcon icon={badge.icon} />
                        </View>
                        <Text
                          className="font-inter-semibold text-[#222222] text-center"
                          style={{ fontSize: 11 }}
                          numberOfLines={1}
                        >
                          {badge.label}
                        </Text>
                        <Text
                          className="font-inter-medium text-[#6A6A6A] text-center"
                          style={{ fontSize: 9, marginTop: 1 }}
                          numberOfLines={1}
                        >
                          {badge.description}
                        </Text>
                      </View>

                      {index < arr.length - 1 && (
                        <View
                          style={{
                            width: 1,
                            height: 32,
                            backgroundColor: "#919EAB33",
                            marginHorizontal: 6,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              </LinearGradient>
            )}
          </View>

          {/* CTA */}
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <Touchable
              onPress={() => {
                setIsOpen(false);
                onClose?.();
              }}
              activeOpacity={0.85}
              className="w-full items-center"
              style={{
                backgroundColor: "#0F7635",
                paddingVertical: 13,
                borderRadius: 12,
              }}
            >
              <Text
                className="font-inter-bold text-white"
                style={{ fontSize: 15 }}
              >
                {content?.buttonText || "Start Shopping"}
              </Text>
            </Touchable>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>

      {/* Confetti — rendered AFTER card so it paints on top */}
      {showConfetti && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: SCREEN_W,
            height: SCREEN_H,
          }}
        >
          <DotLottie
            ref={confettiRef}
            source={ANIMATIONS.confetti}
            autoplay
            loop={false}
            style={{ width: SCREEN_W, height: SCREEN_H }}
          />
        </View>
      )}
    </Pressable>
  </Modal>
  );
};
