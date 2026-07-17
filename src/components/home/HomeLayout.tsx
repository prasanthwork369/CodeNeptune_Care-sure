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
import { ApiFeaturedSubcategory } from "@/src/api/category.api";
import type { CategoryCard } from "@/src/types/home";
import { BAR_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { DELIVERY_LOCATION, QUICK_ACTIONS } from "@/src/constants/data";
import { icons } from "@/src/constants/icons";
import { useHomeData } from "@/src/hooks/home/useHomeData";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
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
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, ListRenderItem, RefreshControl, View } from "react-native";
import Animated, { useSharedValue } from "react-native-reanimated";
import { PERF_TRACES, usePerformanceTrace } from "@/src/services/performance";
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


  // Select stable setters individually so HomeLayout never subscribes to the
  // whole UI store — otherwise every isFeedScrolling toggle would re-render
  // the entire feed, which is exactly the jank we're removing here.
  const setTabBarVisible = useUIStore((s) => s.setTabBarVisible);
  const setUploadButtonCollapsed = useUIStore((s) => s.setUploadButtonCollapsed);
  const setFeedScrolling = useUIStore((s) => s.setFeedScrolling);
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
  const { displayLocation } = useDeliveryAddress();
  const { reopenLocationSheet, setReopenLocationSheet } = useLocationStore();

  // Sequential onboarding: location → notification → unlock signup popup.
  useHomeOnboarding();

  usePerformanceTrace({
    traceName: PERF_TRACES.HOME_SCREEN_LOAD,
    isLoading: isHomeLoading,
  });

  const [isScreenFocused, setIsScreenFocused] = useState(true);
  // Settles the "scrolling" flag back to false shortly after the last scroll
  // event so a single drag→fling doesn't flip it true/false/true/false.
  const feedScrollSettleRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        // Leaving Home while a scroll flag is set would strand it as `true`
        // in the shared store; reset it so banner autoplays resume elsewhere.
        if (feedScrollSettleRef.current) {
          clearTimeout(feedScrollSettleRef.current);
          feedScrollSettleRef.current = null;
        }
        setFeedScrolling(false);
      };
    }, [
      reopenLocationSheet,
      setReopenLocationSheet,
      setTabBarVisible,
      setUploadButtonCollapsed,
      setFeedScrolling,
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

  // Takes the card itself — callers already hold it, so no lookup on press.
  const handleCardPress = useCallback(
    (card: CategoryCard) => {
      router.push({
        pathname: "/category/[id]",
        params: {
          id: card.id,
          slug: card.slug,
          familySlug: card.familySlug,
          name: card.label.replace("\n", " "),
        },
      });
    },
    [router],
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

  const handleViewAllSubstitutes = useCallback(() => {
    router.push("/(stack)/featured" as any);
  }, [router]);

  // Each Health Essentials row is one subcategory. The featured API returns no
  // parent slug, so match it to a card (cards are subcategories carrying their
  // familySlug) and reuse the same navigation the category cards already use.
  const handleViewAllSubcategory = useCallback(
    (sub: ApiFeaturedSubcategory) => {
      const card = cards.find((c) => c.id === sub.id || c.slug === sub.slug);
      if (card) {
        handleCardPress(card);
        return;
      }
      // Not in the family map — open by slug alone rather than going nowhere.
      router.push({
        pathname: "/category/[id]",
        params: { id: sub.id, slug: sub.slug, name: sub.name },
      });
    },
    [cards, handleCardPress, router],
  );

  const handleScrollStart = useCallback(() => {
    if (feedScrollSettleRef.current) {
      clearTimeout(feedScrollSettleRef.current);
      feedScrollSettleRef.current = null;
    }
    setFeedScrolling(true);
  }, [setFeedScrolling]);

  const handleScrollStop = useCallback(() => {
    if (feedScrollSettleRef.current) clearTimeout(feedScrollSettleRef.current);
    feedScrollSettleRef.current = setTimeout(() => {
      setFeedScrolling(false);
      feedScrollSettleRef.current = null;
    }, 120);
  }, [setFeedScrolling]);

  // Stable identity for the memoized HomeHeader — a fresh object/closure each
  // render would defeat its React.memo and re-render the header needlessly.
  const openLocationSheet = useCallback(
    () => setIsLocationSheetVisible(true),
    [],
  );
  // Reads the resolved delivery address, so the header names the same address
  // the location sheet checks and checkout ships to.
  const headerLocation = useMemo(
    () => displayLocation ?? DELIVERY_LOCATION,
    [displayLocation],
  );

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
                location={headerLocation}
                onPressLocation={openLocationSheet}
              />
              <HeroBanner
                content={appContent?.hero}
                isLoading={isHomeLoading}
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
                isVisible={isScreenFocused}
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
                onViewAll={handleViewAllSubstitutes}
                totalCount={featuredProducts.length}
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
                onViewAll={handleViewAllSubcategory}
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
      handleViewAllSubcategory,
      handleViewAllSubstitutes,
      headerLocation,
      heroHeightShared,
      insets.top,
      isFeaturedLoading,
      isHomeLoading,
      isScreenFocused,
      isSubcategoriesLoading,
      openLocationSheet,
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

      <FloatingBannersCarousel isFocused={isScreenFocused} />
    </View>
  );
};
