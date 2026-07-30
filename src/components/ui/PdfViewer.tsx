import { isExpoGo } from "@/src/utils/environment";
import React from "react";
import { Platform, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

const Pdf = isExpoGo ? null : require("react-native-pdf").default;

interface PdfViewerProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  onError?: () => void;
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  uri,
  style,
  onError,
}) => {
  if (isExpoGo) {
    return (
      <WebView
        source={{
          uri:
            Platform.OS === "android"
              ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`
              : uri,
        }}
        style={style}
      />
    );
  }

  return (
    <Pdf
      source={{ uri, cache: true }}
      style={style}
      trustAllCerts={false}
      onError={onError}
    />
  );
};
