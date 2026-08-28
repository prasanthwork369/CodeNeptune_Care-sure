import { ApiFeaturedSubcategory } from "@/src/features/categories/types";
import {
  FlyToCartOverlay,
  FlyToCartProvider,
} from "@/src/components/animations/flyToCart";
import { WhyFamiliesTrustUs } from "@/src/components/common/WhyFamiliesTrustUs";
import { LocationBottomSheet } from "@/src/components/location/LocationBottomSheet";
import { BAR_HEIGHT } from "@/src/components/navigation/LiquidTabBar.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { SearchBar } from "@/src/components/ui/SearchBar";
import { DELIVERY_LOCATION, QUICK_ACTIONS } from "../constants/data";
import { icons } from "@/src/constants/icons";
import {
  BannerCarousel,
  FloatingBannersCarousel,
  FrequentSubstitutes,
  HealthEssentials,
  HealthEssentialsSection,
  HeroBanner,
  HomeFooter,
  HomeHeader,
  QuickActions,
  ShopByCategories,
  SmartSubstitution,
  StickySearchHeader,
} from "@/src/features/home/sections";
import { useHomeData } from "@/src/features/home/hooks/useHomeData";
import { useHomeOnboarding } from "@/src/features/home/hooks/useHomeOnboarding";
import { useHomeScroll } from "@/src/features/home/hooks/useHomeScroll";
import { usePrefetchSearch } from "@/src/features/search/hooks/useSearch";
import { useScrollToTop } from "@/src/features/home/hooks/useScrollToTop";
import { usePrescriptionBanner } from "@/src/features/home/hooks/usePrescriptionBanner";
import { useCartRead } from "@/src/features/cart/hooks/useCartRead";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useContactActions } from "@/src/features/support/hooks/useContactActions";
import { useSettings } from "@/src/hooks/queries/useSettings";
import { useNetworkStatus } from "@/src/hooks/system/useNetworkStatus";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useScrollStatusBar } from "@/src/hooks/ui/useScrollStatusBar";
import { useSlideUp } from "@/src/hooks/ui/useSlideUp";
import { useDeliveryAddress } from "@/src/features/location/hooks/useDeliveryAddress";
import { useNav } from "@/src/hooks/useNav";
import {
  PERF_TRACES,
  usePerformanceTrace,
  useScrollJankTrace,
} from "@/src/services/firebase";
import { useLocationStore } from "@/src/store/locationStore";
import { useUIStore } from "@/src/store/uiStore";
import type { CategoryCard } from "@/src/features/home/types";
import { exactScale } from "@/src/utils/exactScale";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { FlashList, FlashListRef, ListRenderItem } from "@shopify/flash-list";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { RefreshControl, View } from "react-native";
import Animated, {
  FadeInDown,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { styles as s } from "./HomeLayout.styles";

// FlashList has no built-in Reanimated wrapper the way RN's FlatList does, so
// the scroll-driven tab bar / sticky search animations (useAnimatedScrollHandler)
// need this to attach correctly.
const AnimatedFlashList = Animated.createAnimatedComponent(
  FlashList,
) as unknown as typeof FlashList;

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

// Health Essentials is flattened into one row per subcategory so the parent
// FlashList virtualizes each row instead of mounting every horizontal list at once.
type HomeSection =
  | { id: HomeSectionId }
  | {
      id: string;
      kind: "healthEssentialsRow";
      subcategory: ApiFeaturedSubcategory;
      themeIndex: number;
    };

const HomeContent: React.FC = () => {
  const router = useNav();
  const insets = useSafeAreaInsets();
  const adjustedBottom = useAdjustedBottomInset();

  const [isLocationSheetVisible, setIsLocationSheetVisible] = useState(false);
  const listRef = useRef<FlashListRef<HomeSection>>(null);

  useScrollToTop(listRef);

  const searchBarAnim = useSlideUp(0);

  // Select stable setters individually so HomeLayout never subscribes to the
  // whole UI store — otherwise every isFeedScrolling toggle would re-render
  // the entire feed, which is exactly the jank we're removing here.
  const setTabBarVisible = useUIStore((st) => st.setTabBarVisible);
  const setUploadButtonCollapsed = useUIStore(
    (st) => st.setUploadButtonCollapsed,
  );
  const setFeedScrolling = useUIStore((st) => st.setFeedScrolling);
  const setHomeFocused = useUIStore((st) => st.setHomeFocused);
  const { totalItems } = useCartRead();
  // Owns the focus refetch for Home; the header and floating banner read the
  // same shared query without triggering their own.
  const { hasPendingPrescription } = usePrescriptionBanner({
    refetchOnFocus: true,
  });
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
    error,
    isRefreshing,
    onRefresh,
  } = useHomeData();
  const { isOffline, coldLaunchOffline } = useNetworkStatus();
  const errorState = useQueryErrorState(error);

  const { data: settings } = useSettings();
  const { callSupport, whatsappOrder } = useContactActions({
    phone: settings?.contactPhone,
    whatsapp: settings?.whatsappNumber || settings?.contactPhone,
  });
  const { displayLocation } = useDeliveryAddress();
  const reopenLocationSheet = useLocationStore((st) => st.reopenLocationSheet);
  const setReopenLocationSheet = useLocationStore(
    (st) => st.setReopenLocationSheet,
  );

  // Sequential onboarding: location → notification → unlock signup popup.
  useHomeOnboarding();

  usePerformanceTrace({
    traceName: PERF_TRACES.HOME_SCREEN_LOAD,
    isLoading: isHomeLoading,
  });

  // Reports scroll smoothness (janky frames) to Firebase per scroll session.
  const { start: startScrollJank, stop: stopScrollJank } = useScrollJankTrace(
    PERF_TRACES.HOME_SCROLL,
  );

  const prefetchSearch = usePrefetchSearch();

  // Settles the "scrolling" flag back to false shortly after the last scroll
  // event so a single drag→fling doesn't flip it true/false/true/false.
  const feedScrollSettleRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useFocusEffect(
    useCallback(() => {
      setHomeFocused(true);
      const t = setTimeout(() => {
        setTabBarVisible(true);
        setUploadButtonCollapsed(false);
      }, 30);
      if (reopenLocationSheet) {
        setIsLocationSheetVisible(true);
        setReopenLocationSheet(false);
      }
      return () => {
        setHomeFocused(false);
        clearTimeout(t);
        // Leaving Home while a scroll flag is set would strand it as `true`
        // in the shared store; reset it so banner autoplays resume elsewhere.
        if (feedScrollSettleRef.current) {
          clearTimeout(feedScrollSettleRef.current);
          feedScrollSettleRef.current = null;
        }
        setFeedScrolling(false);
        stopScrollJank();
      };
    }, [
      reopenLocationSheet,
      setReopenLocationSheet,
      setTabBarVisible,
      setUploadButtonCollapsed,
      setFeedScrolling,
      setHomeFocused,
      stopScrollJank,
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
    (
      id: string,
      previewName?: string,
      previewImage?: string,
      previewBrand?: string,
    ) => {
      router.push({
        pathname: "/product/[id]",
        params: {
          id,
          previewName: previewName || undefined,
          previewImage: previewImage || undefined,
          previewBrand: previewBrand || undefined,
        },
      });
    },
    [router],
  );

  // Stable, or an inline arrow defeats React.memo on the search bar and overlays.
  const goToSearch = useCallback(() => router.push("/search"), [router]);
  const goToUpload = useCallback(() => router.push("/upload"), [router]);
  const closeLocationSheet = useCallback(
    () => setIsLocationSheetVisible(false),
    [],
  );

  const handleViewAllFrequent = useCallback(() => {
    router.push("/profile/orders/frequent");
  }, [router]);

  const handleViewAllSubstitutes = useCallback(() => {
    router.push("/(catalog)/featured");
  }, [router]);

  const handleViewAllSubcategory = useCallback(
    (sub: ApiFeaturedSubcategory) => {
      router.push({
        pathname: "/category/[id]",
        params: {
          id: sub.id,
          slug: sub.slug,
          familySlug: sub.familySlug || undefined,
          name: sub.name,
        },
      });
    },
    [router],
  );

  const handleScrollStart = useCallback(() => {
    if (feedScrollSettleRef.current) {
      clearTimeout(feedScrollSettleRef.current);
      feedScrollSettleRef.current = null;
    }
    setFeedScrolling(true);
    startScrollJank();
  }, [setFeedScrolling, startScrollJank]);

  const handleScrollStop = useCallback(() => {
    if (feedScrollSettleRef.current) clearTimeout(feedScrollSettleRef.current);
    feedScrollSettleRef.current = setTimeout(() => {
      setFeedScrolling(false);
      feedScrollSettleRef.current = null;
      stopScrollJank();
    }, 120);
  }, [setFeedScrolling, stopScrollJank]);

  // Stable identity for the memoized HomeHeader
  const openLocationSheet = useCallback(
    () => setIsLocationSheetVisible(true),
    [],
  );
  // Reads the resolved delivery address
  const headerLocation = useMemo(
    () => displayLocation ?? DELIVERY_LOCATION,
    [displayLocation],
  );

  // Held stable so the search row bails out of re-rendering with the rest.
  const searchRightSlot = useMemo(
    () => (
      <Touchable
        onPress={goToUpload}
        style={s.searchUploadSlot}
      >
        <icons.uploadActive width={exactScale(22)} height={exactScale(22)} />
      </Touchable>
    ),
    [goToUpload],
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

    // While loading, keep a single skeleton row; once loaded, emit one
    // virtualized row per subcategory so the list mounts them lazily on scroll.
    if (isSubcategoriesLoading) {
      feedSections.push({ id: "healthEssentials" });
    } else {
      featuredSubcategories.forEach((sub, index) => {
        feedSections.push({
          id: `healthEssentials-${sub.id}`,
          kind: "healthEssentialsRow",
          subcategory: sub,
          themeIndex: index,
        });
      });
    }

    feedSections.push({ id: "trust" }, { id: "footer" });

    return feedSections;
  }, [frequentlyOrdered.length, isSubcategoriesLoading, featuredSubcategories]);

  // Every section renders its own one-off layout except healthEssentialsRow
  const getSectionItemType = useCallback(
    (item: HomeSection) => ("kind" in item ? item.kind : item.id),
    [],
  );

  const renderSection: ListRenderItem<HomeSection> = useCallback(
    ({ item }) => {
      // Flattened Health Essentials row — one subcategory per list item.
      if ("kind" in item && item.kind === "healthEssentialsRow") {
        return (
          <View style={s.sectionGap10}>
            <HealthEssentialsSection
              subcategory={item.subcategory}
              themeIndex={item.themeIndex}
              onProductPress={handleProductPress}
              onViewAll={handleViewAllSubcategory}
            />
          </View>
        );
      }

      switch (item.id) {
        case "hero":
          return (
            <View
              onLayout={(e) => {
                heroHeightShared.value = e.nativeEvent.layout.height;
              }}
            >
              <View
                style={[
                  s.heroUnderlay,
                  { top: -(insets.top + exactScale(400)) },
                ]}
              />
              <LinearGradient
                colors={["#DEF5B0", "#EAF9D1", "#F6FDF0", "#FFFFFF"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[
                  s.heroGradient,
                  {
                    top: -insets.top,
                    height: exactScale(350) + insets.top,
                  },
                ]}
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
              style={[
                s.searchSection,
                {
                  marginTop: -(insets.top + exactScale(8)) - exactScale(30),
                  paddingTop: insets.top + exactScale(8),
                },
              ]}
            >
              <Animated.View style={searchBarAnim}>
                <SearchBar
                  placeholder="Search medicines & health products"
                  useHomeCycler
                  onPress={goToSearch}
                  onPressIn={prefetchSearch}
                  rightSlot={searchRightSlot}
                />
              </Animated.View>
            </View>
          );

        case "quickActions":
          return (
            <Animated.View
              entering={FadeInDown.delay(50).duration(350)}
              style={s.quickActionsWrap}
            >
              <QuickActions
                actions={QUICK_ACTIONS}
                onActionPress={handleQuickAction}
              />
            </Animated.View>
          );

        case "categories":
          return (
            <View style={s.sectionGap10}>
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
            <View style={s.sectionGap20}>
              <BannerCarousel
                banners={appContent?.banners ?? EMPTY_BANNERS}
                categories={cards}
                isLoading={isHomeLoading}
              />
            </View>
          );

        case "smartSubstitution":
          return (
            <View style={s.sectionGap20}>
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
            <View style={s.sectionGap10}>
              <FrequentSubstitutes
                substitutes={frequentlyOrdered}
                onProductPress={handleProductPress}
                onViewAll={handleViewAllFrequent}
              />
            </View>
          );

        case "healthEssentials":
          return (
            <View style={s.sectionGap10}>
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
            <View style={s.sectionGap10}>
              <WhyFamiliesTrustUs
                promise={appContent?.promise}
                isLoading={isHomeLoading}
              />
            </View>
          );

        case "footer":
          return (
            <View style={s.sectionGap20}>
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
      isSubcategoriesLoading,
      openLocationSheet,
      goToSearch,
      prefetchSearch,
      searchRightSlot,
      searchBarAnim,
      tabs,
    ],
  );

  // Changes only when the banner appears/disappears, not on every cart tick.
  const listContentStyle = useMemo(
    () => ({
      backgroundColor: "#FFFFFF",
      paddingTop: insets.top,
      paddingBottom: TAB_BAR_HEIGHT + (hasFloatingBanner ? exactScale(75) : 0),
    }),
    [TAB_BAR_HEIGHT, hasFloatingBanner, insets.top],
  );

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={isRefreshing}
        onRefresh={onRefresh}
        tintColor="#36B37E"
        colors={["#36B37E"]}
        progressBackgroundColor="#FFFFFF"
        progressViewOffset={insets.top + exactScale(30)}
      />
    ),
    [isRefreshing, onRefresh, insets.top],
  );

  const hasNoHomeContent =
    tabs.length === 0 &&
    cards.length === 0 &&
    !appContent &&
    featuredProducts.length === 0 &&
    featuredSubcategories.length === 0;

  // Cold launch started offline
  if (coldLaunchOffline && isOffline) {
    return (
      <View style={s.root}>
        <NoInternetState
          onRetry={() => void onRefresh()}
          retrying={isRefreshing}
        />
      </View>
    );
  }

  // Error state
  if (errorState && hasNoHomeContent && !isHomeLoading) {
    return (
      <View style={s.root}>
        {errorState === "offline" ? (
          <NoInternetState
            onRetry={() => void onRefresh()}
            retrying={isRefreshing}
          />
        ) : (
          <RetryState
            title="Couldn't load home"
            onRetry={() => void onRefresh()}
            retrying={isRefreshing}
          />
        )}
      </View>
    );
  }

  return (
    <View style={s.root}>
      {/* Invisible while hero is in view */}
      <Animated.View
        style={[safeAreaBgStyle, { backgroundColor: "#FFFFFF" }]}
      />
      <AnimatedFlashList
        ref={listRef as React.Ref<FlashListRef<HomeSection>>}
        data={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderSection}
        getItemType={getSectionItemType}
        drawDistance={800}
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        decelerationRate="normal"
        nestedScrollEnabled
        style={[s.list, { marginTop: -insets.top }]}
        contentContainerStyle={listContentStyle}
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollStart}
        onMomentumScrollBegin={handleScrollStart}
        onScrollEndDrag={handleScrollStop}
        onMomentumScrollEnd={handleScrollStop}
        scrollEventThrottle={16}
        refreshControl={refreshControl}
      />

      <StickySearchHeader
        visible={stickySearchVisible}
        onPressSearch={goToSearch}
        onPressInSearch={prefetchSearch}
        onPressUpload={goToUpload}
      />

      <LocationBottomSheet
        isVisible={isLocationSheetVisible}
        onClose={closeLocationSheet}
      />

      <FloatingBannersCarousel />

      <FlyToCartOverlay />
    </View>
  );
};

export const HomeLayout: React.FC = () => (
  <FlyToCartProvider>
    <HomeContent />
  </FlyToCartProvider>
);
