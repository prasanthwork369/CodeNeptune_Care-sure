import { TextStyle } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

/**
 * Centralized typography tokens. Every Text in the app should pull its
 * fontSize/lineHeight from here instead of calling moderateScale() directly
 * with an ad-hoc number — that's what caused font sizes/line-heights to
 * drift inconsistently between components and devices.
 *
 * Only moderateScale() is used here (never exactScale()) — exactScale is for
 * layout dimensions (widths, padding, icon sizes), not font sizing.
 */
export const typography = {
  h1: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(36),
    fontWeight: "800",
  } satisfies TextStyle,
  h2: {
    fontSize: moderateScale(22),
    lineHeight: moderateScale(28),
    fontWeight: "700",
  } satisfies TextStyle,
  title: {
    fontSize: moderateScale(16),
    lineHeight: moderateScale(22),
    fontWeight: "700",
  } satisfies TextStyle,
  body: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    fontWeight: "400",
  } satisfies TextStyle,
  caption: {
    fontSize: moderateScale(12),
    lineHeight: moderateScale(16),
    fontWeight: "500",
  } satisfies TextStyle,
  small: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    fontWeight: "500",
  } satisfies TextStyle,
  subtitle: {
    fontSize: moderateScale(15),
    lineHeight: moderateScale(20),
    fontWeight: "600",
  } satisfies TextStyle,
  tiny: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(15),
    fontWeight: "500",
  } satisfies TextStyle,
  micro: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(14),
    fontWeight: "500",
  } satisfies TextStyle,
  price: {
    fontSize: moderateScale(18),
    lineHeight: moderateScale(24),
    fontWeight: "700",
  } satisfies TextStyle,
} as const;

export type TypographyToken = keyof typeof typography;
