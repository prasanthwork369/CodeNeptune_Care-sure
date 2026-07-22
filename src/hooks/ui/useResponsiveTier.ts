import { useWindowDimensions } from "react-native";

// Below this width, grids should drop a column so cards don't get too cramped
// (e.g. iPhone SE). Above TABLET_MIN, grids should gain columns instead of
// just stretching existing cards wider (see AuthScreenShell.tsx for the
// pattern this hook generalizes).
const SMALL_MAX = 360;
const TABLET_MIN = 600;

export type ResponsiveTier = "small" | "default" | "tablet";

export function useResponsiveTier() {
  const { width, height } = useWindowDimensions();

  const tier: ResponsiveTier =
    width < SMALL_MAX ? "small" : width >= TABLET_MIN ? "tablet" : "default";

  return {
    width,
    height,
    tier,
    isSmall: tier === "small",
    isTablet: tier === "tablet",
    // 700px covers common compact/landscape viewports such as 568px and
    // 640px phones after system bars are accounted for.
    isShortHeight: height < 700,
    // Pick a value per tier, e.g. columns(2, 3, 4) -> 2 on small phones, 3 by
    // default, 4 on tablets.
    pick: <T>(small: T, defaultValue: T, tablet: T): T =>
      tier === "small" ? small : tier === "tablet" ? tablet : defaultValue,
  };
}
