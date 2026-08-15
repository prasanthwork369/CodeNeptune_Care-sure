import { TextInput } from "react-native";

export interface LoginFormProps {
  phoneNumber: string;
  phoneError: string;
  error: string | null;
  onPhoneChange: (text: string) => void;
  inputRef?: React.RefObject<TextInput | null>;
  /** Transparent overlay that spends the first tap on the number hint. */
  hintShieldVisible?: boolean;
  onHintPress?: () => void;
}

export interface LoginSubmitButtonProps {
  loading: boolean;
  onGetOtp: () => void;
  isValid: boolean;
}

export interface OtpFormProps {
  /** One entry per box; "" renders an empty box. */
  slots: string[];
  /** Text held by the hidden input — filled digits only. */
  inputValue: string;
  otpError: string;
  error: string | null;
  loading: boolean;
  resendCooldown: number;
  activeIndex: number;
  onBoxPress: (index: number) => void;
  onOtpChange: (value: string) => void;
  onResend: () => void;
  inputRef: React.Ref<TextInput>;
}
