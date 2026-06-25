import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import VerifiedUserWhiteIcon from '@/assets/icons/VerifiedUserWhiteIcon.svg';
import { PaymentTotalBannerProps } from '@/src/types/payment';

export const PaymentTotalBanner: React.FC<PaymentTotalBannerProps> = ({ toPay }) => {
    return (
        <LinearGradient 
            colors={['#0F7635', '#16A34A']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={{ 
                borderRadius: 24, 
                padding: 24, 
                marginBottom: 24, 
                shadowColor: '#0F7635', 
                shadowOffset: { width: 0, height: 10 }, 
                shadowOpacity: 0.2, 
                shadowRadius: 20, 
                elevation: 8 
            }}
        >
            <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5 }}>
                Total Amount to Pay
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 8 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#fff', marginRight: 4 }}>₹</Text>
                <Text style={{ fontSize: 42, fontWeight: '800', color: '#fff' }}>{toPay}</Text>
            </View>
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', alignItems: 'center' }}>
                <VerifiedUserWhiteIcon width={16} height={16} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff', marginLeft: 8 }}>
                    Safe & Secure Transaction
                </Text>
            </View>
        </LinearGradient>
    );
};
