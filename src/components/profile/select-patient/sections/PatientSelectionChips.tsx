import { PatientChipSkeleton } from "@/src/components/profile/patients/PatientSkeleton";
import { PatientSelectionChipsProps } from "@/src/types/patient";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { ScrollView, Text, View } from "react-native";

export const PatientSelectionChips: React.FC<PatientSelectionChipsProps> = ({
  members,
  selectedId,
  onSelect,
  loading,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: 16 }}
    >
      <View className="flex-row pr-1" style={{ gap: 8 }}>
        {loading ? (
          <PatientChipSkeleton />
        ) : members.length === 0 ? (
          <Text className="text-[12px] font-inter text-[#919EAB] py-2">
            No patients yet. Tap &quot;ADD PATIENT&quot;
          </Text>
        ) : (
          members.map((p) => {
            const sel = selectedId === p.id;
            return (
              <Touchable
                key={p.id}
                onPress={() => onSelect(p.id)}
                activeOpacity={0.8}
                className="px-[14px] py-[9px] rounded-md border"
                style={{
                  borderColor: sel ? "#0F7635" : "#E0E0E0",
                  backgroundColor: sel ? "#0F7635" : "#fff",
                }}
              >
                <Text
                  className="text-[13px] font-inter-medium"
                  style={{ color: sel ? "#FFFFFF" : "#6A6A6A" }}
                >
                  {p.name}{" "}
                  <Text className="font-inter">({p.relationship})</Text>
                </Text>
              </Touchable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};
