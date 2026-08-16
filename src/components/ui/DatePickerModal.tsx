import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Touchable } from "@/src/components/ui/Touchable";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { colors } from "@/src/constants/theme";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: "date" | "time" | "datetime";
  display?: "spinner" | "inline" | "default" | "compact";
  /** Render the picker inline without a GorhomBottomSheet wrapper.
   * Use this when the caller is already inside a <Modal> to avoid
   * a native modal-on-modal crash on iOS. */
  inline?: boolean;
  onClose: () => void;
  onChange: (date: Date) => void;
}

const clampDate = (date: Date, min?: Date, max?: Date): Date => {
  let res = date;
  if (min && res < min) res = min;
  if (max && res > max) res = max;
  return res;
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  minimumDate,
  maximumDate,
  mode = "date",
  display = "spinner",
  inline = false,
  onClose,
  onChange,
}) => {
  const [tempDate, setTempDate] = React.useState<Date>(value);
  const [androidStep, setAndroidStep] = React.useState<
    "date" | "time" | "none"
  >("none");

  React.useEffect(() => {
    if (visible) {
      setTempDate(clampDate(value, minimumDate, maximumDate));
      if (Platform.OS === "android" && mode === "datetime") {
        setAndroidStep("date");
      } else {
        setAndroidStep("none");
      }
    }
  }, [visible, value, mode, minimumDate, maximumDate]);

  if (Platform.OS === "ios") {
    // inline=true: caller is inside a <Modal>; skip the GorhomBottomSheet
    // wrapper to avoid a native modal-on-modal crash on iOS.
    if (inline) {
      if (!visible) return null;
      return (
        <View
          style={{
            alignItems: "center",
            backgroundColor: "#FFFFFF",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <DateTimePicker
            value={tempDate}
            mode={mode}
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            themeVariant="light"
            textColor="#111827"
            accentColor={colors.primary}
            style={{ backgroundColor: "#FFFFFF" }}
            onChange={(_, selected) => {
              if (selected) {
                const validated = clampDate(selected, minimumDate, maximumDate);
                onChange(validated);
                onClose();
              }
            }}
          />
        </View>
      );
    }

    return (
      <GorhomBottomSheet
        isVisible={visible}
        onClose={onClose}
        stackBehavior="push"
        backgroundStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: exactScale(12),
          borderTopRightRadius: exactScale(12),
        }}
      >
        <BottomSheetView
          style={{
            paddingHorizontal: exactScale(20),
            paddingTop: exactScale(16),
            paddingBottom: exactScale(32),
          }}
        >
          <View style={s.header}>
            <Touchable onPress={onClose}>
              <Text style={s.cancelText}>Cancel</Text>
            </Touchable>
            <Text style={s.title}>Select Date & Time</Text>
            <Touchable
              onPress={() => {
                const validated = clampDate(tempDate, minimumDate, maximumDate);
                onChange(validated);
                onClose();
              }}
            >
              <Text style={s.doneText}>Done</Text>
            </Touchable>
          </View>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display={display}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant="light"
              textColor="#111827"
              onChange={(_, selected) => {
                if (selected) {
                  setTempDate(clampDate(selected, minimumDate, maximumDate));
                }
              }}
            />
          </View>
        </BottomSheetView>
      </GorhomBottomSheet>
    );
  }

  // Android: render DateTimePicker inline (it opens a native dialog)
  if (!visible) return null;

  if (mode === "datetime") {
    if (androidStep === "date") {
      return (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selected) => {
            if (selected) {
              setTempDate(clampDate(selected, minimumDate, maximumDate));
              setAndroidStep("time");
            } else {
              onClose();
            }
          }}
        />
      );
    } else if (androidStep === "time") {
      return (
        <DateTimePicker
          value={tempDate}
          mode="time"
          display="default"
          onChange={(_, selected) => {
            onClose();
            if (selected) {
              const combined = new Date(tempDate);
              combined.setHours(selected.getHours());
              combined.setMinutes(selected.getMinutes());
              onChange(clampDate(combined, minimumDate, maximumDate));
            }
          }}
        />
      );
    }
    return null;
  }

  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display="default"
      minimumDate={minimumDate}
      maximumDate={maximumDate}
      onChange={(_, selected) => {
        onClose();
        if (selected) {
          onChange(clampDate(selected, minimumDate, maximumDate));
        }
      }}
    />
  );
};

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: exactScale(16),
  },
  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: "500",
    color: "#6B7280",
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: "700",
    color: "#111827",
  },
  doneText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: colors.primary,
  },
});
