import React from "react";
import { View, Text, Image } from "react-native";
import { UPLOAD_IMAGES } from "@/src/constants/images";
import { styles as s } from "./upload.styles";

const TRUST_ITEMS = [
  { image: UPLOAD_IMAGES.secure, label: "100% Secure & Confidential" },
  { image: UPLOAD_IMAGES.pharmacist, label: "Verified Pharmacists" },
  { image: UPLOAD_IMAGES.fastTime, label: "Fast Processing" },
];

export const WhyTrustUs: React.FC = () => {
  return (
    <View style={s.card}>
      <Text style={s.trustSectionTitle}>
        Why trust us?
      </Text>
      {TRUST_ITEMS.map((item, idx) => (
        <View
          key={item.label}
          style={[s.trustItemRow, idx > 0 && s.trustItemRowMargin]}
        >
          <Image source={item.image} style={s.trustIcon} resizeMode="contain" />
          <Text style={s.trustLabel}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};
