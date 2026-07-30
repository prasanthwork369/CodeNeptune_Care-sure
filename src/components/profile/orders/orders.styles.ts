import { StyleSheet } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

// Shared across all order components
export const orderStyles = StyleSheet.create({
  // MyOrdersLayout
  statusBadge: { fontSize: moderateScale(11) },
  labelXs: { fontSize: moderateScale(10) },
  labelSm: { fontSize: moderateScale(13) },
  labelMd: { fontSize: moderateScale(14) },
  labelLg: { fontSize: moderateScale(15) },
  labelXl: { fontSize: moderateScale(16) },
  label20: { fontSize: moderateScale(20) },
  productImg52: { width: exactScale(52), height: exactScale(52) },
  productImg50: { width: exactScale(50), height: exactScale(50) },
  productImg62: { width: exactScale(62), height: exactScale(62) },
  productImg54: { width: exactScale(54), height: exactScale(54) },
  productImg44: { width: exactScale(44), height: exactScale(44) },
  productImg36: { width: exactScale(36), height: exactScale(36) },
  productImg28: { width: exactScale(28), height: exactScale(28) },
  icon20: { width: exactScale(20), height: exactScale(20) },
  icon18: { width: exactScale(18), height: exactScale(18) },
  icon14: { width: exactScale(14), height: exactScale(14) },
  icon24: { width: exactScale(24), height: exactScale(24) },

  // OrderSuccessLayout
  successIcon: { width: exactScale(40), height: exactScale(40) },
  successImg: { width: exactScale(160), height: exactScale(160) },

  // ReturnSuccessModal
  returnSuccessImg: { width: exactScale(88), height: exactScale(88) },
});
