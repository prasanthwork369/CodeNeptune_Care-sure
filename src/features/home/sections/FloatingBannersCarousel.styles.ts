import { exactScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  dotBase: {
    width: exactScale(4),
    height: exactScale(4),
    borderRadius: exactScale(2),
  },
  bottomFade: {
    position: "absolute",
    left: 0,
    right: 0,
    height: exactScale(200),
    zIndex: -1,
  },
  bothActiveCarouselWrap: {
    position: "absolute",
    left: 0,
    justifyContent: "flex-end",
    zIndex: 100,
  },
  slidesContainer: {
    width: "100%",
    overflow: "hidden",
    zIndex: 10,
  },
  slideItem: {
    height: "100%",
    justifyContent: "flex-end",
  },
  dotsBadge: {
    position: "absolute",
    alignSelf: "center",
    height: exactScale(12),
    paddingHorizontal: exactScale(6),
    borderRadius: exactScale(7),
    backgroundColor: "#9E9E9E",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: exactScale(4),
    zIndex: 20,
  },
  singleBannerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 50,
  },
  singleBannerInner: {
    zIndex: 10,
    width: "100%",
  },
});
