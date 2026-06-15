import React, { useState } from 'react';
import { View, TextInput, Text, ActivityIndicator } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { LoginFormProps } from '@/src/types/auth';
import { styles as s } from './LoginForm.styles';

export const LoginForm: React.FC<LoginFormProps> = ({
    phoneNumber,
    phoneError,
    error,
    loading,
    onPhoneChange,
    onPhoneFocus,
    onGetOtp,
    isValid,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View>
            <View
                className="flex-row items-center rounded-lg px-4 bg-white"
                style={[s.inputWrap, { borderWidth: 1, borderColor: phoneError ? '#EF4444' : isFocused ? '#0F7635' : '#919EAB22' }]}
            >
                <Text style={s.prefix}>+91</Text>
                <View style={{ width: 1, height: 20, backgroundColor: '#919EAB', marginHorizontal: 10 }} />
                <TextInput
                    placeholder="Enter your mobile number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    accessibilityLabel="Mobile number"
                    className="flex-1 font-inter-regular text-brand-text"
                    style={s.input}
                    cursorColor="#0F7635"
                    value={phoneNumber}
                    onChangeText={onPhoneChange}
                    onFocus={() => { setIsFocused(true); onPhoneFocus?.(); }}
                    onBlur={() => setIsFocused(false)}
                />
            </View>

            {(phoneError || error) ? (
                <Text style={s.error}>{phoneError || error}</Text>
            ) : null}

            <Touchable
                activeOpacity={0.8}
                onPress={onGetOtp}
                disabled={loading || !isValid}
                accessibilityRole="button"
                accessibilityLabel="Get OTP"
                className="bg-brand-primary rounded-lg items-center justify-center flex-row"
                style={[s.btn, { opacity: loading || !isValid ? 0.6 : 1 }]}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <>
                        <Text style={s.btnText}>Get OTP</Text>
                        <icons.arrow_forward_white width={s.arrow.width} height={s.arrow.height} fill="#ffffff" />
                    </>
                )}
            </Touchable>
        </View>
    );
};
