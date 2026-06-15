import {
  BannerCarousel,
  FrequentSubstitutes,
  HeroBanner,
  HomeFooter,
  HomeHeader,
  QuickActions,
  LocationBottomSheet,
  SearchBar,
  ShopByCategories,
  SmartSubstitution,
  WhyFamiliesTrustUs,
  HealthEssentials,
  FloatingBannersCarousel,
} from "@/src/components/home/sections";
import {
  DELIVERY_LOCATION,
  QUICK_ACTIONS,
} from "@/src/constants/data";
import { icons } from "@/src/constants/icons";
import { useCart } from "@/src/hooks/queries/useCart";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useFeaturedMedicines } from "@/src/hooks/queries/useFeaturedMedicines";
import { useFeaturedSubcategories } from "@/src/hooks/queries/useFeaturedSubcategories";
import { useHome } from "@/src/hooks/queries/useHome";
import { useFrequentlyOrdered } from "@/src/hooks/queries/useOrders";
import { useContactActions } from "@/src/hooks/ui/useContactActions";
import { useHomeScroll } from "@/src/hooks/ui/useHomeScroll";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useLocationStore } from "@/src/store/locationStore";
import { useAuthStore } from "@/src/store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useNav } from "@/src/hooks/useNav";
import { useFocusEffect } from "expo-router";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";

const easeOut = Easing.out(Easing.cubic);

function useSlideUp(delayMs: number) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  useEffect(() => {
    opacity.value = withDelay(delayMs, withTiming(1, { duration: 480, easing: easeOut }));
    translateY.value = withDelay(delayMs, withTiming(0, { duration: 480, easing: easeOut }));
  }, []);
  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
}
import { useUIStore } from "@/src/store/uiStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";

export const HomeLayout: React.FC = () => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const [carouselY, setCarouselY] = useState(0);
  const [carouselHeight, setCarouselHeight] = useState(0);
  const currentScrollY = useRef(0);

  const searchBarAnim  = useSlideUp(350);
  const quickActionsAnim = useSlideUp(500);

  const { isAuthenticated } = useAuthStore();
  const { isTabBarVisible, setTabBarVisible, setUploadButtonCollapsed } = useUIStore();
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
  const { data: frequentlyOrdered = [], refetch: refetchFrequentlyOrdered } = useFrequentlyOrdered({ limit: 5 });
  const { callSupport, whatsappOrder } = useContactActions();
  const { location, setLocation, clearLocation, reopenLocationSheet, setReopenLocationSheet } = useLocationStore();

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
    }, [reopenLocationSheet])
  );
  const heroHeightRef = useRef(0);
  const { scrollY, handleScroll, stickySearchVisible } = useHomeScroll(heroHeightRef);
  const { safeAreaBgStyle } = useScrollStatusBar(scrollY);
  const TAB_BAR_HEIGHT = 75 + insets.bottom;

  useEffect(() => {
    if (!isAuthenticated) return;
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      setLocation(
        { label: defaultAddr.label, city: defaultAddr.city || defaultAddr.line2 || '' },
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
        new Promise<void>(resolve => setTimeout(resolve, 800)),
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
    setIsBannerVisible(y + height > carouselY && y < carouselY + carouselHeight);
  };

  // Keep visibility in sync when layout coordinates are measured
  useEffect(() => {
    const y = currentScrollY.current;
    setIsBannerVisible(y + height > carouselY && y < carouselY + carouselHeight);
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
      <Animated.View style={safeAreaBgStyle}>
        <LinearGradient
          colors={["#DEF5B0", "#EAF9D1", "#F6FDF0"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        onScroll={handleCombinedScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#36B37E"
            colors={["#36B37E"]}
            progressViewOffset={insets.top + 30}
          />
        }
      >
        {/* Hero section */}
        <View
          onLayout={(e) => {
            heroHeightRef.current = e.nativeEvent.layout.height;
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
            location={location ?? DELIVERY_LOCATION}
            onPressLocation={() => setIsLocationSheetVisible(true)}
          />
          <HeroBanner content={appContent?.hero} isLoading={isHomeLoading} />
        </View>

        {/* Child 1: Sticky SearchBar Container */}
        <View
          style={{
            marginTop: -(insets.top + 8) - 40,
            paddingTop: insets.top + 8,
            paddingBottom: 16,
            paddingHorizontal: 16,
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
          style={{ paddingBottom: TAB_BAR_HEIGHT + (hasFloatingBanner ? 75 : 0) }}
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
              banners={appContent?.banners || []}
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

      <FloatingBannersCarousel isFocused={isScreenFocused} />
    </View>
  );
};
