import React from "react";
import { View, Text } from "react-native";
import { styles as s } from "./upload.styles";

const STEPS = [
  { n: "1", label: "Upload\nPrescription" },
  { n: "2", label: "Pharmacist\nVerification" },
  { n: "3", label: "Ready to\nDeliver" },
];

export const HowItWorks: React.FC = () => {
  return (
    <View style={s.card}>
      <Text style={s.howSectionTitle}>
        How it works
      </Text>
      <View style={s.stepsRow}>
        {STEPS.map((step) => (
          <View key={step.n} style={s.stepCol}>
            <View style={s.stepCircle}>
              <Text style={s.stepNumber}>
                {step.n}
              </Text>
            </View>
            <Text style={s.stepLabel}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
