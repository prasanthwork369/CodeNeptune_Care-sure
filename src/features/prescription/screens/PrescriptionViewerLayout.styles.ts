import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const PAGE_BTN = exactScale(40);

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F5F6FB",
  },
  container: {
    flex: 1,
  },
  pdfViewer: {
    backgroundColor: "#F5F6FB",
  },
  imageViewer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  pageBtn: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    width: PAGE_BTN,
    height: PAGE_BTN,
    borderRadius: PAGE_BTN / 2,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#919EAB33",
  },
  pageBtnLeft: {
    left: exactScale(16),
  },
  pageBtnRight: {
    right: exactScale(16),
  },
  pageCounterBadge: {
    position: "absolute",
    alignSelf: "center",
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    borderRadius: exactScale(12),
    paddingHorizontal: exactScale(12),
    paddingVertical: exactScale(5),
  },
  pageCounterText: {
    fontSize: moderateScale(12),
    fontWeight: "600",
    color: "#FFFFFF",
  },
  footerVerifiedContainer: {
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(16),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEFF1",
  },
  verifiedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1FEF8",
    borderWidth: 1,
    borderColor: "#0F763533",
    borderRadius: exactScale(12),
    padding: exactScale(16),
  },
  verifiedIconBox: {
    marginRight: exactScale(12),
    backgroundColor: "#D1F2E1",
    borderRadius: exactScale(999),
    padding: exactScale(8),
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedTextCol: {
    flex: 1,
    justifyContent: "center",
  },
  verifiedTitle: {
    fontSize: moderateScale(14),
    fontWeight: "700",
    color: "#111827",
  },
  verifiedSubtitle: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#6A6A6A",
    marginTop: exactScale(2),
  },
  footerSelectContainer: {
    flexDirection: "row",
    gap: exactScale(12),
    paddingHorizontal: exactScale(20),
    paddingTop: exactScale(12),
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEFF1",
  },
  selectBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: exactScale(14),
    borderRadius: exactScale(8),
    backgroundColor: "#0F7635",
  },
  selectBtnText: {
    fontSize: moderateScale(14),
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
