import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { LinearGradient } from "expo-linear-gradient";
import { HOME_IMAGES } from "@/src/constants/images";
import { UploadMethodCardProps } from "@/src/features/prescription/types";
import { styles as s } from "./choose-method.styles";

const RadioButton = ({ selected }: { selected: boolean }) => (
  <View
    style={[
      s.radioCircle,
      { borderColor: selected ? "#0F7635" : "#C4C4C4" },
    ]}
  >
    {selected && <View style={s.radioDot} />}
  </View>
);

export const UploadMethodCard: React.FC<UploadMethodCardProps> = ({
  isSelected,
  onSelect,
}) => {
  return (
    <Touchable activeOpacity={0.92} onPress={onSelect}>
      <LinearGradient
        colors={["#FCF5FF", "#E8F3FF"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.uploadCardGradient}
      >
        <View style={s.badge}>
          <Text style={s.badgeText}>
            Order Now
          </Text>
        </View>
        <View style={s.cardContentRow}>
          <View style={s.cardLeftCol}>
            <Image
              source={HOME_IMAGES.prescription}
              style={s.prescriptionIcon}
              contentFit="contain"
            />
            <View style={s.cardTextCol}>
              <Text style={s.cardTitle}>
                Upload Prescription
              </Text>
              <Text style={s.cardDesc}>
                The following items require verification before purchase.
              </Text>
            </View>
          </View>
          <RadioButton selected={isSelected} />
        </View>
      </LinearGradient>
    </Touchable>
  );
};
