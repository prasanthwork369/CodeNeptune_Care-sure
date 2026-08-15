import { icons } from "@/src/constants/icons";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { orderStyles as s } from "../../orders.styles";
import { PAYMENT_METHOD_LABELS } from "../../components/InvoiceModal";
import { Order } from "../../types";
import { SectionCard } from "./SectionCard";

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
        Payment Method
      </Text>
      <View className="flex-row items-center" style={{ gap: exactScale(12) }}>
        <View
          className="items-center justify-center bg-[#FFFFFF]"
          style={{ width: exactScale(40), height: exactScale(40) }}
        >
          <icons.credit_card
            width={exactScale(24)}
            height={exactScale(24)}
            fill="#0F7635"
          />
        </View>
        <View>
          <Text
            style={s.labelMd}
            className="font-inter-semibold text-brand-text"
          >
            {methodLabel}
          </Text>
          <Text
            style={s.labelSm}
            className="font-inter-medium text-brand-subtext"
          >
            {isCod ? "Pay at delivery" : "Paid online"}
          </Text>
        </View>
      </View>
    </SectionCard>
  );
}
