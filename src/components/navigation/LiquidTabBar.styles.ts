import { StyleSheet } from "react-native";
import { moderateScale } from "react-native-size-matters";

export const PILL_HEIGHT = moderateScale(65, 0.25);
export const FAB_WIDTH = moderateScale(115, 0.25);
export const BAR_HEIGHT = moderateScale(85, 0.25);
export const ICON_SIZE = moderateScale(23, 0.25);
export const UPLOAD_ICON = moderateScale(35, 0.25);
export const ACTIVE_HEIGHT = moderateScale(55, 0.25);
export const ACTIVE_RADIUS = moderateScale(25, 0.25);

export const styles = StyleSheet.create({
  uploadText: {
    fontSize: moderateScale(13, 0.08),
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: moderateScale(16, 0.08),
  },
  tabLabel: {
    fontSize: moderateScale(11, 0.07),
    marginTop: 4,
    textAlign: "center",
    width: "100%",
  },
  iconWrap: { height: ICON_SIZE, width: ICON_SIZE },
});
