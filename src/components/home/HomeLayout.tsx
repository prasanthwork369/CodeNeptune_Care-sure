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
  StickySearchHeader,
  WhyFamiliesTrustUs,
} from "@/src/components/home/sections";
import { BAR_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { DELIVERY_LOCATION, QUICK_ACTIONS } from "@/src/constants/data";
import { icons } from "@/src/constants/icons";
import { useHomeData } from "@/src/hooks/home/useHomeData";
import { useCart } from "@/src/hooks/queries/useCart";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useBannerVisibility } from "@/src/hooks/home/useBannerVisibility";
import { useContactActions } from "@/src/hooks/ui/useContactActions";
import { useHomeScroll } from "@/src/hooks/home/useHomeScroll";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useScrollToTop } from "@/src/hooks/home/useScrollToTop";
import { useSlideUp } from "@/src/hooks/ui/useSlideUp";
import { useNav } from "@/src/hooks/useNav";
import { useLocationStore } from "@/src/store/locationStore";
import { useUIStore } from "@/src/store/uiStore";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  RefreshControl,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EMPTY_BANNERS: NonNullable<
  ReturnType<typeof useHomeData>["appContent"]
>["banners"] = [];

export const HomeLayout: React.FC = () => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();
  const { height } = useWindowDimensions();

  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  useScrollToTop(scrollViewRef);

  const searchBarAnim = useSlideUp(350);
  const quickActionsAnim = useSlideUp(500);

  const { setTabBarVisible, setUploadButtonCollapsed } = useUIStore();
  const { totalItems } = useCart();
  const { hasPendingPrescription } = usePrescriptionBanner();
  const hasFloatingBanner = totalItems > 0 || hasPendingPrescription;
  const {
    tabs,
    cards,
    appContent,
    isHomeLoading,
    featuredProducts,
    isFeaturedLoading,
    featuredSubcategories,
    isSubcategoriesLoading,
    frequentlyOrdered,
    isRefreshing,
    onRefresh,
  } = useHomeData();
  const { callSupport, whatsappOrder } = useContactActions();
  const {
    location,
    pincode: locationPincode,
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
  const scrollY = useScrollViewOffset(scrollViewRef);
  const { handleScroll, stickySearchVisible } = useHomeScroll(
    scrollY,
    heroHeightShared,
  );
  const { safeAreaBgStyle } = useScrollStatusBar(scrollY, heroHeightShared);
  const { isBannerVisible, onCarouselLayout } = useBannerVisibility(scrollY, height);
  const TAB_BAR_HEIGHT = BAR_HEIGHT + adjustedBottom + exactScale(6);

  const handleQuickAction = useCallback(
    (id: string) => {
      if (id === "upload") router.push("/upload");
      else if (id === "substitute") router.push("/search");
      else if (id === "call") callSupport();
      else if (id === "whatsapp") whatsappOrder();
    },
    [router, callSupport, whatsappOrder],
  );

  const handleCardPress = useCallback(
    (id: string) => {
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
    },
    [router, cards],
  );

  const handleProductPress = useCallback(
    (id: string) => {
      router.push({ pathname: "/product/[id]", params: { id } });
    },
    [router],
  );

  const handleViewAllFrequent = useCallback(() => {
    router.push("/profile/orders/frequent" as any);
  }, [router]);

  return (
    <View className="flex-1 bg-white">
      {/* Invisible while the hero (with its own gradient extending up behind
          the status bar) is still in view — avoids double-painting/seaming
          against it. Snaps to solid white only once the hero has scrolled
          past, matching the hero gradient's own end color at that point. */}
      <Animated.View
        style={[safeAreaBgStyle, { backgroundColor: "#FFFFFF" }]}
      />
      <Animated.ScrollView
        ref={scrollViewRef as any}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        bounces={false}
        alwaysBounceVertical={false}
        overScrollMode="never"
        style={{ backgroundColor: "#FFFFFF" }}
        contentContainerStyle={{ backgroundColor: "#FFFFFF", flexGrow: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
              height: exactScale(350) + insets.top,
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
            marginTop: -(insets.top + exactScale(8)) - exactScale(30),
            paddingTop: insets.top + exactScale(8),
            paddingBottom: exactScale(14),
            paddingHorizontal: exactScale(36),
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
                  <icons.uploadActive
                    width={exactScale(22)}
                    height={exactScale(22)}
                  />
                </Touchable>
              }
            />
          </Animated.View>
        </View>

        {/* Main content */}
        <View
          className="bg-white flex-1"
          style={{
            paddingBottom: TAB_BAR_HEIGHT + (hasFloatingBanner ? exactScale(75) : 0),
          }}
        >
          <Animated.View style={quickActionsAnim}>
            <QuickActions
              actions={QUICK_ACTIONS}
              onActionPress={handleQuickAction}
            />
          </Animated.View>

          <View style={{ marginTop: exactScale(20) }}>
            <ShopByCategories
              tabs={tabs}
              cards={cards}
              onCardPress={handleCardPress}
              isLoading={isHomeLoading}
            />
          </View>

          <View style={{ marginTop: exactScale(20) }} onLayout={onCarouselLayout}>
            <BannerCarousel
              banners={appContent?.banners ?? EMPTY_BANNERS}
              categories={cards}
              isLoading={isHomeLoading}
              isVisible={isBannerVisible && isScreenFocused}
            />
          </View>

          <View style={{ marginTop: exactScale(20) }}>
            <SmartSubstitution
              products={featuredProducts}
              isLoading={isFeaturedLoading}
              onProductPress={handleProductPress}
            />
          </View>

          {frequentlyOrdered.length > 0 && (
            <View style={{ marginTop: exactScale(20) }}>
              <FrequentSubstitutes
                substitutes={frequentlyOrdered}
                onProductPress={handleProductPress}
                onViewAll={handleViewAllFrequent}
              />
            </View>
          )}

          <View style={{ marginTop: exactScale(20) }}>
            <HealthEssentials
              subcategories={featuredSubcategories}
              isLoading={isSubcategoriesLoading}
              onProductPress={handleProductPress}
            />
          </View>

          <View style={{ marginTop: exactScale(24) }}>
            <WhyFamiliesTrustUs
              promise={appContent?.promise}
              isLoading={isHomeLoading}
            />
          </View>

          <View style={{ marginTop: exactScale(24) }}>
            <HomeFooter appContent={appContent} isLoading={isHomeLoading} />
          </View>
        </View>
      </Animated.ScrollView>

      <StickySearchHeader
        visible={stickySearchVisible}
        onPressSearch={() => router.push("/search")}
        onPressUpload={() => router.push("/upload")}
      />

      <LocationBottomSheet
        isVisible={isLocationSheetVisible}
        onClose={() => setIsLocationSheetVisible(false)}
      />

      <FloatingBannersCarousel isFocused={isScreenFocused} />
    </View>
  );
};
