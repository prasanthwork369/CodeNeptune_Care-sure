import { StyleSheet } from "react-native";
import { moderateScale, scale } from "react-native-size-matters";

export const SEARCH_ICON_SIZE = scale(20);

export const styles = StyleSheet.create({
  cyclerText: { fontSize: moderateScale(14, 0.3) },
  placeholderText: { fontSize: moderateScale(13, 0.3) },
  inputText: { fontSize: moderateScale(13, 0.3) },
  uploadIcon: { width: scale(22), height: scale(22) },
});
