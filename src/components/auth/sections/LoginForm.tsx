import React, { useState } from 'react';
import { View, TextInput, Text } from 'react-native';
import { LoginFormProps } from '@/src/types/auth';
import { styles as s } from './LoginForm.styles';

export const LoginForm: React.FC<LoginFormProps> = ({
    phoneNumber,
    phoneError,
    error,
    onPhoneChange,
    onPhoneFocus,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View>
            <View
                className="flex-row items-center rounded-lg px-4 bg-white"
                style={[s.inputWrap, { borderWidth: 0.75, borderColor: phoneError ? '#EF4444' : isFocused ? '#0F7635' : '#919EAB33' }]}
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
                    className="flex-1 font-inter-normal text-brand-text"
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
        </View>
    );
};
