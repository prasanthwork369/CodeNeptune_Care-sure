import React, { useEffect, useState } from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import { SvgXml } from "react-native-svg";

interface RemoteIconProps {
  uri: string;
  size: number;
  style?: StyleProp<ImageStyle>;
}

interface ResolvedSvg {
  dataUri: string | null;
  xml: string | null;
}

// Health-problem icons are exported from Figma as an SVG "image fill" —
// a <pattern>/<use> wrapper around a single embedded base64 raster image,
// scaled via a transform that react-native-svg doesn't apply correctly
// (it renders the embedded image at native size, clipped to the viewBox).
// So we pull the embedded image out and render it directly via <Image>.
const svgCache = new Map<string, ResolvedSvg>();

const extractEmbeddedImage = (svg: string): string | null =>
  svg.match(/<image[^>]*(?:xlink:href|href)="(data:image\/[^"]+)"/i)?.[1] ??
  null;

const ensureViewBox = (svg: string): string => {
  const tagMatch = svg.match(/<svg\b[^>]*>/i);
  if (!tagMatch) return svg;
  const tag = tagMatch[0];
  if (/viewBox=/i.test(tag)) return svg;

  const width = tag.match(/width="([\d.]+)/i)?.[1];
  const height = tag.match(/height="([\d.]+)/i)?.[1];
  if (!width || !height) return svg;

  const patchedTag = tag.replace(
    "<svg",
    `<svg viewBox="0 0 ${width} ${height}"`,
  );
  return svg.replace(tag, patchedTag);
};

/** Renders a remote icon: embedded raster image-fills SVGs, and plain images. */
export const RemoteIcon: React.FC<RemoteIconProps> = ({ uri, size, style }) => {
  const isSvg = uri.toLowerCase().endsWith(".svg");
  const [resolved, setResolved] = useState<ResolvedSvg | null>(
    () => svgCache.get(uri) ?? null,
  );

  useEffect(() => {
    if (!isSvg) return;

    const cached = svgCache.get(uri);
    if (cached) {
      setResolved(cached);
      return;
    }

    let cancelled = false;

    fetch(uri)
      .then((res) => res.text())
      .then((text) => {
        if (cancelled) return;
        const embedded = extractEmbeddedImage(text);
        const result: ResolvedSvg = embedded
          ? { dataUri: embedded, xml: null }
          : { dataUri: null, xml: ensureViewBox(text) };
        svgCache.set(uri, result);
        setResolved(result);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [uri, isSvg]);

  if (isSvg) {
    if (!resolved) return null;
    if (resolved.dataUri) {
      return (
        <Image
          source={{ uri: resolved.dataUri }}
          style={[{ width: size, height: size }, style]}
          resizeMode="contain"
        />
      );
    }
    if (resolved.xml) {
      return <SvgXml xml={resolved.xml} width={size} height={size} />;
    }
    return null;
  }

  return (
    <Image
      source={{ uri }}
      style={[{ width: size, height: size }, style]}
      resizeMode="contain"
    />
  );
};
