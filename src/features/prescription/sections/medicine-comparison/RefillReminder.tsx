import { CustomSwitch } from "@/src/components/ui/CustomSwitch";
import { HOME_IMAGES } from "@/src/constants/images";
import React from "react";
import { Image, Text, View } from "react-native";
import { formatReminderDate } from "@/src/utils/reminderDate";
import { styles as s } from "./medicine-comparison.styles";

interface RefillReminderProps {
  value: boolean;
  onToggle: (v: boolean) => void;
  reminderDate?: Date | null;
}

export const RefillReminder: React.FC<RefillReminderProps> = ({
  value,
  onToggle,
  reminderDate,
}) => (
  <View
    style={[
      s.refillReminderRoot,
      { paddingBottom: value ? 10 : 14 },
    ]}
  >
    <View style={s.refillHeaderRow}>
      <Image
        source={HOME_IMAGES.clockIcon}
        style={s.clockIcon}
        resizeMode="contain"
      />
      <View style={s.refillTextCol}>
        <Text style={s.refillTitle}>
          Refill Reminder
        </Text>
        <Text style={s.refillSubtitle}>
          Never miss your medicines
        </Text>
      </View>
      <CustomSwitch value={value} onValueChange={onToggle} />
    </View>
    {value && (
      <Text style={s.refillNote}>
        {reminderDate
          ? `We'll remind you on ${formatReminderDate(reminderDate)}`
          : "We'll remind you at the time you set"}
      </Text>
    )}
  </View>
);
