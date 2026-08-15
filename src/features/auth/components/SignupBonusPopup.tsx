import { CarouselDot } from "@/src/components/animations/carousel";
import { CorporateBenefitsPage } from "./signup-bonus/CorporateBenefitsPage";
import { CARD_WIDTH } from "./signup-bonus/constants";
import { WalletBonusPage } from "./signup-bonus/WalletBonusPage";
import { ANIMATIONS } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { useWebsiteContent } from "@/src/hooks/queries/useWebsiteContent";
import { useLoopingCarousel } from "@/src/hooks/useLoopingCarousel";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { walletService } from "@/src/services/wallet.service";
import { useAuthStore } from "@/src/store/authStore";
import { useUIStore } from "@/src/store/uiStore";
import {
  SignupBonusData,
  SignupBonusPopupContent,
} from "../types/signupBonus";
import { exactScale } from "@/src/utils/exactScale";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Dimensions, Modal, Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BONUS_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

interface Props {
  testMode?: boolean;
  onClose?: () => void;
}

export const SignupBonusPopup: React.FC<Props> = ({
  testMode = false,
  onClose,
}) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { data: content } = useWebsiteContent("signup_bonus_popup") as {
    data?: SignupBonusPopupContent;
  };
  // Gate: the popup must not appear until the onboarding permission flow
  // (location → notification) has finished, so it never overlaps a dialog.
  const permissionFlowComplete = useUIStore((s) => s.permissionFlowComplete);
  const { data: cartWalletSettings } = useCartWalletSettings();
  const walletSettings = cartWalletSettings?.wallet;
  const isBonusOn = walletSettings
    ? walletSettings.isWalletBonusActive || walletSettings.isCoinsBonusActive
    : true;
  const [isOpen, setIsOpen] = useState(testMode);
  const [bonusData, setBonusData] = useState<SignupBonusData | null>(
    testMode ? { wallet: 100, coins: 50 } : null,
  );
  const { balance } = useWalletBalance();
  const corporateCredits = Number(balance?.corporateCredits || 0);
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

    // Wait for the location + notification permission flow to finish first, so
    // the bonus popup never overlaps a permission dialog.
    if (!permissionFlowComplete) return;

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
    permissionFlowComplete,
    cartWalletSettings,
    isBonusOn,
    setUser,
    queryClient,
  ]);

  const hasWallet = !!bonusData && bonusData.wallet > 0;
  const hasCoins = !!bonusData && bonusData.coins > 0;
  const hasCorporateCredits = !!user?.isCorporateUser && corporateCredits > 0;

  const handleClose = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  // Memoized so gesture-driven state (isInteracting/activePageIndex) doesn't
  // force these heavy trees (gradients, SVGs) to rebuild mid-drag, which was
  // congesting the JS thread and making the swipe feel disconnected from the
  // finger.
  const pages = useMemo(() => {
    const result: React.ReactNode[] = [];
    if (bonusData) {
      result.push(
        <WalletBonusPage
          key="wallet"
          content={content}
          bonusData={bonusData}
          hasWallet={hasWallet}
          hasCoins={hasCoins}
          onCta={handleClose}
        />,
      );
    }
    if (hasCorporateCredits) {
      result.push(
        <CorporateBenefitsPage
          key="corporate"
          creditsBalance={corporateCredits}
          onCta={handleClose}
        />,
      );
    }
    return result;
  }, [
    bonusData,
    hasWallet,
    hasCoins,
    hasCorporateCredits,
    corporateCredits,
    content,
    handleClose,
  ]);

  const isLooping = pages.length === 2;
  // [dummy copy of page B, real A, real B, dummy copy of page A] — same
  // infinite-loop padding trick as FloatingBannersCarousel.
  const slides = useMemo(
    () => (isLooping ? [pages[1], pages[0], pages[1], pages[0]] : pages),
    [isLooping, pages],
  );

  const {
    scrollViewRef,
    progress,
    pageHeight,
    cardAnimatedStyle,
    scrollHandler,
    onScrollBeginDrag,
    onScrollEndDrag,
    onMomentumScrollEnd,
    onSlideLayout,
  } = useLoopingCarousel({
    isOpen,
    isLooping,
    slideWidth: CARD_WIDTH,
    slideCount: slides.length,
  });

  if (!bonusData && !hasCorporateCredits && !isOpen) {
    // Nothing to show yet (still loading / no bonus this session).
    return null;
  }
  if (pages.length === 0) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          }}
          onPress={handleClose}
        />
        <View
          pointerEvents="box-none"
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: exactScale(24),
          }}
        >
          <Animated.View
            style={[
              {
                width: CARD_WIDTH,
                borderRadius: exactScale(16),
                overflow: "hidden",
                backgroundColor: "#fff",
              },
              cardAnimatedStyle,
            ]}
          >
            <View
              style={{ height: pageHeight || undefined, overflow: "hidden" }}
            >
              <Animated.ScrollView
                ref={scrollViewRef as any}
                horizontal
                pagingEnabled={isLooping}
                scrollEnabled={isLooping}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                onScrollBeginDrag={onScrollBeginDrag}
                onScrollEndDrag={onScrollEndDrag}
                onMomentumScrollEnd={onMomentumScrollEnd}
                style={{ width: CARD_WIDTH, height: pageHeight || undefined }}
                contentContainerStyle={{ width: CARD_WIDTH * slides.length }}
              >
                {slides.map((page, i) => (
                  <View
                    key={i}
                    style={{ width: CARD_WIDTH, justifyContent: "flex-start" }}
                    onLayout={onSlideLayout(i)}
                  >
                    {page}
                  </View>
                ))}
              </Animated.ScrollView>
            </View>

            {pages.length > 1 && (
              <View
                className="flex-row justify-center items-center gap-x-1.5"
                style={{
                  paddingTop: exactScale(2),
                  paddingBottom: exactScale(8),
                }}
              >
                {pages.map((_, i) => (
                  <CarouselDot
                    key={i}
                    index={i}
                    progress={progress}
                    total={pages.length}
                  />
                ))}
              </View>
            )}
          </Animated.View>
        </View>

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
