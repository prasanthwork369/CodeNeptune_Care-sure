import React, { useState } from "react";
import { TextInput, Text, View, TextInputProps, ViewStyle, TextStyle } from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  inputContainerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  inputClassName?: string;
  containerStyle?: ViewStyle;
  inputContainerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  inputStyle?: TextStyle;
}

export const AppInput = React.forwardRef<TextInput, AppInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  containerClassName = "",
  inputContainerClassName = "",
  labelClassName = "",
  errorClassName = "",
  inputClassName = "",
  containerStyle,
  inputContainerStyle,
  labelStyle,
  errorStyle,
  inputStyle,
  editable = true,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = !!error;

  return (
    <View className={`w-full ${containerClassName}`} style={[{ marginBottom: exactScale(16) }, containerStyle]}>
      {label && (
        <Text
          className={`font-inter-medium text-[#222222] ${labelClassName}`}
          style={[{ fontSize: moderateScale(14), marginBottom: exactScale(6) }, labelStyle]}
        >
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center border bg-white ${
          hasError
            ? "border-[#DC2626]"
            : isFocused
            ? "border-[#0F7635]"
            : "border-[#919EAB33]"
        } ${!editable ? "bg-[#F9FAFB] opacity-60" : ""} ${inputContainerClassName}`}
        style={[
          {
            height: exactScale(48),
            borderRadius: exactScale(8),
            paddingHorizontal: exactScale(14),
          },
          inputContainerStyle,
        ]}
      >
        {leftIcon && <View style={{ marginRight: exactScale(10) }} className="justify-center items-center">{leftIcon}</View>}
        <TextInput
          ref={ref}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#6A6A6A"
          className={`flex-1 font-inter text-[#222222] p-0 m-0 ${inputClassName}`}
          style={[
            {
              textAlignVertical: "center",
              fontSize: moderateScale(15),
              height: "100%",
            },
            inputStyle,
          ]}
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: exactScale(10) }} className="justify-center items-center">{rightIcon}</View>}
      </View>
      {hasError && (
        <Text
          className={`font-inter text-[#DC2626] ${errorClassName}`}
          style={[{ fontSize: moderateScale(12), marginTop: exactScale(6) }, errorStyle]}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

AppInput.displayName = "AppInput";
