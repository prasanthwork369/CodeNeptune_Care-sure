import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: exactScale(16),
    gap: exactScale(12),
  },
});
