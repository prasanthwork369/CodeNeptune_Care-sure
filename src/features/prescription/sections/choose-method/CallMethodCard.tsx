import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { Touchable } from "@/src/components/ui/Touchable";
import { LinearGradient } from "expo-linear-gradient";
import { HOME_IMAGES } from "@/src/constants/images";
import { CallMethodCardProps } from "@/src/features/prescription/types";
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

export const CallMethodCard: React.FC<CallMethodCardProps> = ({
  isSelected,
  onSelect,
}) => {
  return (
    <View style={s.callCardWrapper}>
      <Touchable activeOpacity={0.92} onPress={onSelect}>
        <LinearGradient
          colors={["#FCF5FF", "#E8F3FF"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={s.cardGradient}
        >
          <View style={s.badge}>
            <Text style={s.badgeText}>
              Call Us
            </Text>
          </View>
          <View style={s.cardContentRow}>
            <View style={s.cardLeftCol}>
              <View style={s.stethoscopeIconBox}>
                <Image
                  source={HOME_IMAGES.stethoscope}
                  style={s.stethoscopeIcon}
                  contentFit="contain"
                />
              </View>
              <View style={s.cardTextCol}>
                <Text style={s.cardTitle}>
                  {"Don't have a prescription? Call us"}
                </Text>
                <Text style={s.cardDesc}>
                  Our pharmacists will assist you and help you complete your
                  order.
                </Text>
              </View>
            </View>
            <RadioButton selected={isSelected} />
          </View>
        </LinearGradient>
      </Touchable>
    </View>
  );
};
