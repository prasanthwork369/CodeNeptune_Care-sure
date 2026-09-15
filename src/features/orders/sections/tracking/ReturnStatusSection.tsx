import { RETURN_STATUS_LABELS } from "../../constants/return-status";
import { Order } from "../../types";
import { useReturnDetail } from "../../hooks/useReturnDetail";
import { exactScale } from "@/src/utils/exactScale";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SectionCard } from "./SectionCard";
import { styles as s } from "./tracking.styles";

interface ReturnStatusSectionProps {
  returns: Order["returns"];
  showWindowExpiredMessage?: boolean;
}

type ReturnEntry = NonNullable<Order["returns"]>[number];

// One row owns its own detail fetch (gated by `expanded`) so tapping a
// return only fetches that return's reason, not every return on the order.
function ReturnStatusRow({
  entry,
  expanded,
  onToggle,
}: {
  entry: ReturnEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const info = RETURN_STATUS_LABELS[entry.status] ?? {
    label: "Return",
    bg: "#F3F4F6",
    text: "#6B7280",
    border: "#E5E7EB",
  };
  const { returnDetail, loading } = useReturnDetail(entry.id, expanded);

  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={[
          s.returnStatusBadge,
          {
            borderColor: info.border,
            backgroundColor: info.bg,
          },
        ]}
      >
        <Text style={[s.returnStatusBadgeText, { color: info.text }]}>
          {info.label}
        </Text>
      </Pressable>
      {expanded && (
        <View style={s.returnReasonBox}>
          {loading && <ActivityIndicator size="small" />}
          {!loading && returnDetail?.items?.length
            ? returnDetail.items.map((item) => (
                <Text key={item.orderItemId} style={s.returnReasonText}>
                  {item.name}: {item.reason}
                  {item.details ? ` — ${item.details}` : ""}
                </Text>
              ))
            : null}
          {!loading && !returnDetail?.items?.length && (
            <Text style={s.returnReasonText}>No reason on record.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export function ReturnStatusSection({
  returns,
  showWindowExpiredMessage,
}: ReturnStatusSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
        {returns?.map((r) => (
          <ReturnStatusRow
            key={r.id}
            entry={r}
            expanded={expandedId === r.id}
            onToggle={() =>
              setExpandedId((id) => (id === r.id ? null : r.id))
            }
          />
        ))}
      </View>
      {showWindowExpiredMessage && (
        <Text style={s.windowExpiredText}>
          The return window for this order has expired.
        </Text>
      )}
    </SectionCard>
  );
}
