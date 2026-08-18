import { RETURN_STATUS_LABELS } from "../../constants/return-status";
import { Order } from "../../types";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Text, View } from "react-native";
import { SectionCard } from "./SectionCard";

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
    <SectionCard
      style={{
        paddingHorizontal: exactScale(16),
        paddingVertical: exactScale(16),
      }}
    >
      {!!returns?.length && (
        <Text
          className="font-inter-semibold text-brand-text"
          style={{ fontSize: moderateScale(14), marginBottom: exactScale(10) }}
        >
          Return Status
        </Text>
      )}
      <View style={{ gap: exactScale(8) }}>
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
              className="self-start rounded"
              style={{
                borderWidth: 1,
                borderColor: info.border,
                backgroundColor: info.bg,
                paddingHorizontal: exactScale(10),
                paddingVertical: exactScale(6),
              }}
            >
              <Text
                className="font-inter-bold tracking-[0.5px]"
                style={{ fontSize: moderateScale(11), color: info.text }}
              >
                {info.label}
              </Text>
            </View>
          );
        })}
      </View>
      {showWindowExpiredMessage && (
        <Text
          className="font-inter-medium text-brand-subtext"
          style={{ fontSize: moderateScale(12) }}
        >
          The return window for this order has expired.
        </Text>
      )}
    </SectionCard>
  );
}
