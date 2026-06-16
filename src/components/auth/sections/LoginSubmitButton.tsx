import React from 'react';
import { ActivityIndicator, Text } from 'react-native';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { LoginSubmitButtonProps } from '@/src/types/auth';
import { styles as s } from './LoginForm.styles';

export const LoginSubmitButton: React.FC<LoginSubmitButtonProps> = ({
    loading,
    onGetOtp,
    isValid,
}) => {
    return (
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
                    <icons.arrow_forward_white
                        width={s.arrow.width}
                        height={s.arrow.height}
                        fill="#ffffff"
                    />
                </>
            )}
        </Touchable>
    );
};
