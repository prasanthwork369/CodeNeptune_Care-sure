import React from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { HOME_IMAGES } from "@/src/constants/images";
import { styles as s } from "./product-sections.styles";

interface KnowYourMedicineProps {
  manufacturer: string;
  consumeType?: string;
  returnPolicy: string;
}

export const KnowYourMedicine: React.FC<KnowYourMedicineProps> = ({
  manufacturer,
  consumeType = "Oral",
  returnPolicy,
}) => {
  return (
    <LinearGradient
      colors={["#FCEBFE", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={s.kymGradient}
    >
      <Text style={s.kymTitle}>
        Know Your Medicine
      </Text>

      <View style={s.kymCard}>
        <View style={s.kymRow}>
          <View style={[s.kymIconBox, s.kymChemicalBox]}>
            <Image
              source={HOME_IMAGES.chemical}
              style={s.kymIconImage}
              contentFit="contain"
            />
          </View>
          <View style={s.kymTextCol}>
            <Text style={s.kymLabel}>
              Manufacturer/Marketer
            </Text>
            <Text style={s.kymValueTeal}>
              {manufacturer}
            </Text>
          </View>
        </View>

        <View style={s.kymRow}>
          <View style={[s.kymIconBox, s.kymMedicineBox]}>
            <Image
              source={HOME_IMAGES.medicine}
              style={s.kymIconImage}
              contentFit="contain"
            />
          </View>
          <View style={s.kymTextCol}>
            <Text style={s.kymLabel}>
              Consume Type
            </Text>
            <Text style={s.kymValueGray}>
              {consumeType}
            </Text>
          </View>
        </View>

        <View style={s.kymRowLast}>
          <View style={[s.kymIconBox, s.kymDeliveryBox]}>
            <Image
              source={HOME_IMAGES.deliveryBox}
              style={s.kymIconImage}
              contentFit="contain"
            />
          </View>
          <View style={s.kymTextCol}>
            <Text style={s.kymLabel}>
              Return Policy
            </Text>
            <Text style={s.kymValueTeal}>
              {returnPolicy}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};
