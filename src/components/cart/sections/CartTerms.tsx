import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { cartStyles as s } from '../cart.styles';
import { useMobileAppLinks } from '@/src/hooks/queries/useSettings';
import { PolicyLink } from '@/src/components/auth/PolicyLink';

export const CartTerms: React.FC = () => {
    const { data: links } = useMobileAppLinks();
    const [policy, setPolicy] = useState<{ title: string; url?: string } | null>(null);

    return (
        <View className="mx-4 mt-4 bg-white border border-[#919EAB33] rounded-md px-4 py-5 flex-row items-center">
            <View style={[s.termsCircle, { borderRadius: 9, backgroundColor: '#6A6A6A', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={[s.termsBadgeTxt, { color: 'white', fontWeight: '700', lineHeight: 14 }]}>i</Text>
            </View>
            <Text style={s.termsText} className="flex-1 ml-3 font-inter-medium text-[#6A6A6A] leading-[18px]">
                Please Review And Accept{' '}
                <Text
                    suppressHighlighting={false}
                    onPress={() => links?.termsLink && setPolicy({ title: 'Terms & Conditions', url: links.termsLink })}
                    className="font-inter-bold text-[#222222] underline"
                    style={{ opacity: links?.termsLink ? 1 : 0.5 }}
                >
                    Our Terms & Conditions
                </Text>
                {' '}And{' '}
                <Text
                    suppressHighlighting={false}
                    onPress={() => links?.refundLink && setPolicy({ title: 'Return & Refund Policy', url: links.refundLink })}
                    className="font-inter-bold text-[#222222] underline"
                    style={{ opacity: links?.refundLink ? 1 : 0.5 }}
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
