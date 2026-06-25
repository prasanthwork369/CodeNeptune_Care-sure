import { StyleSheet } from "react-native";
import { exactScale } from "@/src/utils/exactScale";

export const PILL_HEIGHT = exactScale(65);
export const FAB_WIDTH = exactScale(115);
export const BAR_HEIGHT = exactScale(85);
export const ICON_SIZE = exactScale(23);
export const UPLOAD_ICON = exactScale(35);
export const ACTIVE_HEIGHT = exactScale(55);
export const ACTIVE_RADIUS = exactScale(25);

export const styles = StyleSheet.create({
  uploadText: {
    fontSize: exactScale(13),
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: exactScale(16),
  },
  tabLabel: {
    fontSize: exactScale(11),
    marginTop: exactScale(4),
    textAlign: "center",
    width: "100%",
  },
  iconWrap: { height: ICON_SIZE, width: ICON_SIZE },
});
