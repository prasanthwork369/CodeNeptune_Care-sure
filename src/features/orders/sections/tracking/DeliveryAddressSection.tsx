import { Order } from "../../types";
import { format } from "@/src/utils/validation";
import React from "react";
import { Text, View } from "react-native";
import { SectionCard } from "./SectionCard";
import { styles as s } from "./tracking.styles";

interface DeliveryAddressSectionProps {
  address: Order["deliveryAddress"];
}

export function DeliveryAddressSection({
  address,
}: DeliveryAddressSectionProps) {
  return (
    <SectionCard style={s.deliveryCard}>
      <Text style={s.sectionTitle}>
        Deliver To
      </Text>
      {address ? (
        <View style={s.addressCol}>
          <Text style={s.addressName}>
            {address.name}
          </Text>
          <Text style={s.addressDetails}>
            {[address.line1, address.line2].filter(Boolean).join(", ")}
            {", "}
            {address.city},{"\n"}
            {address.state.toUpperCase()}, {address.pincode}
          </Text>
          <Text style={s.addressPhone}>
            Phone : {format.phone(address.phone)}
          </Text>
        </View>
      ) : (
        <Text style={s.emptyText}>
          —
        </Text>
      )}
    </SectionCard>
  );
}
