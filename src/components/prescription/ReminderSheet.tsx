import { icons } from "@/src/constants/icons";
import { ANIMATIONS } from "@/src/constants/images";
import { DotLottie } from "@lottiefiles/dotlottie-react-native";
import { Touchable } from "@/src/components/ui/Touchable";
import { DatePickerModal } from "@/src/components/ui/DatePickerModal";
import { ReminderFrequencyDays, ReminderInput } from "@/src/types/prescription";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { moderateScale } from "@/src/utils/exactScale";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ReminderSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm?: (input: ReminderInput) => void;
}

const DAY_OPTIONS: ReminderFrequencyDays[] = [7, 14, 21, 30];

const addDays = (days: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// The backend only accepts a day-count, so a picked calendar date is
// converted to "days from today" before it's sent — never sent as a date.
const daysFromToday = (target: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = new Date(target);
  day.setHours(0, 0, 0, 0);
  return Math.max(1, Math.round((day.getTime() - today.getTime()) / MS_PER_DAY));
};

export const ReminderSheet: React.FC<ReminderSheetProps> = ({
  isVisible,
  onClose,
  onConfirm,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedDays, setSelectedDays] =
    useState<ReminderFrequencyDays | null>(14);
  const [customDate, setCustomDate] = useState<Date>(addDays(14));
  const [showPicker, setShowPicker] = useState(false);

  const handleConfirm = () => {
    let input: ReminderInput;
    if (selectedDays !== null) {
      input = { frequencyDays: selectedDays };
    } else {
      // Ensure custom date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const validDate = customDate < today ? new Date() : customDate;
      input = { frequencyDays: daysFromToday(validDate) };
    }
    onConfirm?.(input);
    onClose();
  };

  const handleCustomPress = () => {
    setSelectedDays(null);
    setShowPicker(true);
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 items-center justify-center px-4">
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Card */}
        <View
          className="bg-white rounded-3xl w-full overflow-hidden"
          style={{
            maxHeight: Math.max(
              0,
              screenHeight - insets.top - insets.bottom - 32,
            ),
          }}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
          >
            <View className="items-center mb-4">
              <DotLottie
                source={ANIMATIONS.calendar}
                autoplay
                loop
                style={{ width: 180, height: 180 }}
              />
            </View>

            <Text
              className="font-inter-bold text-brand-text text-center mb-1"
              style={{ fontSize: moderateScale(18) }}
            >
              {"We'll remind you at the right time"}
            </Text>

            <Text
              className="font-inter-medium text-brand-subtext text-center mb-5"
              style={{ fontSize: moderateScale(13) }}
            >
              When should we remind you
            </Text>

            {/* Day chips */}
            <View className="flex-row justify-between mb-5" style={{ gap: 5 }}>
              {DAY_OPTIONS.map((day) => {
                const isSelected = selectedDays === day;
                return (
                  <Touchable
                    key={day}
                    onPress={() => {
                      setSelectedDays(day);
                      setShowPicker(false);
                    }}
                    activeOpacity={0.8}
                    className="flex-1 py-2 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? "#0F7635" : "#FFFFFF",
                      borderWidth: 1,
                      borderColor: isSelected ? "#0F7635" : "#919EAB33",
                    }}
                  >
                    <Text
                      className="font-inter-semibold"
                      style={{
                        color: isSelected ? "#FFFFFF" : "#222222",
                        fontSize: moderateScale(13),
                      }}
                    >
                      {day} D
                    </Text>
                  </Touchable>
                );
              })}

              {/* Custom chip */}
              <Touchable
                onPress={handleCustomPress}
                activeOpacity={0.8}
                className="flex-1 py-2.5 px-1 rounded-full items-center justify-center"
                style={{
                  backgroundColor:
                    selectedDays === null ? "#0F7635" : "#FFFFFF",
                  borderWidth: 1,
                  borderColor: selectedDays === null ? "#0F7635" : "#919EAB33",
                }}
              >
                <Text
                  className="font-inter-semibold"
                  style={{
                    color: selectedDays === null ? "#FFFFFF" : "#222222",
                    fontSize: moderateScale(13),
                  }}
                >
                  Custom
                </Text>
              </Touchable>
            </View>

            {/* inline=true skips GorhomBottomSheet — safe inside a <Modal> */}
            <DatePickerModal
              visible={showPicker}
              value={customDate}
              minimumDate={new Date()}
              mode="date"
              display="inline"
              inline
              onClose={() => setShowPicker(false)}
              onChange={(date) => {
                setCustomDate(date);
                setShowPicker(false);
              }}
            />

            {/* Info banner */}
            <View
              className="flex-row items-center rounded-full px-4 py-2.5"
              style={{ backgroundColor: "#ECFDF5" }}
            >
              <icons.verified_user_outline width={16} height={16} />
              <Text
                className="font-inter-medium text-[#0F7635] pl-1 flex-1"
                style={{ fontSize: moderateScale(12) }}
              >
                {"You focus on feeling better, we'll handle the rest"}
              </Text>
            </View>
          </ScrollView>

          {/* CTA */}
          <View
            style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 }}
          >
            <Touchable
              activeOpacity={0.85}
              onPress={handleConfirm}
              className="bg-[#0F7635] rounded-xl py-4 items-center"
            >
              <Text
                className="font-inter-semibold text-white"
                style={{ fontSize: moderateScale(16) }}
              >
                Yes, Remind me
              </Text>
            </Touchable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
