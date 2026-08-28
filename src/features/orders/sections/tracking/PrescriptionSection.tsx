import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { SectionCard } from "./SectionCard";
import { styles as s } from "./tracking.styles";

interface PrescriptionSectionProps {
  onViewRx: () => void;
}

export function PrescriptionSection({ onViewRx }: PrescriptionSectionProps) {
  return (
    <SectionCard
      style={[
        s.deliveryCard,
        { marginBottom: exactScale(4) },
      ]}
    >
      <Text style={s.rxSectionTitle}>
        Prescription Details
      </Text>
      <View style={s.rxCardRow}>
        <View style={s.rxDetailsRow}>
          <View style={s.rxIconBox}>
            <icons.prescription_green
              width={exactScale(22)}
              height={exactScale(22)}
            />
          </View>
          <View style={s.rxTextCol}>
            <Text style={s.rxAttachedTitle}>
              Prescription Attached
            </Text>
            <View style={s.rxVerifiedRow}>
              <icons.verified_user_round
                width={exactScale(14)}
                height={exactScale(14)}
              />
              <Text
                style={s.rxVerifiedText}
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
          style={s.viewRxBtn}
          activeOpacity={0.5}
        >
          <Text style={s.viewRxBtnText}>
            View Rx
          </Text>
        </Touchable>
      </View>
    </SectionCard>
  );
}
