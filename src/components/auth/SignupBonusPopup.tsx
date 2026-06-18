import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { walletService } from "@/src/services/wallet.service";
import { useAuthStore } from "@/src/store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Modal, Text, View } from "react-native";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BONUS_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface BonusData {
  wallet: number;
  coins: number;
}

interface Props {
  testMode?: boolean;
  onClose?: () => void;
}

export const SignupBonusPopup: React.FC<Props> = ({
  testMode = false,
  onClose,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(testMode);
  const [bonusData, setBonusData] = useState<BonusData | null>(
    testMode ? { wallet: 100, coins: 50 } : null,
  );
  const [showConfetti, setShowConfetti] = useState(testMode);
  const confettiRef = useRef<any>(null);

  useEffect(() => {
    if (testMode) return;

    if (!isAuthenticated || !user?.id) return;

    // Wait until we've actually landed on the Home screen before
    // checking/showing the bonus — avoids it popping up mid-navigation
    // (OTP screen -> Home transition).
    if (pathname !== "/") return;

    let cancelled = false;
    let confettiTimer: ReturnType<typeof setTimeout> | null = null;

    const checkBonus = async () => {
      const storageKey = `caresure.bonus.shown.${user.id}`;
      const alreadyShown = await SecureStore.getItemAsync(storageKey);
      if (alreadyShown || cancelled) return;

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
          await SecureStore.setItemAsync(storageKey, "true");
        }
      } catch (err) {
        if (__DEV__)
          console.error("[SignupBonusPopup] failed to check wallet logs", err);
      }
    };

    checkBonus();

    return () => {
      cancelled = true;
      if (confettiTimer) clearTimeout(confettiTimer);
    };
  }, [isAuthenticated, user?.id, pathname]);

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
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
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
              Hi there!
            </Text>
            <Text
              className="font-inter-extrabold text-[#222222]"
              style={{ fontSize: 19, marginTop: 2 }}
            >
              Welcome to CareSure
            </Text>
            <Text
              className="font-inter text-[#6A6A6A]"
              style={{ fontSize: 12, marginTop: 3 }}
            >
              You&apos;ve got rewards waiting for you
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

            <Image
              source={HOME_IMAGES.bonusGift}
              style={{
                position: "absolute",
                top: -6,
                right: -8,
                width: 145,
                height: 115,
              }}
              resizeMode="contain"
            />
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
              Your Wallet
            </Text>

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
                      <Image
                        source={HOME_IMAGES.rupeeCoin}
                        style={{ width: 38, height: 38 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text
                        className="font-inter-medium text-[#222222]"
                        style={{ fontSize: 10, letterSpacing: 1 }}
                      >
                        COINS
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
                      <Image
                        source={HOME_IMAGES.cash}
                                                style={{ width: 38, height: 38 }}
                        resizeMode="contain"
                      />
                    </View>
                    <View>
                      <Text
                        className="font-inter-medium text-[#222222]"
                        style={{ fontSize: 10, letterSpacing: 1 }}
                      >
                        BALANCE
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

            {/* Feature highlights */}
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
                <View className="flex-1 items-center">
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      backgroundColor: "#FDF5FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <icons.bonus_coins width={16} height={18} />
                  </View>
                  <Text
                    className="font-inter-semibold text-[#222222] text-center"
                    style={{ fontSize: 11 }}
                    numberOfLines={1}
                  >
                    Earn coins
                  </Text>
                  <Text
                    className="font-inter-medium text-[#6A6A6A] text-center"
                    style={{ fontSize: 9, marginTop: 1 }}
                    numberOfLines={1}
                  >
                    on every order
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    height: 32,
                    backgroundColor: "#919EAB33",
                    marginHorizontal: 6,
                  }}
                />

                <View className="flex-1 items-center">
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      backgroundColor: "#FFF8EC",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <icons.bonus_discount width={18} height={12} />
                  </View>
                  <Text
                    className="font-inter-semibold text-[#222222] text-center"
                    style={{ fontSize: 11 }}
                    numberOfLines={1}
                  >
                    Use coins
                  </Text>
                  <Text
                    className="font-inter-medium text-[#6A6A6A] text-center"
                    style={{ fontSize: 9, marginTop: 1 }}
                    numberOfLines={1}
                  >
                    for discounts
                  </Text>
                </View>

                <View
                  style={{
                    width: 1,
                    height: 32,
                    backgroundColor: "#919EAB33",
                    marginHorizontal: 6,
                  }}
                />

                <View className="flex-1 items-center">
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 10,
                      backgroundColor: "#E9F5FF",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    <icons.bonus_gift width={16} height={16} />
                  </View>
                  <Text
                    className="font-inter-semibold text-[#222222] text-center"
                    style={{ fontSize: 11 }}
                    numberOfLines={1}
                  >
                    More benefits
                  </Text>
                  <Text
                    className="font-inter-medium text-[#6A6A6A] text-center"
                    style={{ fontSize: 9, marginTop: 1 }}
                    numberOfLines={1}
                  >
                    exclusive for you
                  </Text>
                </View>
              </View>
            </LinearGradient>
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
                Start Shopping
              </Text>
            </Touchable>
          </View>
        </LinearGradient>

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
      </View>
    </Modal>
  );
};
