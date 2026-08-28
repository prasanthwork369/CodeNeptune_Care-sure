import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    marginBottom: exactScale(16),
  },
  label: {
    fontSize: moderateScale(13),
    fontWeight: "600",
    color: "#222222",
    marginBottom: exactScale(6),
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: exactScale(8),
    borderWidth: 1,
    borderColor: "#E8E8E8",
    paddingHorizontal: exactScale(14),
    minHeight: exactScale(48),
  },
  inputWrapEditable: {
    backgroundColor: "#FFFFFF",
  },
  inputWrapDisabled: {
    backgroundColor: "#F5F6FB",
  },
  input: {
    flex: 1,
    paddingVertical: exactScale(12),
    fontSize: moderateScale(14),
    paddingLeft: 0,
    includeFontPadding: true,
  },
  inputEditable: {
    color: "#111827",
  },
  inputDisabled: {
    color: "#637381",
  },
  error: {
    fontSize: moderateScale(12),
    fontWeight: "500",
    color: "#EF4444",
    marginTop: exactScale(4),
  },
});
