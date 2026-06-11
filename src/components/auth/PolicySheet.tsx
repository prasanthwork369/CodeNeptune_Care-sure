import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const BRAND = "#0F7635";

// Block link taps so nothing navigates away — content is read-only in the sheet.
const BLOCK_LINKS_JS = `
(function() {
  document.addEventListener('click', function(e) {
    var el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (el && el.tagName === 'A') { e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
true;
`;

// ─── Component ────────────────────────────────────────────────────────────────

interface PolicySheetProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export const PolicySheet: React.FC<PolicySheetProps> = ({
  isVisible,
  onClose,
  title,
  url,
}) => {
  const insets = useSafeAreaInsets();

  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["95%"], []);

  useEffect(() => {
    if (isVisible) {
      // Reset web state when a new URL opens
      setWebLoading(true);
      setWebError(false);
    }
  }, [isVisible, url]);

  useEffect(() => {
    if (!isVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      bottomSheetRef.current?.dismiss();
      return true;
    });
    return () => sub.remove();
  }, [isVisible]);

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={snapPoints}
      closeButtonOffset="95%"
      backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}
    >
        {/* Clips rounded corners on Android */}
        <BottomSheetView
          style={{
            flex: 1,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* ── Header ───────────────────────────────────────────── */}
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderBottomWidth: 1,
              borderBottomColor: "#F3F4F6",
              paddingTop: 12,
            }}
          >
            {/* Header row */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingBottom: 14,
                gap: 10,
              }}
            >
              <Touchable
                onPress={() => bottomSheetRef.current?.dismiss()}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <icons.arrow_back width={17} height={17} />
              </Touchable>

              <Text
                style={{
                  flex: 1,
                  fontSize: 17,
                  fontFamily: "Inter-Bold",
                  color: "#111827",
                  letterSpacing: -0.2,
                }}
              >
                {title}
              </Text>
            </View>
          </View>

          {/* ── Web content ──────────────────────────────────────── */}
          <View style={{ flex: 1 }}>
            {url ? (
              <>
                {webLoading && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#FFF",
                      zIndex: 1,
                    }}
                  >
                    <ActivityIndicator size="large" color={BRAND} />
                    <Text
                      style={{
                        marginTop: 14,
                        fontSize: 13,
                        fontFamily: "Inter-Regular",
                        color: "#9CA3AF",
                      }}
                    >
                      Loading…
                    </Text>
                  </View>
                )}

                {webError && !webLoading && (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 16,
                      padding: 24,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontFamily: "Inter-Medium",
                        color: "#374151",
                        textAlign: "center",
                      }}
                    >
                      Could not load content.
                    </Text>
                    <Touchable
                      onPress={() => {
                        setWebError(false);
                        setWebLoading(true);
                      }}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 28,
                        backgroundColor: BRAND,
                        borderRadius: 10,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontFamily: "Inter-SemiBold",
                          color: "#FFF",
                        }}
                      >
                        Retry
                      </Text>
                    </Touchable>
                  </View>
                )}

                {!webError && (
                  <WebView
                    key={url}
                    source={{ uri: url }}
                    injectedJavaScript={BLOCK_LINKS_JS}
                    style={{ flex: 1, backgroundColor: "#FFFFFF" }}
                    showsVerticalScrollIndicator={false}
                    onLoadStart={() => {
                      setWebLoading(true);
                      setWebError(false);
                    }}
                    onLoadEnd={() => setWebLoading(false)}
                    onError={() => {
                      setWebLoading(false);
                      setWebError(true);
                    }}
                    onHttpError={({ nativeEvent }) => {
                      if (nativeEvent.statusCode >= 400) {
                        setWebLoading(false);
                        setWebError(true);
                      }
                    }}
                    setSupportMultipleWindows={false}
                    allowsBackForwardNavigationGestures={false}
                    onShouldStartLoadWithRequest={(req) => {
                      // Allow: initial load, Next.js static chunks, API calls
                      // Block: user tapping external links
                      if (req.url === url) return true;
                      if (
                        req.url.includes("/_next/") ||
                        req.url.includes("/api/")
                      )
                        return true;
                      if (req.navigationType === "other") return true;
                      return false;
                    }}
                  />
                )}
              </>
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontFamily: "Inter-Regular",
                    color: "#9CA3AF",
                  }}
                >
                  No content available.
                </Text>
              </View>
            )}
          </View>

          {/* Safe-area bottom padding so WebView content isn't cut off */}
          {insets.bottom > 0 && (
            <View
              style={{ height: insets.bottom, backgroundColor: "#FFFFFF" }}
            />
          )}
        </BottomSheetView>
    </GorhomBottomSheet>
  );
};
