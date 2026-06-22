import React from 'react';
import { Text, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i;

const tagsStyles = {
    p:      { color: '#6A6A6A', fontSize: 13, fontWeight: '500', lineHeight: 20, marginTop: 0, marginBottom: 4 },
    b:      { fontWeight: '700', color: '#222222' },
    strong: { fontWeight: '700', color: '#222222' },
    i:      { fontStyle: 'italic' as const },
    em:     { fontStyle: 'italic' as const },
    h1:     { fontWeight: '700', color: '#222222', fontSize: 16, marginTop: 0, marginBottom: 2 },
    h2:     { fontWeight: '700', color: '#222222', fontSize: 15, marginTop: 0, marginBottom: 2 },
    h3:     { fontWeight: '600', color: '#222222', fontSize: 14, marginTop: 0, marginBottom: 2 },
    li:     { color: '#6A6A6A', fontSize: 13, fontWeight: '500', lineHeight: 20 },
    ul:     { marginTop: 0, marginBottom: 4 },
    ol:     { marginTop: 0, marginBottom: 4 },
} as const;

const baseStyle = {
    color: '#6A6A6A',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 20,
} as const;

interface HtmlContentProps {
    content: string;
}

export const HtmlContent: React.FC<HtmlContentProps> = ({ content }) => {
    const { width } = useWindowDimensions();

    if (!content) return null;

    if (!HTML_TAG_RE.test(content)) {
        return (
            <Text style={baseStyle}>{content}</Text>
        );
    }

    return (
        <RenderHtml
            contentWidth={width - 48}
            source={{ html: content }}
            tagsStyles={tagsStyles}
            baseStyle={baseStyle}
            enableExperimentalMarginCollapsing
        />
    );
};
