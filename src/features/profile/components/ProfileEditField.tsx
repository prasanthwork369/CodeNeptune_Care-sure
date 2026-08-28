import { exactScale } from "@/src/utils/exactScale";
import React from "react";
import {
  type KeyboardTypeOptions,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles as s } from "./ProfileEditField.styles";

export interface ProfileEditFieldProps {
  label: string;
  value: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  editable?: boolean;
  keyboardType?: KeyboardTypeOptions;
  error?: string;
  rightSlot?: React.ReactNode;
}

export const ProfileEditField: React.FC<ProfileEditFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  editable = true,
  keyboardType = "default",
  error,
  rightSlot,
}) => (
  <View style={s.container}>
    <Text style={s.label}>{label}</Text>
    <View
      style={[
        s.inputWrap,
        editable ? s.inputWrapEditable : s.inputWrapDisabled,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6A6A6A"
        editable={editable}
        keyboardType={keyboardType}
        cursorColor="#0F7635"
        caretHidden={false}
        style={[
          s.input,
          editable ? s.inputEditable : s.inputDisabled,
          { paddingRight: rightSlot ? exactScale(10) : 0 },
        ]}
      />
      {rightSlot}
    </View>
    {error ? <Text style={s.error}>{error}</Text> : null}
  </View>
);
