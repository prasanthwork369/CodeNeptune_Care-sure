import React from 'react';
import { View, Text, Image } from 'react-native';
import { UPLOAD_IMAGES } from '@/src/constants/images';
import { styles as s } from './WhyTrustUs.styles';

const TRUST_ITEMS = [
    { image: UPLOAD_IMAGES.secure, label: '100% Secure & Confidential' },
    { image: UPLOAD_IMAGES.pharmacist, label: 'Verified Pharmacists' },
    { image: UPLOAD_IMAGES.fastTime, label: 'Fast Processing' },
];

export const WhyTrustUs: React.FC = () => {
    return (
        <View className="bg-white border border-[#919EAB33] rounded-[14px] p-4">
            <Text style={s.sectionTitle} className="font-inter-bold text-[#1A1C1E] mb-3">Why trust us?</Text>
            {TRUST_ITEMS.map((item, idx) => (
                <View key={item.label} className={`flex-row items-center ${idx > 0 ? 'mt-3' : ''}`}>
                    <Image source={item.image} style={s.icon} resizeMode="contain" />
                    <Text style={s.label} className="font-inter-semibold text-[#0F1724] ml-3">{item.label}</Text>
                </View>
            ))}
        </View>
    );
};
