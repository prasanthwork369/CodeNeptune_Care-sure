import { colors, shadows, spacing } from "@/src/theme";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  scrollContent: {
    padding: exactScale(spacing[4]),
  },
  contactInput: {
    paddingVertical: exactScale(spacing[4]),
    fontSize: moderateScale(14),
  },
  contactValue: {
    paddingVertical: exactScale(spacing[4]),
    fontSize: moderateScale(14),
  },
  vitalCard: {
    paddingVertical: exactScale(spacing[4]),
    justifyContent: "center",
  },
  genderCard: {
    paddingVertical: exactScale(spacing[4]),
  },
  healthSelector: {
    paddingVertical: exactScale(spacing[4]),
  },
  customProblemInput: {
    paddingVertical: exactScale(spacing[4]),
    fontSize: moderateScale(14),
  },
  symptomsInput: {
    minHeight: exactScale(84),
    paddingVertical: exactScale(spacing[4]),
    textAlignVertical: "top",
    fontSize: moderateScale(14),
  },
  footer: {
    paddingHorizontal: exactScale(spacing[4]),
    paddingTop: exactScale(spacing[4]),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#919EAB22",
    backgroundColor: colors.white,
  },
  continueButton: {
    width: "100%",
    height: exactScale(50),
    borderRadius: exactScale(12),
    ...(shadows.md ?? {}),
  },
  continueButtonText: {
    fontSize: moderateScale(15),
  },
});
