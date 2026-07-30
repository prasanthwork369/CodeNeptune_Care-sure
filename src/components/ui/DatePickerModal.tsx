import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Touchable } from '@/src/components/ui/Touchable';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import { exactScale, moderateScale } from '@/src/utils/exactScale';

interface DatePickerModalProps {
  visible: boolean;
  value: Date;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'spinner' | 'inline' | 'default' | 'compact';
  onClose: () => void;
  onChange: (date: Date) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  visible,
  value,
  minimumDate,
  maximumDate,
  mode = 'date',
  display = 'spinner',
  onClose,
  onChange,
}) => {
  const [tempDate, setTempDate] = React.useState<Date>(value);
  const [androidStep, setAndroidStep] = React.useState<'date' | 'time' | 'none'>('none');

  React.useEffect(() => {
    if (visible) {
      setTempDate(value);
      if (Platform.OS === 'android' && mode === 'datetime') {
        setAndroidStep('date');
      } else {
        setAndroidStep('none');
      }
    }
  }, [visible, value, mode]);

  if (Platform.OS === 'ios') {
    return (
      <GorhomBottomSheet
        isVisible={visible}
        onClose={onClose}
        stackBehavior="push"
        backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: exactScale(12), borderTopRightRadius: exactScale(12) }}
      >
        <BottomSheetView style={{ paddingHorizontal: exactScale(20), paddingTop: exactScale(16), paddingBottom: exactScale(32) }}>
          <View style={s.header}>
            <Touchable onPress={onClose}>
              <Text style={s.cancelText}>Cancel</Text>
            </Touchable>
            <Text style={s.title}>Select Date & Time</Text>
            <Touchable onPress={() => {
              onChange(tempDate);
              onClose();
            }}>
              <Text style={s.doneText}>Done</Text>
            </Touchable>
          </View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <DateTimePicker
              value={tempDate}
              mode={mode}
              display={display}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              textColor="#111827"
              onChange={(_, selected) => {
                if (selected) {
                  setTempDate(selected);
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

  if (mode === 'datetime') {
    if (androidStep === 'date') {
      return (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={(_, selected) => {
            if (selected) {
              setTempDate(selected);
              setAndroidStep('time');
            } else {
              onClose();
            }
          }}
        />
      );
    } else if (androidStep === 'time') {
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
              onChange(combined);
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
          onChange(selected);
        }
      }}
    />
  );
};

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: exactScale(16),
  },
  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: '500',
    color: '#6B7280',
  },
  title: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: '#111827',
  },
  doneText: {
    fontSize: moderateScale(15),
    fontWeight: '600',
    color: '#0F7635',
  },
});
