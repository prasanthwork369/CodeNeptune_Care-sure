import { RETURN_STATUS_LABELS } from "../../constants/return-status";
import { Order } from "../../types";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { SectionCard } from "./SectionCard";
import { styles as s } from "./tracking.styles";

interface ReturnStatusSectionProps {
  returns: Order["returns"];
  showWindowExpiredMessage?: boolean;
}

export function ReturnStatusSection({
  returns,
  showWindowExpiredMessage,
}: ReturnStatusSectionProps) {
  if (!returns?.length && !showWindowExpiredMessage) return null;

  return (
    <SectionCard style={s.deliveryCard}>
      {!!returns?.length && (
        <Text
          style={[
            s.sectionTitle,
            { marginBottom: exactScale(10) },
          ]}
        >
          Return Status
        </Text>
      )}
      <View style={s.returnStatusList}>
        {returns?.map((r) => {
          const info = RETURN_STATUS_LABELS[r.status] ?? {
            label: "Return",
            bg: "#F3F4F6",
            text: "#6B7280",
            border: "#E5E7EB",
          };
          return (
            <View
              key={r.id}
              style={[
                s.returnStatusBadge,
                {
                  borderColor: info.border,
                  backgroundColor: info.bg,
                },
              ]}
            >
              <Text
                style={[
                  s.returnStatusBadgeText,
                  { color: info.text },
                ]}
              >
                {info.label}
              </Text>
            </View>
          );
        })}
      </View>
      {showWindowExpiredMessage && (
        <Text style={s.windowExpiredText}>
          The return window for this order has expired.
        </Text>
      )}
    </SectionCard>
  );
}
