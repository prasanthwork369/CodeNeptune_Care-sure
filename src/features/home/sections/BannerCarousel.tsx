import type { Href } from "expo-router";
import React, { useCallback, useEffect, useRef } from "react";
import {
  AppState,
  AppStateStatus,
  View,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { openInAppBrowser } from "@/src/utils/browser";
import { ApiBanner, CategoryCard } from "@/src/types/home";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useUIStore } from "@/src/store/uiStore";
import { useSharedValue } from "react-native-reanimated";
import { CarouselDot } from "@/src/components/animations/carousel";
import { exactScale } from "@/src/utils/exactScale";

interface BannerCarouselProps {
  banners: ApiBanner[];
  categories?: CategoryCard[];
  isLoading?: boolean;
}

const BANNER_ROUTE_MAP: Record<string, Href> = {
  "/cart": "/(commerce)/cart",
  "/category": "/categories",
  "/categories": "/categories",
  "/search": "/search",
  "/upload": "/upload",
};

// Only http(s) is treated as external — other schemes are not opened.
const EXTERNAL_LINK_RE = /^https?:\/\//i;

// Banner links point at a category by slug, e.g. `/category/baby-mom-care`,
// `/categories/skin-care`, or just `/baby-mom-care`. Pull the slug out and
// look it up directly against the loaded cards — same data `handleCardPress`
// uses on the home screen — then pass its id/slug/familySlug/name straight
// through so it opens exactly the same way a category card tap does.
const CATEGORY_LINK_RE = /^\/(?:categor(?:y|ies)\/)?([^/?#]+)\/?$/i;

// Case/separator-insensitive compare — backend may send `/babycare` while the
// category's slug is `baby-care` (or vice versa).
const sameSlug = (a?: string, b?: string) =>
  !!a &&
  !!b &&
  a.toLowerCase().replace(/[-_\s]/g, "") ===
    b.toLowerCase().replace(/[-_\s]/g, "");

const findCardBySlug = (
  link: string,
  categories?: CategoryCard[],
): CategoryCard | undefined => {
  const match = link.match(CATEGORY_LINK_RE);
  if (!match || !categories) return undefined;

  const slug = decodeURIComponent(match[1]).toLowerCase();
  if (`/${slug}` in BANNER_ROUTE_MAP) return undefined;

  return categories.find(
    (c) => sameSlug(c.slug, slug) || sameSlug(c.familySlug, slug),
  );
};

export const BannerCarousel: React.FC<BannerCarouselProps> = React.memo(
  ({ banners, categories, isLoading }) => {
    const { width } = useWindowDimensions();
    const bannerHeight = Math.round(exactScale(176));
    const router = useNav();
    const carouselRef = useRef<ICarouselInstance>(null);
    const progressShared = useSharedValue(0);
    const appActiveRef = useRef(true);
    // Both subscribed here (not passed as props) so the home feed doesn't
    // re-render on scroll start/stop or on focus changes — only this carousel
    // reacts, to pause autoplay.
    const isFeedScrolling = useUIStore((s) => s.isFeedScrolling);
    const isHomeFocused = useUIStore((s) => s.isHomeFocused);
    const autoplayActive = isHomeFocused && !isFeedScrolling;

    // Manual autoplay — bypasses the unreliable autoPlay prop in v4
    useEffect(() => {
      if (banners.length <= 1 || !autoplayActive) return;
      const sub = AppState.addEventListener("change", (s: AppStateStatus) => {
        appActiveRef.current = s === "active";
      });
      const timer = setInterval(() => {
        if (appActiveRef.current) carouselRef.current?.next();
      }, 3500);
      return () => {
        clearInterval(timer);
        sub.remove();
      };
    }, [banners.length, autoplayActive]);

    const handlePress = useCallback(
      (rawLink: string) => {
        if (!rawLink) return;
        // Optional external campaign links open in a browser — normalising them
        // as a route below would push "/https://..." and hit the 404 screen.
        if (EXTERNAL_LINK_RE.test(rawLink)) {
          void openInAppBrowser(rawLink.trim());
          return;
        }
        // Admin panel stores links without a leading slash (e.g. `baby-and-mom-care`).
        const link = rawLink.startsWith("/") ? rawLink : `/${rawLink}`;
        const card = findCardBySlug(link, categories);
        if (card) {
          router.push({
            pathname: "/category/[id]",
            params: {
              id: card.id,
              slug: card.slug,
              familySlug: card.familySlug,
              name: card.label.replace("\n", " "),
            },
          });
          return;
        }
        if (__DEV__ && categories?.length) {
          console.warn(
            `[BannerCarousel] No category matches link "${link}". Available slugs:`,
            categories.map((c) => ({ slug: c.slug, familySlug: c.familySlug })),
          );
        }
        // Unknown slug (typo, renamed, or a category missing from the family
        // map): land on the category list rather than pushing an unmatched path,
        // which would drop the user on the router's raw "Unmatched Route" screen.
        router.push(BANNER_ROUTE_MAP[link.toLowerCase()] ?? "/categories");
      },
      [router, categories],
    );

    const renderItem = useCallback(
      ({ item }: { item: ApiBanner }) => (
        <Touchable
          activeOpacity={item.link ? 0.9 : 1}
          onPress={() => handlePress(item.link)}
          disabled={!item.link}
          className="px-4"
          accessibilityLabel={item.alt}
          accessibilityRole="button"
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: exactScale(16),
            }}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </Touchable>
      ),
      [handlePress],
    );

    if (isLoading) {
      return (
        <View className="px-4">
          <Skeleton
            width="100%"
            height={bannerHeight}
            borderRadius={exactScale(16)}
          />
        </View>
      );
    }

    if (!banners || banners.length === 0) return null;

    const canLoop = banners.length > 1;

    return (
      <View>
        <Carousel
          ref={carouselRef}
          loop={canLoop}
          width={width}
          height={bannerHeight}
          scrollAnimationDuration={500}
          data={banners}
          onProgressChange={progressShared}
          renderItem={renderItem}
          onConfigurePanGesture={(gesture) => {
            gesture.activeOffsetX([-10, 10]);
            gesture.failOffsetY([-5, 5]);
          }}
        />

        {canLoop && (
          <View className="flex-row justify-center items-center mt-2 gap-x-1.5">
            {banners.map((_, i) => (
              <CarouselDot
                key={i}
                index={i}
                progress={progressShared}
                total={banners.length}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
);
BannerCarousel.displayName = "BannerCarousel";
