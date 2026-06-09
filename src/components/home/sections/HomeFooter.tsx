import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { SvgUri } from 'react-native-svg';

import { ApiAppContent } from '@/src/types/home';

interface HomeFooterProps {
    appContent?: ApiAppContent;
    isLoading?: boolean;
}

const isSvg = (url: string) => url?.toLowerCase().endsWith('.svg');

const RemoteIcon: React.FC<{ uri: string; size: number }> = ({ uri, size }) => {
    if (isSvg(uri)) {
        return <SvgUri uri={uri} width={size} height={size} />;
    }
    return (
        <Image
            source={{ uri }}
            style={{ width: size, height: size }}
            contentFit="contain"
        />
    );
};

export const HomeFooter: React.FC<HomeFooterProps> = ({ appContent, isLoading }) => {
    const { width } = useWindowDimensions();

    if (isLoading || !appContent) {
        return <View className="h-20" />;
    }

    const promiseTitle = appContent.promise?.title;
    const footerTitle = appContent.footer?.title ?? '';
    const footerImageUrl = appContent.footer?.imageUrl;
    const footerHeartUrl = appContent.footer?.iconUrl;

    const footerWords = footerTitle.split(' ');

    return (
        <View>


            {/* Always With You Banner */}
            {footerHeartUrl ? (
                <View style={{ paddingTop: width * 0.10, paddingBottom: 0, paddingHorizontal: 20 }}>
                    {isSvg(footerHeartUrl) ? (
                        <SvgUri uri={footerHeartUrl} width={width * 0.38} height={width * 0.30} />
                    ) : (
                        <Image
                            source={{ uri: footerHeartUrl }}
                            style={{ width: width * 0.38, height: width * 0.30 }}
                            contentFit="contain"
                            contentPosition="top"
                        />
                    )}
                </View>
            ) : null}

            {/* Skyline with text overlay at bottom-left */}
            {footerImageUrl ? (
                <View style={{ width: width, height: width * 0.7, marginTop: 10 }}>
                    <Image
                        source={{ uri: footerImageUrl }}
                        style={{ width: width, height: width * 0.8 }}
                        contentFit="cover"
                        contentPosition="bottom"
                    />
                    <View style={{ position: 'absolute', bottom: 60, left: 24, gap: 0 }}>
                        {footerWords.map((word, idx) => (
                            <Text
                                key={idx}
                                style={{
                                    fontSize: Math.round(Math.min(Math.max(width * 0.155, 36), 72)),
                                    lineHeight: Math.round(Math.min(Math.max(width * 0.165, 38), 76)),
                                }}
                                className="font-inter-extrabold text-[#D4D4D4] uppercase"
                            >
                                {word}
                            </Text>
                        ))}
                    </View>
                </View>
            ) : null}

            {/* Sub-footer trust labels */}
            <View
                className="flex-row justify-between items-start w-full px-6 pt-3"
                style={{ paddingBottom: 20 }}
            >
                {(appContent.footer?.labels ?? []).map((label, idx) => (
                    <View key={idx} className="items-center flex-1">
                        <View className="h-6 items-center justify-center">
                            <RemoteIcon uri={label.icon} size={22} />
                        </View>
                        <Text className="text-[12px] font-inter-medium text-[#0F1724] mt-1 text-center">
                            {label.text}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};
