import { TextInput } from 'react-native';

export interface LoginFormProps {
    phoneNumber: string;
    phoneError: string;
    error: string | null;
    onPhoneChange: (text: string) => void;
    onPhoneFocus?: () => void;
}

export interface LoginSubmitButtonProps {
    loading: boolean;
    onGetOtp: () => void;
    isValid: boolean;
}

export interface OtpFormProps {
    otp: string;
    otpError: string;
    error: string | null;
    loading: boolean;
    resendCooldown: number;
    activeIndex: number;
    selection?: { start: number; end: number };
    onBoxPress: (index: number) => void;
    onOtpChange: (value: string) => void;
    onResend: () => void;
    inputRef: React.RefObject<TextInput | null>;
}
