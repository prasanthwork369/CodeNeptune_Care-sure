import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export const PILL_HEIGHT = exactScale(65);
export const FAB_WIDTH = exactScale(115);
export const BAR_HEIGHT = exactScale(85);
export const ICON_SIZE = exactScale(23);
export const UPLOAD_ICON = exactScale(35);
export const ACTIVE_HEIGHT = exactScale(55);
export const ACTIVE_RADIUS = exactScale(25);

export const styles = StyleSheet.create({
  uploadText: {
    fontSize: moderateScale(13, 0.1),
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: moderateScale(16, 0.1),
  },
  tabLabel: {
    fontSize: moderateScale(11, 0.1),
    marginTop: exactScale(4),
    textAlign: "center",
    width: "100%",
  },
  iconWrap: { height: ICON_SIZE, width: ICON_SIZE },
});
