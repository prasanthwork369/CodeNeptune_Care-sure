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
import { useHomeOnboarding } from "@/src/hooks/home/useHomeOnboarding";
import { useHomeScroll } from "@/src/hooks/home/useHomeScroll";
import { useScrollToTop } from "@/src/hooks/home/useScrollToTop";
import { useCart } from "@/src/hooks/queries/useCart";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useContactActions } from "@/src/hooks/ui/useContactActions";
import { usePrescriptionBanner } from "@/src/hooks/ui/usePrescriptionBanner";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useSlideUp } from "@/src/hooks/ui/useSlideUp";
import { useNav } from "@/src/hooks/useNav";
import { useLocationStore } from "@/src/store/locationStore";
import { useUIStore } from "@/src/store/uiStore";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  View,
} from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EMPTY_BANNERS: NonNullable<
  ReturnType<typeof useHomeData>["appContent"]
>["banners"] = [];

type HomeSectionId =
  | "hero"
  | "search"
  | "quickActions"
  | "categories"
  | "banner"
  | "smartSubstitution"
  | "frequent"
  | "healthEssentials"
  | "trust"
  | "footer";

type HomeSection = { id: HomeSectionId };

export const HomeLayout: React.FC = () => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();

  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const listRef = useRef<FlatList<HomeSection>>(null);

  useScrollToTop(listRef);

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

  // Sequential onboarding: location → notification → unlock signup popup.
  useHomeOnboarding();

  const [isScreenFocused, setIsScreenFocused] = useState(true);
  const [isFeedScrolling, setIsFeedScrolling] = useState(false);

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
    }, [
      reopenLocationSheet,
      setReopenLocationSheet,
      setTabBarVisible,
      setUploadButtonCollapsed,
    ]),
  );
  const heroHeightShared = useSharedValue(0);
  const scrollY = useSharedValue(0);
  const { handleScroll, stickySearchVisible } = useHomeScroll(
    scrollY,
    heroHeightShared,
  );
  const { safeAreaBgStyle } = useScrollStatusBar(scrollY, heroHeightShared);
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

  const handleScrollStart = useCallback(() => {
    setIsFeedScrolling(true);
  }, []);

  const handleScrollStop = useCallback(() => {
    setIsFeedScrolling(false);
  }, []);

  const sections = useMemo<HomeSection[]>(() => {
    const feedSections: HomeSection[] = [
      { id: "hero" },
      { id: "search" },
      { id: "quickActions" },
      { id: "categories" },
      { id: "banner" },
      { id: "smartSubstitution" },
    ];

    if (frequentlyOrdered.length > 0) {
      feedSections.push({ id: "frequent" });
    }

    feedSections.push(
      { id: "healthEssentials" },
      { id: "trust" },
      { id: "footer" },
    );

    return feedSections;
  }, [frequentlyOrdered.length]);

  const renderSection: ListRenderItem<HomeSection> = useCallback(
    ({ item }) => {
      switch (item.id) {
        case "hero":
          return (
            <View
              onLayout={(e) => {
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
              <HeroBanner
                content={appContent?.hero}
                isLoading={isHomeLoading}
                motionEnabled={!isFeedScrolling}
              />
            </View>
          );

        case "search":
          return (
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
          );

        case "quickActions":
          return (
            <Animated.View
              style={[quickActionsAnim, { marginTop: exactScale(5) }]}
            >
              <QuickActions
                actions={QUICK_ACTIONS}
                onActionPress={handleQuickAction}
              />
            </Animated.View>
          );

        case "categories":
          return (
            <View style={{ marginTop: exactScale(5) }}>
              <ShopByCategories
                tabs={tabs}
                cards={cards}
                onCardPress={handleCardPress}
                isLoading={isHomeLoading}
              />
            </View>
          );

        case "banner":
          return (
            <View style={{ marginTop: exactScale(20) }}>
              <BannerCarousel
                banners={appContent?.banners ?? EMPTY_BANNERS}
                categories={cards}
                isLoading={isHomeLoading}
                isVisible={isScreenFocused && !isFeedScrolling}
              />
            </View>
          );

        case "smartSubstitution":
          return (
            <View style={{ marginTop: exactScale(20) }}>
              <SmartSubstitution
                products={featuredProducts}
                isLoading={isFeaturedLoading}
                onProductPress={handleProductPress}
              />
            </View>
          );

        case "frequent":
          return (
            <View style={{ marginTop: exactScale(10) }}>
              <FrequentSubstitutes
                substitutes={frequentlyOrdered}
                onProductPress={handleProductPress}
                onViewAll={handleViewAllFrequent}
              />
            </View>
          );

        case "healthEssentials":
          return (
            <View style={{ marginTop: exactScale(10) }}>
              <HealthEssentials
                subcategories={featuredSubcategories}
                isLoading={isSubcategoriesLoading}
                onProductPress={handleProductPress}
              />
            </View>
          );

        case "trust":
          return (
            <View style={{ marginTop: exactScale(10) }}>
              <WhyFamiliesTrustUs
                promise={appContent?.promise}
                isLoading={isHomeLoading}
              />
            </View>
          );

        case "footer":
          return (
            <View style={{ marginTop: exactScale(20) }}>
              <HomeFooter appContent={appContent} isLoading={isHomeLoading} />
            </View>
          );

        default:
          return null;
      }
    },
    [
      appContent,
      cards,
      featuredProducts,
      featuredSubcategories,
      frequentlyOrdered,
      handleCardPress,
      handleProductPress,
      handleQuickAction,
      handleViewAllFrequent,
      heroHeightShared,
      insets.top,
      isFeedScrolling,
      isFeaturedLoading,
      isHomeLoading,
      isScreenFocused,
      isSubcategoriesLoading,
      location,
      locationPincode,
      quickActionsAnim,
      router,
      searchBarAnim,
      tabs,
    ],
  );

  return (
    <View className="flex-1 bg-white">
      {/* Invisible while the hero (with its own gradient extending up behind
          the status bar) is still in view — avoids double-painting/seaming
          against it. Snaps to solid white only once the hero has scrolled
          past, matching the hero gradient's own end color at that point. */}
      <Animated.View
        style={[safeAreaBgStyle, { backgroundColor: "#FFFFFF" }]}
      />
      <Animated.FlatList
        ref={listRef as any}
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        bounces
        alwaysBounceVertical={false}
        overScrollMode="auto"
        decelerationRate="normal"
        nestedScrollEnabled
        initialNumToRender={4}
        maxToRenderPerBatch={3}
        windowSize={7}
        updateCellsBatchingPeriod={32}
        style={{ backgroundColor: "#FFFFFF" }}
        contentContainerStyle={{
          backgroundColor: "#FFFFFF",
          paddingBottom:
            TAB_BAR_HEIGHT + (hasFloatingBanner ? exactScale(75) : 0),
        }}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollBegin={handleScrollStart}
        onScrollEndDrag={handleScrollStop}
        onMomentumScrollEnd={handleScrollStop}
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
      />

      <StickySearchHeader
        visible={stickySearchVisible}
        onPressSearch={() => router.push("/search")}
        onPressUpload={() => router.push("/upload")}
      />

      <LocationBottomSheet
        isVisible={isLocationSheetVisible}
        onClose={() => setIsLocationSheetVisible(false)}
      />

      <FloatingBannersCarousel isFocused={isScreenFocused && !isFeedScrolling} />
    </View>
  );
};
