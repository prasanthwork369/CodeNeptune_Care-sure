import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { PAYMENT_METHOD_LABELS } from "../../components/InvoiceModal";
import { Order } from "../../types";
import { SectionCard } from "./SectionCard";
import { styles as s } from "./tracking.styles";

interface PaymentMethodSectionProps {
  order: Order | null | undefined;
}

// "1"/"COD" both mean cash on delivery — everything else in the map was paid online.
const COD_KEYS = new Set(["1", "COD"]);

export function PaymentMethodSection({ order }: PaymentMethodSectionProps) {
  const rawPaymentMethod =
    order?.paymentMethod ?? order?.metadata?.paymentMethod ?? "";
  const key = String(rawPaymentMethod).toUpperCase();
  const methodLabel =
    PAYMENT_METHOD_LABELS[key] || String(rawPaymentMethod || "Not specified");
  const isCod = COD_KEYS.has(key);

  return (
    <SectionCard style={s.deliveryCard}>
      <Text style={s.sectionTitle}>
        Payment Method
      </Text>
      <View style={s.paymentMethodRow}>
        <View style={s.paymentIconBox}>
          <icons.credit_card
            width={exactScale(24)}
            height={exactScale(24)}
            fill="#0F7635"
          />
        </View>
        <View>
          <Text style={s.paymentTitle}>
            {methodLabel}
          </Text>
          <Text style={s.paymentSubtitle}>
            {isCod ? "Pay at delivery" : "Paid online"}
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}
