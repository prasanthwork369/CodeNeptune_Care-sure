import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  displayContainer: {
    flex: 1,
    paddingHorizontal: exactScale(24),
    paddingTop: exactScale(20),
    paddingBottom: exactScale(8),
  },
});
