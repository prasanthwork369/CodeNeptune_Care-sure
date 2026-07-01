import { Platform } from "react-native";

// Cross-platform shadow utility.
// Usage: style={[shadows.card, { ...otherStyles }]}
export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
    },
    android: {
      elevation: 3,
    },
  }),
  pill: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
    },
    android: {
      elevation: 6,
    },
  }),
  modal: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: {
      elevation: 12,
    },
  }),
} as const;
