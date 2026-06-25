import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { useMobileAppLinks } from '@/src/hooks/queries/useSettings';
import { PolicyLink } from '@/src/components/auth/PolicyLink';
import { icons } from '@/src/constants/icons';
import * as Haptics from 'expo-haptics';

type LinkKey = 'terms' | 'refund';

export const CartTerms: React.FC = () => {
    const { data: links } = useMobileAppLinks();
    const [policy, setPolicy] = useState<{ title: string; url?: string } | null>(null);
    const [pressedLink, setPressedLink] = useState<LinkKey | null>(null);

    const linkStyle = (key: LinkKey, enabled?: string) => [
        { fontWeight: '700' as const, color: '#222222', textDecorationLine: 'underline' as const },
        {
            opacity: enabled ? 1 : 0.5,
            borderRadius: 6,
            paddingHorizontal: 3,
            backgroundColor: pressedLink === key ? 'rgba(15, 118, 53, 0.18)' : 'transparent',
        },
    ];

    const handlePressTerms = () => {
        if (!links?.termsLink) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPolicy({ title: 'Terms & Conditions', url: links.termsLink });
    };

    const handlePressRefund = () => {
        if (!links?.refundLink) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPolicy({ title: 'Return & Refund Policy', url: links.refundLink });
    };

    return (
        <View className="mx-4 mt-4 bg-white border border-[#919EAB33] rounded-md px-4 py-5 flex-row items-center">
            <icons.info_gray width={20} height={20} />
            <Text style={s.termsText} className="flex-1 ml-3 font-inter-medium text-[#6A6A6A] leading-[18px]">
                Please Review{' '}
                <Text
                    suppressHighlighting
                    style={linkStyle('terms', links?.termsLink)}
                    onPress={handlePressTerms}
                    onPressIn={() => links?.termsLink && setPressedLink('terms')}
                    onPressOut={() => setPressedLink(null)}
                >
                    Our Terms & Conditions
                </Text>
                {' '}And{' '}
                <Text
                    suppressHighlighting
                    style={linkStyle('refund', links?.refundLink)}
                    onPress={handlePressRefund}
                    onPressIn={() => links?.refundLink && setPressedLink('refund')}
                    onPressOut={() => setPressedLink(null)}
                >
                    Return & Refund Policy
                </Text>{' '}
                Before Proceeding To Payment.
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
