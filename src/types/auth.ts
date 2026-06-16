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
    otp: string[];
    otpError: string;
    error: string | null;
    loading: boolean;
    resendCooldown: number;
    onOtpChange: (value: string, index: number) => void;
    onKeyPress: (e: any, index: number) => void;
    onResend: () => void;
    inputRefs: React.MutableRefObject<(TextInput | null)[]>;
}
