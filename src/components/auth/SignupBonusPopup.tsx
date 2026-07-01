import { CarouselDot } from "@/src/components/animations/carousel";
import { Touchable } from "@/src/components/ui/Touchable";
import { ANIMATIONS, HOME_IMAGES } from "@/src/constants/images";
import { useCartWalletSettings } from "@/src/hooks/queries/useSettings";
import { useWebsiteContent } from "@/src/hooks/queries/useWebsiteContent";
import { useWalletBalance } from "@/src/hooks/queries/useWallet";
import { QUERY_KEYS } from "@/src/lib/react-query/queryKeys";
import { walletService } from "@/src/services/wallet.service";
import { useAuthStore } from "@/src/store/authStore";
import { SignupBonusPopupContent } from "@/src/types/signupBonus";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
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
const CARD_WIDTH = exactScale(342);

interface BonusData {
  wallet: number;
  coins: number;
}

const BADGE_ICON_BG = ["#FDF5FF", "#FFF8EC", "#E9F5FF"];

// Badge icons are always remote URLs from the CMS -- no local fallback.
const BadgeIcon = ({ icon }: { icon: string }) => (
  <Image
    source={{ uri: icon }}
    style={{ width: exactScale(16), height: exactScale(16) }}
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
      borderRadius: exactScale(8),
      marginTop: exactScale(2),
      borderWidth: 1,
      borderColor: "#919EAB33",
    }}
  >
    <View
      className="flex-row items-center"
      style={{ paddingVertical: exactScale(10), paddingHorizontal: exactScale(8) }}
    >
      {badges.map((badge, index, arr) => (
        <React.Fragment key={index}>
          <View className="flex-1 items-center">
            <View
              style={{
                width: exactScale(28),
                height: exactScale(28),
                borderRadius: exactScale(10),
                backgroundColor: BADGE_ICON_BG[index % BADGE_ICON_BG.length],
                alignItems: "center",
                justifyContent: "center",
                marginBottom: exactScale(4),
              }}
            >
              {badge.icon}
            </View>
            <Text
              className="font-inter-semibold text-[#222222] text-center"
              style={{ fontSize: moderateScale(11) }}
              numberOfLines={1}
            >
              {badge.label}
            </Text>
            <Text
              className="font-inter-medium text-[#6A6A6A] text-center"
              style={{ fontSize: moderateScale(9), marginTop: exactScale(1) }}
              numberOfLines={1}
            >
              {badge.description}
            </Text>
          </View>

          {index < arr.length - 1 && (
            <View
              style={{
                width: 1,
                height: exactScale(32),
                backgroundColor: "#919EAB33",
                marginHorizontal: exactScale(6),
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
        paddingHorizontal: exactScale(20),
        paddingTop: exactScale(18),
        paddingBottom: exactScale(6),
        minHeight: exactScale(76),
      }}
    >
      <Text className="font-medium text-[#222222]" style={{ fontSize: moderateScale(14) }}>
        {content?.greeting || "Hi there!"}
      </Text>
      <Text
        className="font-inter-extrabold text-[#222222]"
        style={{ fontSize: moderateScale(19), marginTop: exactScale(2) }}
      >
        {content?.title || "Welcome to CareSure"}
      </Text>
      <Text
        className="font-inter text-[#6A6A6A]"
        style={{ fontSize: moderateScale(12), marginTop: exactScale(3) }}
      >
        {content?.subtitle || "You've got rewards waiting for you"}
      </Text>

      <Svg
        width={exactScale(200)}
        height={exactScale(200)}
        style={{ position: "absolute", top: exactScale(-50), right: exactScale(-70) }}
      >
        <Defs>
          <RadialGradient id="giftGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#E9D5FF" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#E9D5FF" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={exactScale(200)} height={exactScale(200)} fill="url(#giftGlow)" />
      </Svg>

      {!!content?.giftImage && (
        <Image
          source={{ uri: content.giftImage }}
          style={{
            position: "absolute",
            top: exactScale(-6),
            right: exactScale(-8),
            width: exactScale(145),
            height: exactScale(115),
          }}
          resizeMode="contain"
        />
      )}
    </View>

    {/* Wallet card */}
    <View
      style={{
        marginHorizontal: exactScale(16),
        marginTop: exactScale(4),
        marginBottom: exactScale(12),
        backgroundColor: "#fff",
        borderRadius: exactScale(20),
        padding: exactScale(14),
        borderWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <Text
        className="font-inter-semibold text-[#222222]"
        style={{ fontSize: moderateScale(14), marginBottom: exactScale(10) }}
      >
        {content?.walletTitle || "Your Wallet"}
      </Text>

      {content?.coinImage && (
        <Image
          source={{ uri: content.coinImage }}
          style={{
            position: "absolute",
            top: exactScale(-28),
            right: exactScale(14),
            width: exactScale(56),
            height: exactScale(56),
          }}
          resizeMode="contain"
        />
      )}

      <View className="flex-row" style={{ gap: exactScale(10), marginBottom: exactScale(12) }}>
        {hasCoins && (
          <View
            style={{
              flex: 1,
              backgroundColor: "#FFF8EC",
              borderRadius: exactScale(14),
              padding: exactScale(12),
              borderWidth: 1,
              borderColor: "#FFE9BF",
            }}
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: exactScale(36),
                  height: exactScale(36),
                  borderRadius: exactScale(18),
                  backgroundColor: "#FFE9BF",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: exactScale(8),
                }}
              >
                {!!content?.coinsIcon && (
                  <Image
                    source={{ uri: content.coinsIcon }}
                    style={{ width: exactScale(38), height: exactScale(38) }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View>
                <Text
                  className="font-inter-medium text-[#222222]"
                  style={{ fontSize: moderateScale(10), letterSpacing: 1 }}
                >
                  {(content?.coinsLabel || "COINS").toUpperCase()}
                </Text>
                <Text
                  className="font-inter-extrabold "
                  style={{ fontSize: moderateScale(22), lineHeight: moderateScale(26), color: "#E28F1C" }}
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
              borderRadius: exactScale(14),
              padding: exactScale(12),
              borderWidth: 1,
              borderColor: "#A6F0C0",
            }}
          >
            <View className="flex-row items-center">
              <View
                style={{
                  width: exactScale(36),
                  height: exactScale(36),
                  borderRadius: exactScale(16),
                  backgroundColor: "#D8FFE6",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: exactScale(8),
                }}
              >
                {!!content?.balanceIcon && (
                  <Image
                    source={{ uri: content.balanceIcon }}
                    style={{ width: exactScale(38), height: exactScale(38) }}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View>
                <Text
                  className="font-inter-medium text-[#222222]"
                  style={{ fontSize: moderateScale(10), letterSpacing: 1 }}
                >
                  {(content?.balanceLabel || "BALANCE").toUpperCase()}
                </Text>
                <Text
                  className="font-inter-bold text-[#0F7635]"
                  style={{ fontSize: moderateScale(22), lineHeight: moderateScale(26) }}
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
    <View style={{ paddingHorizontal: exactScale(16), paddingBottom: exactScale(16) }}>
      <Touchable
        onPress={onCta}
        activeOpacity={0.85}
        className="w-full items-center"
        style={{
          backgroundColor: "#0F7635",
          paddingVertical: exactScale(13),
          borderRadius: exactScale(12),
        }}
      >
        <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(15) }}>
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
        paddingHorizontal: exactScale(20),
        paddingTop: exactScale(18),
        paddingBottom: exactScale(6),
        minHeight: exactScale(76),
      }}
    >
      <Text className="font-medium text-[#222222]" style={{ fontSize: moderateScale(14) }}>
        Hello!
      </Text>
      <Text
        className="font-inter-extrabold text-[#222222]"
        style={{ fontSize: moderateScale(18), marginTop: exactScale(2) }}
      >
        Healthcare Benefits
      </Text>
      <Text
        className="font-inter-medium text-[#6A6A6A]"
        style={{ fontSize: moderateScale(12), marginTop: exactScale(3) }}
      >
        Healthcare benefits made simple
      </Text>

      <Svg
        width={exactScale(200)}
        height={exactScale(200)}
        style={{ position: "absolute", top: exactScale(-50), right: exactScale(-70) }}
      >
        <Defs>
          <RadialGradient id="corpGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#BFDBFE" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="#BFDBFE" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect width={exactScale(200)} height={exactScale(200)} fill="url(#corpGlow)" />
      </Svg>

      <Image
        source={HOME_IMAGES.corporateBenefits}
        style={{
          position: "absolute",
          top: exactScale(6),
          right: exactScale(10),
          width: exactScale(110),
          height: exactScale(90),
        }}
        resizeMode="contain"
      />
    </View>

    {/* Corporate wallet card */}
    <View
      style={{
        marginHorizontal: exactScale(14),
        marginTop: exactScale(8),
        marginBottom: exactScale(12),
        backgroundColor: "#fff",
        borderRadius: exactScale(20),
        padding: exactScale(14),
        borderWidth: 1,
        borderColor: "#919EAB33",
      }}
    >
      <Text
        className="font-inter-semibold text-[#222222]"
        style={{ fontSize: moderateScale(14), marginBottom: exactScale(10) }}
      >
        Your Corporate Wallet
      </Text>

      <View className="flex-row" style={{ gap: exactScale(10), marginBottom: exactScale(12) }}>
        <View
          style={{
            flex: 1,
            backgroundColor: "#F1F5FE",
            borderRadius: exactScale(8),
            padding: exactScale(10),
            borderWidth: 1,
            borderColor: "#E7EFFF",
          }}
        >
          <View className="flex-row items-center">
            <View>
              <Image
                source={HOME_IMAGES.taxBuilding}
                style={{ width: exactScale(22), height: exactScale(22) }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: exactScale(6) }}>
              <Text
                className="font-inter-medium text-[#222222]"
                style={{ fontSize: moderateScale(12), letterSpacing: 1 }}
              >
                CREDITS
              </Text>
              <Text
                className="font-inter-extrabold"
                style={{ fontSize: moderateScale(22), lineHeight: moderateScale(26), color: "#0047CC" }}
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
            borderRadius: exactScale(8),
            padding: exactScale(10),
            borderWidth: 1,
            borderColor: "#D8FFE6",
          }}
        >
          <View className="flex-row items-center">
            <View>
              <Image
                source={HOME_IMAGES.giftBoxGreen}
                style={{ width: exactScale(22), height: exactScale(22) }}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, marginLeft: exactScale(6) }}>
              <Text
                className="font-inter-medium text-[#222222]"
                style={{ fontSize: moderateScale(12), letterSpacing: 1 }}
              >
                REDEEM
              </Text>
              <Text
                className="font-inter-bold text-[#6A6A6A]"
                style={{ fontSize: moderateScale(10), lineHeight: moderateScale(12), marginTop: exactScale(2) }}
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
              style={{ width: exactScale(18), height: exactScale(18) }}
              resizeMode="contain"
            />
          ),
          label: b.label,
          description: b.description,
        }))}
      />
    </View>

    {/* CTA */}
    <View style={{ paddingHorizontal: exactScale(16), paddingBottom: exactScale(16) }}>
      <Touchable
        onPress={onCta}
        activeOpacity={0.85}
        className="w-full items-center"
        style={{
          backgroundColor: "#1D4ED8",
          paddingVertical: exactScale(13),
          borderRadius: exactScale(12),
        }}
      >
        <Text className="font-inter-bold text-white" style={{ fontSize: moderateScale(15) }}>
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
  const { balance } = useWalletBalance();
  const corporateCredits = Number(balance?.corporateCredits || 0);
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
            paddingHorizontal: exactScale(24),
          }}
        >
          <View
            style={{
              width: CARD_WIDTH,
              borderRadius: exactScale(16),
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
                style={{ paddingTop: exactScale(2), paddingBottom: exactScale(8) }}
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
