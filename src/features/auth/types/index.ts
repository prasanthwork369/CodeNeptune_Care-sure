import { TextInput } from "react-native";

export interface LoginFormProps {
  phoneNumber: string;
  phoneError: string;
  error: string | null;
  onPhoneChange: (text: string) => void;
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  hintShieldVisible?: boolean;
  onHintPress?: () => void;
}

export interface LoginSubmitButtonProps {
  loading: boolean;
  onGetOtp: () => void;
  isValid: boolean;
}

export interface OtpFormProps {
  slots: string[];
  inputValue: string;
  otpError: string;
  error: string | null;
  loading: boolean;
  resendCooldown: number;
  activeIndex: number;
  onBoxPress: (index: number) => void;
  onOtpChange: (value: string) => void;
  onResend: () => void;
  onSubmitEditing?: () => void;
  inputRef: React.Ref<TextInput>;
}

export interface OtpSubmitButtonProps {
  loading: boolean;
  isValid: boolean;
  onVerify: () => void;
}

export * from "./signupBonus";
export * from "./api.types";
