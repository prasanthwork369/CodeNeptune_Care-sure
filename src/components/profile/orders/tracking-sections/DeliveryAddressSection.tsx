import { Order } from "@/src/types/order";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { format } from "@/src/utils/validation";
import React from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../orders.styles";
import { SectionCard } from "./SectionCard";

interface DeliveryAddressSectionProps {
  address: Order["deliveryAddress"];
}

export function DeliveryAddressSection({
  address,
}: DeliveryAddressSectionProps) {
  return (
    <SectionCard
      style={{
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(16),
      }}
    >
      <Text
        className="font-inter-semibold text-brand-text"
        style={{ fontSize: moderateScale(14), marginBottom: exactScale(12) }}
      >
        Deliver To
      </Text>
      {address ? (
        <View style={{ gap: exactScale(2) }}>
          <Text style={s.labelSm} className="font-inter-bold text-brand-text">
            {address.name}
          </Text>
          <Text
            style={[
              s.labelSm,
              { lineHeight: moderateScale(18), marginTop: exactScale(4) },
            ]}
            className="font-inter text-brand-subtext"
          >
            {[address.line1, address.line2].filter(Boolean).join(", ")}
            {", "}
            {address.city},{"\n"}
            {address.state.toUpperCase()}, {address.pincode}
          </Text>
          <Text style={s.labelSm} className="font-inter text-brand-subtext">
            Phone : {format.phone(address.phone)}
          </Text>
        </View>
      ) : (
        <Text style={s.labelSm} className="font-inter text-brand-subtext">
          —
        </Text>
      )}
    </SectionCard>
  );
}
