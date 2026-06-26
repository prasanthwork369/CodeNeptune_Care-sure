import { CarouselDot } from "@/src/components/animations/carousel";
import { Touchable } from "@/src/components/ui/Touchable";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWebsiteContent } from "@/src/hooks/queries/useWebsiteContent";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { walletService } from "@/src/services/wallet.service";
import { useAuthStore } from "@/src/store/authStore";
import { SignupBonusPopupContent } from "@/src/types/signupBonus";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { usePathname } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import Svg, { Defs, RadialGradient, Rect, Stop } from "react-native-svg";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const BONUS_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const CARD_WIDTH = SCREEN_W - 48; // matches outer Pressable's paddingHorizontal: 24

interface BonusData {
  wallet: number;
  coins: number;
}

const BADGE_ICON_BG = ["#FDF5FF", "#FFF8EC", "#E9F5FF"];

// Badge icons are always remote URLs from the CMS -- no local fallback.
const BadgeIcon = ({ icon }: { icon: string }) => (
  <Image
    source={{ uri: icon }}
    style={{ width: 16, height: 16 }}
    resizeMode="contain"
  />
);

const BenefitBadges = ({
  badges,
  colors = ["#FDF5FF", "#F3F9FF"],
}: {
  badges: { icon: React.ReactNode; label: string; description: string }[];
  colors?: [string, string, ...string[]];
}) => (
  <LinearGradient
    colors={colors}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={{
      borderRadius: 8,
      marginTop: 2,
      borderWidth: 1,
      borderColor: "#919EAB33",
    }}
  >
    <View
      className="flex-row items-center"
      style={{ paddingVertical: 10, paddingHorizontal: 8 }}
    >
      {badges.map((badge, index, arr) => (
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
              {badge.icon}
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
);

interface WalletBonusPageProps {
  content?: SignupBonusPopupContent;
  bonusData: BonusData;
  hasWallet: boolean;
  hasCoins: boolean;
  onCta: () => void;
}

const WalletBonusPage: React.FC<WalletBonusPageProps> = ({
  content,
  bonusData,
  hasWallet,
  hasCoins,
  onCta,
}) => (
  <LinearGradient
    colors={["#F3F9FF", "#FDF5FF", "#F1E6FF"]}
    start={{ x: 0, y: 1 }}
    end={{ x: 1, y: 0 }}
    style={{ width: CARD_WIDTH }}
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
      <Text className="font-medium text-[#222222]" style={{ fontSize: 14 }}>
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
                  style={{ fontSize: 22, lineHeight: 26, color: "#E28F1C" }}
                >
                  {bonusData.coins}
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
                  ₹{Number(bonusData.wallet).toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Feature highlights — API-driven only, no local fallback */}
      {!!content?.badges?.length && (
        <BenefitBadges
          badges={content.badges.map((b) => ({
            icon: <BadgeIcon icon={b.icon} />,
            label: b.label,
            description: b.description,
          }))}
        />
      )}
    </View>

    {/* CTA */}
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Touchable
        onPress={onCta}
        activeOpacity={0.85}
        className="w-full items-center"
        style={{
          backgroundColor: "#0F7635",
          paddingVertical: 13,
          borderRadius: 12,
        }}
      >
        <Text className="font-inter-bold text-white" style={{ fontSize: 15 }}>
          {content?.buttonText || "Start Shopping"}
        </Text>
      </Touchable>
    </View>
  </LinearGradient>
);

interface CorporateBenefitsPageProps {
  creditsBalance: number;
  onCta: () => void;
}

const DEFAULT_CORPORATE_BADGES = [
  {
    label: "Earn coins",
    description: "on every order",
    icon: HOME_IMAGES.walletOutlinePurple,
  },
  {
    label: "Use coins",
    description: "for discounts",
    icon: HOME_IMAGES.pillPink,
  },
  {
    label: "More benefits",
    description: "exclusive for you",
    icon: HOME_IMAGES.giftOutlineBlue,
  },
];

const CorporateBenefitsPage: React.FC<CorporateBenefitsPageProps> = ({
  creditsBalance,
  onCta,
}) => (
  <LinearGradient
    colors={["#FFFFFF", "#EAF2FF"]}
    start={{ x: 0, y: 1 }}
    end={{ x: 1, y: 0 }}
    style={{ width: CARD_WIDTH }}
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
      <Text className="font-medium text-[#222222]" style={{ fontSize: 14 }}>
        Hello!
      </Text>
      <Text
        className="font-inter-extrabold text-[#222222]"
        style={{ fontSize: 18, marginTop: 2 }}
      >
        Healthcare Benefits
      </Text>
      <Text
        className="font-inter-medium text-[#6A6A6A]"
        style={{ fontSize: 12, marginTop: 3 }}
      >
        Healthcare benefits made simple
      </Text>

      <Svg
        width={200}
        height={200}
        style={{ position: "absolute", top: -50, right: -70 }}
      >
        <Defs>
          <RadialGradient id="corpGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#BFDBFE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={200} height={200} fill="url(#corpGlow)" />
      </Svg>

      <Image
        source={HOME_IMAGES.corporateBenefits}
        style={{
          position: "absolute",
          top: 6,
          right: 10,
          width: 110,
          height: 90,
        }}
        resizeMode="contain"
      />
    </View>

    {/* Corporate wallet card */}
    <View
      style={{
        marginHorizontal: 14,
        marginTop: 8,
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
        Your Corporate Wallet
      </Text>

      <View className="flex-row" style={{ gap: 10, marginBottom: 12 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#F1F5FE",
            borderRadius: 8,
            padding: 10,
            borderWidth: 1,
            borderColor: "#E7EFFF",
          }}
        >
          <View className="flex-row items-center">
            <View>
              <Image
                source={HOME_IMAGES.taxBuilding}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text
                className="font-inter-medium text-[#222222]"
                style={{ fontSize: 12, letterSpacing: 1 }}
              >
                CREDITS
              </Text>
              <Text
                className="font-inter-extrabold"
                style={{ fontSize: 22, lineHeight: 26, color: "#0047CC" }}
              >
                ₹{Number(creditsBalance).toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            backgroundColor: "#F3FFF7",
            borderRadius: 8,
            padding: 10,
            borderWidth: 1,
            borderColor: "#D8FFE6",
          }}
        >
          <View className="flex-row items-center">
            <View>
              <Image
                source={HOME_IMAGES.giftBoxGreen}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <Text
                className="font-inter-medium text-[#222222]"
                style={{ fontSize: 12, letterSpacing: 1 }}
              >
                REDEEM
              </Text>
              <Text
                className="font-inter-bold text-[#6A6A6A]"
                style={{ fontSize: 10, lineHeight: 12, marginTop: 2 }}
                numberOfLines={2}
              >
                Order medicines with your credits
              </Text>
            </View>
          </View>
        </View>
      </View>

      <BenefitBadges
        colors={["#FFFFFF", "#FFFFFF"]}
        badges={DEFAULT_CORPORATE_BADGES.map((b) => ({
          icon: (
            <Image
              source={b.icon}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          ),
          label: b.label,
          description: b.description,
        }))}
      />
    </View>

    {/* CTA */}
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <Touchable
        onPress={onCta}
        activeOpacity={0.85}
        className="w-full items-center"
        style={{
          backgroundColor: "#1D4ED8",
          paddingVertical: 13,
          borderRadius: 12,
        }}
      >
        <Text className="font-inter-bold text-white" style={{ fontSize: 15 }}>
          Start Shopping
        </Text>
      </Touchable>
    </View>
  </LinearGradient>
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
  const { data: content } = useWebsiteContent("signup_bonus_popup") as {
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
  // TEMP: hardcoded for design preview — wire up to real corporate credits
  // balance (useWalletBalance().balance.corporateCredits) once confirmed.
  const [corporateCredits] = useState<number>(testMode ? 2500 : 0);
  const [showConfetti, setShowConfetti] = useState(testMode);
  const confettiRef = useRef<any>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const progressShared = useSharedValue(0);
  // Measured from real page content instead of a guessed constant, so the
  // card always fits whichever page is tallest with no dead space.
  const [pageHeight, setPageHeight] = useState(0);

  // Loop/autoplay state. isInteractingRef is a ref (not state) on purpose —
  // flagging a drag must never trigger a re-render, since that's what made
  // the swipe feel disconnected from the finger last time.
  const [activePageIndex, setActivePageIndex] = useState(1);
  const isInteractingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentScrollX = useRef(CARD_WIDTH);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      progressShared.value = (event.contentOffset.x - CARD_WIDTH) / CARD_WIDTH;
    },
  });

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

  const hasWallet = !!bonusData && bonusData.wallet > 0;
  const hasCoins = !!bonusData && bonusData.coins > 0;
  const hasCorporateCredits = corporateCredits > 0;

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
  }, [bonusData, hasWallet, hasCoins, hasCorporateCredits, corporateCredits, content, handleClose]);

  const isLooping = pages.length === 2;
  // [dummy copy of page B, real A, real B, dummy copy of page A] — same
  // infinite-loop padding trick as FloatingBannersCarousel.
  const slides = useMemo(
    () => (isLooping ? [pages[1], pages[0], pages[1], pages[0]] : pages),
    [isLooping, pages],
  );

  const startAutoplay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isLooping && isOpen && !isInteractingRef.current) {
      timerRef.current = setInterval(() => {
        // Re-checked at fire time (not just at schedule time) so a timer
        // queued just before a touch-down never fights the manual drag.
        if (isInteractingRef.current) return;
        setActivePageIndex((prev) => (prev === 2 ? 1 : 2));
      }, 4000);
    }
  }, [isLooping, isOpen]);

  const stopAutoplay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!(isLooping && isOpen)) {
      stopAutoplay();
      return;
    }
    // Delay the first auto-advance past the 5s confetti duration so it
    // never auto-swipes away from the wallet card mid-celebration, before
    // the user has even had a chance to read it.
    const initialDelay = setTimeout(startAutoplay, 5500);
    return () => {
      clearTimeout(initialDelay);
      stopAutoplay();
    };
  }, [isLooping, isOpen, startAutoplay, stopAutoplay]);

  useEffect(() => {
    if (!isLooping) return;
    const targetX = activePageIndex * CARD_WIDTH;
    if (Math.abs(currentScrollX.current - targetX) > 5) {
      scrollViewRef.current?.scrollTo({ x: targetX, animated: true });
      currentScrollX.current = targetX;
    }
  }, [activePageIndex, isLooping]);

  // Jump straight to the first real page (index 1) once the modal is visible
  // — without this the ScrollView starts on the leading dummy at index 0.
  useEffect(() => {
    if (isLooping && isOpen) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ x: CARD_WIDTH, animated: false });
      });
      currentScrollX.current = CARD_WIDTH;
      setActivePageIndex(1);
    }
  }, [isLooping, isOpen]);

  const handleScrollEnd = (offsetX: number) => {
    if (!isLooping) return;
    let pageIndex = Math.round(offsetX / CARD_WIDTH);

    if (pageIndex === 0) {
      // Landed on the leading dummy (copy of real page 2) — snap forward.
      pageIndex = 2;
      scrollViewRef.current?.scrollTo({ x: 2 * CARD_WIDTH, animated: false });
      currentScrollX.current = 2 * CARD_WIDTH;
    } else if (pageIndex === 3) {
      // Landed on the trailing dummy (copy of real page 1) — snap back.
      pageIndex = 1;
      scrollViewRef.current?.scrollTo({ x: 1 * CARD_WIDTH, animated: false });
      currentScrollX.current = 1 * CARD_WIDTH;
    } else {
      currentScrollX.current = pageIndex * CARD_WIDTH;
    }

    setActivePageIndex(pageIndex);
    startAutoplay();
  };

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
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              width: CARD_WIDTH,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#fff",
            }}
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
                onScrollBeginDrag={() => {
                  isInteractingRef.current = true;
                  stopAutoplay();
                }}
                onScrollEndDrag={(e) => {
                  isInteractingRef.current = false;
                  handleScrollEnd(e.nativeEvent.contentOffset.x);
                }}
                onMomentumScrollEnd={(e) => {
                  isInteractingRef.current = false;
                  handleScrollEnd(e.nativeEvent.contentOffset.x);
                }}
                style={{ width: CARD_WIDTH, height: pageHeight || undefined }}
                contentContainerStyle={{ width: CARD_WIDTH * slides.length }}
              >
                {slides.map((page, i) => (
                  <View
                    key={i}
                    style={{ width: CARD_WIDTH, justifyContent: "flex-start" }}
                    onLayout={(e) => {
                      const height = e.nativeEvent.layout.height;
                      setPageHeight((h) => Math.max(h, height));
                    }}
                  >
                    {page}
                  </View>
                ))}
              </Animated.ScrollView>
            </View>

            {pages.length > 1 && (
              <View
                className="flex-row justify-center items-center gap-x-1.5"
                style={{ paddingTop: 2, paddingBottom: 8 }}
              >
                {pages.map((_, i) => (
                  <CarouselDot
                    key={i}
                    index={i}
                    progress={progressShared}
                    total={pages.length}
                  />
                ))}
              </View>
            )}
          </View>
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
