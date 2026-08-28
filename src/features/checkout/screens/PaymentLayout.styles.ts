import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8F9FC",
  },
  scrollContent: {
    padding: exactScale(16),
  },
});
