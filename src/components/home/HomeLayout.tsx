import {
  BannerCarousel,
  FloatingBannersCarousel,
  FrequentSubstitutes,
  HealthEssentials,
  HeroBanner,
  HomeFooter,
  HomeHeader,
  LocationBottomSheet,
  QuickActions,
  SearchBar,
  ShopByCategories,
  SmartSubstitution,
  WhyFamiliesTrustUs,
} from "@/src/components/home/sections";
import { TabBarFadeGradient } from "@/src/components/navigation/TabBarFadeGradient";
import { Touchable } from "@/src/components/ui/Touchable";
import { DELIVERY_LOCATION, QUICK_ACTIONS } from "@/src/constants/data";
import { icons } from "@/src/constants/icons";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useCart } from "@/src/hooks/queries/useCart";
import { useFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useFeaturedSubcategories } from "@/src/hooks/queries/useFeaturedSubcategories";
import { useHome } from "@/src/hooks/queries/useHome";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useContactActions } from "@/src/hooks/ui/useContactActions";
import { useHomeScroll } from "@/src/hooks/ui/useHomeScroll";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useNav } from "@/src/hooks/useNav";
import { useAuthStore } from "@/src/store/authStore";
import { useLocationStore } from "@/src/store/locationStore";
import { useUIStore } from "@/src/store/uiStore";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  DeviceEventEmitter,
  Platform,
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const easeOut = Easing.out(Easing.cubic);
const EMPTY_BANNERS: NonNullable<
  ReturnType<typeof useHome>["appContent"]
>["banners"] = [];

function useSlideUp(delayMs: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  useEffect(() => {
    opacity.value = withDelay(
      delayMs,
      withTiming(1, { duration: 480, easing: easeOut }),
    );
    translateY.value = withDelay(
      delayMs,
      withTiming(0, { duration: 480, easing: easeOut }),
    );
  }, []);
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}

export const HomeLayout: React.FC = () => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const { width, height } = useWindowDimensions();

  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [carouselY, setCarouselY] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const currentScrollY = useRef(0);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("home-scroll-to-top", () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  const searchBarAnim = useSlideUp(350);
  const quickActionsAnim = useSlideUp(500);

  const { isAuthenticated } = useAuthStore();
  const { isTabBarVisible, setTabBarVisible, setUploadButtonCollapsed } =
    useUIStore();
  const { totalItems } = useCart();
  const { hasPendingPrescription } = usePrescriptionBanner();
  const hasFloatingBanner = totalItems > 0 || hasPendingPrescription;
  const {
    tabs,
    cards,
    appContent,
    isLoading: isHomeLoading,
    refetch: refetchHome,
  } = useHome();
  const {
    products: featuredProducts,
    isLoading: isFeaturedLoading,
    refetch: refetchFeatured,
  } = useFeaturedMedicines();
  const {
    subcategories: featuredSubcategories,
    isLoading: isSubcategoriesLoading,
    refetch: refetchSubcategories,
  } = useFeaturedSubcategories();
  const { addresses, refetch: refetchAddresses } = useAddress();
  const { data: frequentlyOrdered = [], refetch: refetchFrequentlyOrdered } =
    useFrequentlyOrdered({ limit: 5 });
  const { callSupport, whatsappOrder } = useContactActions();
  const {
    location,
    pincode: locationPincode,
    setLocation,
    clearLocation,
    reopenLocationSheet,
    setReopenLocationSheet,
  } = useLocationStore();

  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      const t = setTimeout(() => {
        setTabBarVisible(true);
        setUploadButtonCollapsed(false);
      }, 30);
      if (reopenLocationSheet) {
        setIsLocationSheetVisible(true);
        setReopenLocationSheet(false);
      }
      return () => {
        setIsScreenFocused(false);
        clearTimeout(t);
      };
    }, [reopenLocationSheet]),
  );
  const heroHeightRef = useRef(0);
  const heroHeightShared = useSharedValue(0);
  const { scrollY, handleScroll, stickySearchVisible } =
    useHomeScroll(heroHeightRef);
  const { safeAreaBgStyle } = useScrollStatusBar(scrollY, heroHeightShared);
  const adjustedBottoms =
    Platform.OS === "android"
      ? adjustedBottom > 24
        ? adjustedBottom - 8
        : adjustedBottom
      : adjustedBottom;
  const TAB_BAR_HEIGHT = 75 + adjustedBottom;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      setLocation(
        {
          label: defaultAddr.label,
          city: defaultAddr.city || defaultAddr.line2 || "",
        },
        { addressId: defaultAddr.id, pincode: defaultAddr.pincode },
      );
    } else {
      clearLocation();
    }
  }, [addresses, isAuthenticated]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchHome(),
        refetchFeatured(),
        refetchSubcategories(),
        refetchAddresses(),
        refetchFrequentlyOrdered(),
        new Promise<void>((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch (e) {
      console.error("[Home] Refresh failed:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCombinedScroll = (e: any) => {
    handleScroll(e);
    const y: number = e.nativeEvent?.contentOffset?.y ?? 0;
    currentScrollY.current = y;
    setIsBannerVisible(
      y + height > carouselY && y < carouselY + carouselHeight,
    );
  };

  // Keep visibility in sync when layout coordinates are measured
  useEffect(() => {
    const y = currentScrollY.current;
    setIsBannerVisible(
      y + height > carouselY && y < carouselY + carouselHeight,
    );
  }, [carouselY, carouselHeight, height]);

  const handleQuickAction = (id: string) => {
    if (id === "upload") router.push("/upload");
    else if (id === "substitute") router.push("/search");
    else if (id === "call") callSupport();
    else if (id === "whatsapp") whatsappOrder();
  };

  const handleCardPress = (id: string) => {
    const card = cards.find((c) => c.id === id);
    router.push({
      pathname: "/category/[id]",
      params: {
        id,
        slug: card?.slug,
        familySlug: card?.familySlug,
        name: card?.label.replace("\n", " "),
      },
    });
  };

  const handleProductPress = (id: string) => {
    router.push({ pathname: "/product/[id]", params: { id } });
  };

  return (
    <View className="flex-1 bg-white">
      {/* Invisible while the hero (with its own gradient extending up behind
          the status bar) is still in view — avoids double-painting/seaming
          against it. Snaps to solid white only once the hero has scrolled
          past, matching the hero gradient's own end color at that point. */}
      <Animated.View
        style={[safeAreaBgStyle, { backgroundColor: "#FFFFFF" }]}
      />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        style={{ backgroundColor: "#FFFFFF" }}
        contentContainerStyle={{ backgroundColor: "#FFFFFF", flexGrow: 1 }}
        onScroll={handleCombinedScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#36B37E"
            colors={["#36B37E"]}
            progressBackgroundColor="#FFFFFF"
            progressViewOffset={insets.top + 30}
          />
        }
      >
        {/* Hero section */}
        <View
          onLayout={(e) => {
            heroHeightRef.current = e.nativeEvent.layout.height;
            heroHeightShared.value = e.nativeEvent.layout.height;
          }}
        >
          <LinearGradient
            colors={["#DEF5B0", "#EAF9D1", "#F6FDF0", "#FFFFFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              top: -insets.top,
              left: 0,
              right: 0,
              height: 350 + insets.top,
            }}
          />
          <HomeHeader
            location={
              location
                ? { ...location, pincode: locationPincode ?? undefined }
                : DELIVERY_LOCATION
            }
            onPressLocation={() => setIsLocationSheetVisible(true)}
          />
          <HeroBanner content={appContent?.hero} isLoading={isHomeLoading} />
        </View>

        {/* Child 1: Sticky SearchBar Container */}
        <View
          style={{
            marginTop: -(insets.top + 8) - 30,
            paddingTop: insets.top + 8,
            paddingBottom: 14,
            paddingHorizontal: 36,
            backgroundColor: "transparent",
          }}
        >
          <Animated.View style={searchBarAnim}>
            <SearchBar
              placeholder="Search medicines & health products"
              useHomeCycler
              onPress={() => router.push("/search")}
              rightSlot={
                <Touchable
                  onPress={() => router.push("/upload")}
                  className="border-l border-[#919EAB33] pl-3 ml-1"
                >
                  <icons.uploadActive width={22} height={22} />
                </Touchable>
              }
            />
          </Animated.View>
        </View>

        {/* Main content */}
        <View
          className="bg-white flex-1"
          style={{
            paddingBottom: TAB_BAR_HEIGHT + (hasFloatingBanner ? 75 : 0),
          }}
        >
          <Animated.View style={quickActionsAnim}>
            <QuickActions
              actions={QUICK_ACTIONS}
              onActionPress={handleQuickAction}
            />
          </Animated.View>

          <ShopByCategories
            tabs={tabs}
            cards={cards}
            onCardPress={handleCardPress}
            isLoading={isHomeLoading}
          />
          <View
            onLayout={(e) => {
              setCarouselY(e.nativeEvent.layout.y);
              setCarouselHeight(e.nativeEvent.layout.height);
            }}
          >
            <BannerCarousel
              banners={appContent?.banners ?? EMPTY_BANNERS}
              categories={cards}
              isLoading={isHomeLoading}
              isVisible={isBannerVisible && isScreenFocused}
            />
          </View>
          <SmartSubstitution
            products={featuredProducts}
            isLoading={isFeaturedLoading}
            onProductPress={handleProductPress}
          />

          {frequentlyOrdered.length > 0 && (
            <FrequentSubstitutes
              substitutes={frequentlyOrdered}
              onProductPress={handleProductPress}
              onViewAll={() => router.push("/profile/orders/frequent" as any)}
            />
          )}

          <HealthEssentials
            subcategories={featuredSubcategories}
            isLoading={isSubcategoriesLoading}
            onProductPress={handleProductPress}
          />

          <WhyFamiliesTrustUs
            promise={appContent?.promise}
            isLoading={isHomeLoading}
          />

          <HomeFooter appContent={appContent} isLoading={isHomeLoading} />
        </View>
      </ScrollView>

      <LocationBottomSheet
        isVisible={isLocationSheetVisible}
        onClose={() => setIsLocationSheetVisible(false)}
      />

      <TabBarFadeGradient />

      <FloatingBannersCarousel isFocused={isScreenFocused} />
    </View>
  );
};
