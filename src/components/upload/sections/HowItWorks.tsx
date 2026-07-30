import React from "react";
import { View, Text } from "react-native";
import { styles as s } from "./HowItWorks.styles";

const STEPS = [
  { n: "1", label: "Upload\nPrescription" },
  { n: "2", label: "Pharmacist\nVerification" },
  { n: "3", label: "Ready to\nDeliver" },
];

export const HowItWorks: React.FC = () => {
  return (
    <View className="bg-white border border-[#919EAB33] rounded-[14px] p-4">
      <Text
        style={s.sectionTitle}
        className="font-inter-semibold text-brand-text mb-4"
      >
        How it works
      </Text>
      <View className="flex-row items-start justify-around">
        {STEPS.map((step) => (
          <View key={step.n} className="items-center flex-1">
            <View
              style={[s.stepCircle, { backgroundColor: "#F1F5F9" }]}
              className="rounded-full items-center justify-center"
            >
              <Text
                style={s.stepNumber}
                className="font-inter-semibold leading-none"
              >
                {step.n}
              </Text>
            </View>
            <Text
              style={s.stepLabel}
              className="font-inter-medium text-brand-text text-center mt-2"
            >
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
