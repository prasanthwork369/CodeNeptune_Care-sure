import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { SvgUri } from 'react-native-svg';

interface RemoteIconProps {
    uri: string;
    size: number;
    style?: StyleProp<ImageStyle>;
}

/** Renders a remote icon, using SvgUri for .svg URLs and Image otherwise. */
export const RemoteIcon: React.FC<RemoteIconProps> = ({ uri, size, style }) => {
    if (uri.toLowerCase().endsWith('.svg')) {
        return <SvgUri uri={uri} width={size} height={size} />;
    }

    return (
        <Image
            source={{ uri }}
            style={[{ width: size, height: size }, style]}
            resizeMode="cover"
        />
    );
};
