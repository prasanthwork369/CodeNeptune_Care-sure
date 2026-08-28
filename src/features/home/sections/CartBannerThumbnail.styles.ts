import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const CART_THUMB_SIZE = exactScale(44);
export const IMAGE_SIZE = exactScale(30);

export const styles = StyleSheet.create({
  thumbContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CART_THUMB_SIZE,
    height: CART_THUMB_SIZE,
    borderRadius: CART_THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 1,
  },
  imageWrapper: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  mask: {
    position: "absolute",
    top: 0,
    left: 0,
    width: CART_THUMB_SIZE,
    height: CART_THUMB_SIZE,
    borderRadius: CART_THUMB_SIZE / 2,
    backgroundColor: "#FFFFFF",
  },
});
