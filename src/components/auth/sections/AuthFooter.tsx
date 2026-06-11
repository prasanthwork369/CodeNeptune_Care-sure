import { icons } from '@/src/constants/icons';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { styles as s } from './AuthFooter.styles';
import { useMobileAppLinks } from '@/src/hooks/queries/useSettings';
import { PolicyLink } from '@/src/components/auth/PolicyLink';

export const AuthFooter: React.FC = () => {
    const { data: links } = useMobileAppLinks();
    const [policy, setPolicy] = useState<{ title: string; url?: string } | null>(null);

    return (
        <View style={s.wrap}>
            <View className="flex-row items-center justify-center gap-x-2 mb-2">
                <icons.verified_user width={s.icon.width} height={s.icon.height} />
                <Text style={s.secureText}>Secure & Encrypted</Text>
            </View>
            <Text style={s.policyText}>
                By continuing, you agree to our{' '}
                <Text suppressHighlighting={false} onPress={() => links?.termsLink && setPolicy({ title: 'Terms', url: links.termsLink })} style={[s.link, { opacity: links?.termsLink ? 1 : 0.5 }]}>
                    Terms
                </Text>,{' '}
                <Text suppressHighlighting={false} onPress={() => links?.privacyLink && setPolicy({ title: 'Privacy Policy', url: links.privacyLink })} style={[s.link, { opacity: links?.privacyLink ? 1 : 0.5 }]}>
                    Privacy Policy
                </Text>{' '}
                &{' '}
                <Text suppressHighlighting={false} onPress={() => links?.refundLink && setPolicy({ title: 'Refund Policy', url: links.refundLink })} style={[s.link, { opacity: links?.refundLink ? 1 : 0.5 }]}>
                    Refund Policy
                </Text>
            </Text>

            <PolicyLink
                isVisible={!!policy}
                onClose={() => setPolicy(null)}
                title={policy?.title ?? ''}
                url={policy?.url}
            />
        </View>
    );
};
