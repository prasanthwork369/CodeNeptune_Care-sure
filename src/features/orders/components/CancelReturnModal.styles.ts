import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centerWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: exactScale(24),
  },
  cardWrap: {
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: exactScale(16),
    paddingHorizontal: exactScale(24),
    paddingVertical: exactScale(24),
    width: "100%",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: exactScale(16),
    right: exactScale(16),
    width: exactScale(36),
    height: exactScale(36),
    borderRadius: exactScale(18),
    backgroundColor: "#F1F2F4",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: "Inter-Bold",
    fontSize: moderateScale(18),
    color: "#212B36",
    marginRight: exactScale(44),
  },
  message: {
    fontFamily: "Inter-Medium",
    fontSize: moderateScale(13),
    color: "#637381",
    marginTop: exactScale(8),
  },
  input: {
    marginTop: exactScale(16),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: exactScale(12),
    paddingHorizontal: exactScale(14),
    paddingVertical: exactScale(12),
    minHeight: exactScale(90),
    fontFamily: "Inter-Medium",
    fontSize: moderateScale(14),
    color: "#212B36",
    backgroundColor: "#FAFAFA",
  },
  buttonRow: {
    flexDirection: "row",
    gap: exactScale(12),
    marginTop: exactScale(20),
  },
  keepButton: {
    flex: 1,
    height: exactScale(48),
    borderRadius: exactScale(12),
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  keepButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: moderateScale(14),
    color: "#212B36",
  },
  confirmButton: {
    flex: 1,
    height: exactScale(48),
    borderRadius: exactScale(12),
    backgroundColor: "#C22923",
    flexDirection: "row",
    gap: exactScale(8),
    alignItems: "center",
    justifyContent: "center",
  },
  confirmDisabled: {
    opacity: 0.5,
  },
  confirmButtonText: {
    fontFamily: "Inter-Bold",
    fontSize: moderateScale(14),
    color: "#FFFFFF",
  },
});
