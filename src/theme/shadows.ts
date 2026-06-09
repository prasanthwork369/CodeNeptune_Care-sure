import { Platform, ViewStyle } from "react-native";

type Shadow = Pick<
  ViewStyle,
  | "shadowColor"
  | "shadowOffset"
  | "shadowOpacity"
  | "shadowRadius"
  | "elevation"
>;

const ios = (
  color: string,
  opacity: number,
  radius: number,
  offsetY: number,
): Shadow => ({
  shadowColor: color,
  shadowOpacity: opacity,
  shadowRadius: radius,
  shadowOffset: { width: 0, height: offsetY },
});

const make = (iosShadow: Shadow, androidElevation: number): Shadow =>
  Platform.select({
    ios: iosShadow,
    android: { elevation: androidElevation },
    default: iosShadow,
  }) as Shadow;

export const shadows = {
  none: {} as Shadow,
  xs: make(ios("#00000014", 0.04, 2, 1), 1),
  sm: make(ios("#00000014", 0.06, 4, 2), 2),
  card: make(ios("#919EAB", 0.1, 12, 4), 4),
  md: make(ios("#00000014", 0.1, 12, 6), 6),
  lg: make(ios("#00000014", 0.14, 20, 10), 10),
  sheet: make(ios("#00000014", 0.18, 28, -8), 12),
} as const;

export type ShadowToken = keyof typeof shadows;
