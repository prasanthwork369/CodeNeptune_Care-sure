import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../orders.styles";
import { SectionCard } from "./SectionCard";

interface PrescriptionSectionProps {
  onViewRx: () => void;
}

export function PrescriptionSection({ onViewRx }: PrescriptionSectionProps) {
  return (
    <SectionCard
      style={{
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(16),
        marginBottom: exactScale(4),
      }}
    >
      <Text
        style={[s.labelMd, { color: "#0F1724", marginBottom: exactScale(12) }]}
        className="font-inter-semibold"
      >
        Prescription Details
      </Text>
      <View className="flex-row items-center justify-between">
        <View
          className="flex-1 flex-row items-center"
          style={{ gap: exactScale(12), marginRight: exactScale(8) }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: exactScale(1),
              borderColor: "#919EAB33",
              width: exactScale(40),
              height: exactScale(40),
              borderRadius: exactScale(4),
            }}
            className="items-center justify-center"
          >
            <icons.prescription_green
              width={exactScale(22)}
              height={exactScale(22)}
            />
          </View>
          <View className="flex-1">
            <Text style={s.labelSm} className="font-inter-bold text-[#0F1724]">
              Prescription Attached
            </Text>
            <View
              className="flex-row items-center"
              style={{ gap: exactScale(4), marginTop: exactScale(2) }}
            >
              <icons.verified_user_round
                width={exactScale(14)}
                height={exactScale(14)}
              />
              <Text
                style={s.labelSm}
                className="font-inter-medium text-[#16A34A]"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Verified by our Pharmacist
              </Text>
            </View>
          </View>
        </View>
        <Touchable
          onPress={onViewRx}
          style={{
            backgroundColor: "#FFFFFF",
            borderWidth: exactScale(1),
            borderColor: "#00000014",
            borderRadius: exactScale(6),
            paddingHorizontal: exactScale(16),
            paddingVertical: exactScale(6),
          }}
          activeOpacity={0.5}
        >
          <Text
            style={s.labelSm}
            className="font-inter-semibold text-[#0F1724]"
          >
            View Rx
          </Text>
        </Touchable>
      </View>
    </SectionCard>
  );
}
