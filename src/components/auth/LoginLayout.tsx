import { useAuth } from '@/src/hooks/mutations/useAuth';
import { sanitize, validate } from '@/src/utils/validation';
import { useNav } from '@/src/hooks/useNav';
import { getPhoneNumberHint, normalizeIndianPhone } from '@/src/modules/PhoneNumberHint';
import React, { useRef, useState } from 'react';
import { Keyboard, Text, View } from 'react-native';
import { styles as s } from './LoginLayout.styles';
import { AuthFooter } from './sections/AuthFooter';
import { AuthScreenShell } from './sections/AuthScreenShell';
import { LoginForm } from './sections/LoginForm';
import { LoginSubmitButton } from './sections/LoginSubmitButton';

export const LoginLayout: React.FC = () => {
    const router = useNav();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const { requestOtp, loading, error } = useAuth();
    const hintInProgress = useRef(false);

    const handleChangeText = (text: string) => {
        const cleaned = sanitize.phone(text);
        setPhoneNumber(cleaned);
        if (cleaned.length > 0) {
            const result = validate.phone(cleaned);
            setPhoneError(result.valid ? '' : result.message);
        } else {
            setPhoneError('');
        }
    };

    const handlePhoneFocus = async () => {
        // Only show picker on first focus when input is empty
        if (phoneNumber.length > 0 || hintInProgress.current) return;
        hintInProgress.current = true;
        try {
            const raw = await getPhoneNumberHint();
            if (raw) {
                const digits = normalizeIndianPhone(raw);
                if (digits.length === 10) {
                    handleChangeText(digits);
                    Keyboard.dismiss();
                }
            }
        } finally {
            hintInProgress.current = false;
        }
    };

    const handleGetOtp = async () => {
        const result = validate.phone(phoneNumber);
        if (!result.valid) { setPhoneError(result.message); return; }
        Keyboard.dismiss();
        try {
            const formattedPhone = `+91${phoneNumber}`;
            const res = await requestOtp(formattedPhone);
            router.push({
                pathname: '/otp',
                params: { phone: formattedPhone, prefillOtp: res?.data?.otp ?? '' },
            });
        } catch {
            // error state is set by the hook
        }
    };

    return (
        <AuthScreenShell
            onSkip={() => router.replace('/(tabs)')}
            footer={
                <>
                    <View className="items-center" style={{ marginBottom: 16 }}>
                        <Text style={s.title} className="font-inter-extrabold text-brand-text text-center">
                            Why pay more for the{'\n'}same medicine?
                        </Text>
                    </View>
                    <LoginForm
                        phoneNumber={phoneNumber}
                        phoneError={phoneError}
                        error={error}
                        onPhoneChange={handleChangeText}
                        onPhoneFocus={handlePhoneFocus}
                    />
                    <LoginSubmitButton
                        loading={loading}
                        onGetOtp={handleGetOtp}
                        isValid={validate.phone(phoneNumber).valid}
                    />
                    <AuthFooter />
                </>
            }
        />
    );
};
