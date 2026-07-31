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
  const isLocalFile = uri.startsWith("file://") || uri.startsWith("/");

  if (isExpoGo) {
    // On iOS, WKWebView needs explicit originWhitelist and file access props to display local file:// URIs.
    const source =
      Platform.OS === "android"
        ? {
            uri: isLocalFile
              ? uri
              : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(uri)}`,
          }
        : { uri };

    return (
      <WebView
        source={source}
        style={style}
        originWhitelist={["*"]}
        allowingReadAccessToURL={isLocalFile ? uri : undefined}
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        onError={onError}
      />
    );
  }

  return (
    <Pdf
      source={{ uri, cache: !isLocalFile }}
      style={style}
      trustAllCerts={false}
      onError={onError}
    />
  );
};
