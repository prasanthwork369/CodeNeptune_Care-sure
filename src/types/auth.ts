import { TextInput } from 'react-native';

export interface LoginFormProps {
    phoneNumber: string;
    phoneError: string;
    error: string | null;
    loading: boolean;
    onPhoneChange: (text: string) => void;
    onPhoneFocus?: () => void;
    onGetOtp: () => void;
    isValid: boolean;
}

export interface OtpFormProps {
    otp: string[];
    otpError: string;
    error: string | null;
    loading: boolean;
    resendCooldown: number;
    onOtpChange: (value: string, index: number) => void;
    onKeyPress: (e: any, index: number) => void;
    onResend: () => void;
    onVerify: () => void;
    isValid: boolean;
    inputRefs: React.MutableRefObject<(TextInput | null)[]>;
}
