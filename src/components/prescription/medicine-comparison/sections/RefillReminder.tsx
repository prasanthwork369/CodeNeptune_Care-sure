import { CustomSwitch } from "@/src/components/ui/CustomSwitch";
import { HOME_IMAGES } from "@/src/constants/images";
import React from "react";
import { Image, Text, View } from "react-native";

interface RefillReminderProps {
  value: boolean;
  onToggle: (v: boolean) => void;
}

export const RefillReminder: React.FC<RefillReminderProps> = ({
  value,
  onToggle,
}) => (
  <View
    style={{
      marginHorizontal: 16,
      marginTop: 12,
      backgroundColor: "#fff",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#919EAB33",
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: value ? 10 : 14,
    }}
  >
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Image
        source={HOME_IMAGES.clockIcon}
        style={{ width: 36, height: 36 }}
        resizeMode="contain"
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{ fontSize: 14, fontFamily: "Inter-Bold", color: "#111827" }}
        >
          Refill Reminder
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontFamily: "Inter-Medium",
            color: "#6B7280",
            marginTop: 2,
          }}
        >
          Never miss your medicines
        </Text>
      </View>
      <CustomSwitch value={value} onValueChange={onToggle} />
    </View>
    {value && (
      <Text
        style={{
          fontSize: 12,
          fontFamily: "Inter-Medium",
          color: "#6B7280",
          marginTop: 10,
        }}
      >
        We'll send your reminder in 7 days
      </Text>
    )}
  </View>
);
