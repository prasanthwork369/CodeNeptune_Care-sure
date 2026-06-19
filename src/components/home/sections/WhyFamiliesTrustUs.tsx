import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { SvgUri } from 'react-native-svg';
import type { ApiAppContent } from '@/src/types/home';
import { styles as s, iconSize } from './WhyFamiliesTrustUs.styles';

interface WhyFamiliesTrustUsProps {
    promise?: ApiAppContent['promise'];
    isLoading?: boolean;
    showTitle?: boolean;
}

const isSvg = (url: string) => url?.toLowerCase().endsWith('.svg');

const RemoteIcon: React.FC<{ uri: string }> = ({ uri }) => {
    if (isSvg(uri)) return <SvgUri uri={uri} width={iconSize} height={iconSize} />;
    return <Image source={{ uri }} style={s.icon} contentFit="contain" />;
};

export const WhyFamiliesTrustUs: React.FC<WhyFamiliesTrustUsProps> = ({ promise, isLoading, showTitle = true }) => {
    if (isLoading || !promise) return null;

    return (
        <View className="mb-8">
            {showTitle && (
                <View className="flex-row items-center px-5 mb-4 mt-2">
                    <Text style={s.title} className="ml-1 mr-4 ">
                        {promise.title}
                    </Text>
                    <LinearGradient
                        colors={['#B2E8FF','#FFFFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ height: 5, width: 170, marginTop: 4, borderRadius: 1 }}
                    />
                </View>
            )}

            <View className="flex-row justify-around px-4 mt-1">
                {promise.items.map((item, idx) => (
                    <View key={idx} className="items-center">
                        <View className="mb-3" style={s.iconContainer}>
                            <RemoteIcon uri={item.iconUrl} />
                        </View>
                        <Text style={s.itemLabel}>
                            {item.label.replace(/\s+/g, ' ')}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};
