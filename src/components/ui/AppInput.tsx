import React, { useState } from "react";
import { TextInput, Text, View, TextInputProps, ViewStyle, TextStyle } from "react-native";

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
    <View className={`w-full mb-4 ${containerClassName}`} style={containerStyle}>
      {label && (
        <Text
          className={`font-inter-medium text-[#222222] text-sm mb-1.5 ${labelClassName}`}
          style={labelStyle}
        >
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-lg border px-3.5 py-3.5 bg-white ${
          hasError
            ? "border-[#DC2626]"
            : isFocused
            ? "border-[#0F7635]"
            : "border-[#919EAB33]"
        } ${!editable ? "bg-[#F9FAFB] opacity-60" : ""} ${inputContainerClassName}`}
        style={inputContainerStyle}
      >
        {leftIcon && <View className="mr-2.5 justify-center items-center">{leftIcon}</View>}
        <TextInput
          ref={ref}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#6A6A6A"
          className={`flex-1 font-inter text-[#222222] text-[15px] p-0 m-0 ${inputClassName}`}
          style={[{ textAlignVertical: "center" }, inputStyle]}
          {...props}
        />
        {rightIcon && <View className="ml-2.5 justify-center items-center">{rightIcon}</View>}
      </View>
      {hasError && (
        <Text
          className={`font-inter text-[#DC2626] text-xs mt-1.5 ${errorClassName}`}
          style={errorStyle}
        >
          {error}
        </Text>
      )}
    </View>
  );
});

AppInput.displayName = "AppInput";
