import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Dimensions,
    Modal,
    Pressable,
    Text,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const BRAND = "#0F7635";
const CORNER = 28;

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
  const SHEET_H = Dimensions.get("screen").height * 0.95;

  const [webLoading, setWebLoading] = useState(true);
  const [webError, setWebError] = useState(false);

  const hasShown = useRef(false);

  // ── animations ────────────────────────────────────────────────────────────
  const backdropOpacity = useSharedValue(0);
  const sheetY = useSharedValue(SHEET_H);
  const panY = useSharedValue(0);

  const doClose = useCallback(() => {
    panY.value = withTiming(0, { duration: 150 });
    backdropOpacity.value = withTiming(0, { duration: 220 });
    sheetY.value = withTiming(
      SHEET_H,
      { duration: 260, easing: Easing.in(Easing.quad) },
      () => runOnJS(onClose)(),
    );
  }, [onClose, SHEET_H]);

  useEffect(() => {
    if (isVisible) {
      hasShown.current = true;
      panY.value = 0;
      backdropOpacity.value = withTiming(1, { duration: 240 });
      sheetY.value = withSpring(0, { damping: 26, stiffness: 210, mass: 0.85 });
      // Reset web state when a new URL opens
      setWebLoading(true);
      setWebError(false);
    } else {
      if (!hasShown.current) return;
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetY.value = withTiming(SHEET_H, {
        duration: 240,
        easing: Easing.in(Easing.quad),
      });
      panY.value = withTiming(0, { duration: 200 });
    }
  }, [isVisible, SHEET_H, url]);

  useEffect(() => {
    if (!isVisible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      doClose();
      return true;
    });
    return () => sub.remove();
  }, [isVisible, doClose]);

  // ── animated styles ───────────────────────────────────────────────────────
  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value + panY.value }],
  }));

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      panY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 700) {
        runOnJS(doClose)();
      } else {
        panY.value = withSpring(0, { damping: 24, stiffness: 300 });
      }
    });

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={doClose}
    >
      {/* Dimmed backdrop */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.55)",
          },
          backdropStyle,
        ]}
      />
      <Pressable
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        onPress={doClose}
      />

      {/* Sheet */}
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: SHEET_H,
            borderTopLeftRadius: CORNER,
            borderTopRightRadius: CORNER,
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -6 },
            shadowOpacity: 0.14,
            shadowRadius: 18,
            elevation: 24,
          },
          sheetStyle,
        ]}
      >
        {/* Clips rounded corners on Android */}
        <View
          style={{
            flex: 1,
            borderTopLeftRadius: CORNER,
            borderTopRightRadius: CORNER,
            overflow: "hidden",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* ── Sticky header + drag handle ─────────────────────── */}
          <GestureDetector gesture={panGesture}>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderBottomWidth: 1,
                borderBottomColor: "#F3F4F6",
                paddingTop: 12,
              }}
            >
              {/* Drag pill */}
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "#D1D5DB",
                  alignSelf: "center",
                  marginBottom: 14,
                }}
              />

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
                  onPress={doClose}
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
          </GestureDetector>

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
        </View>
      </Animated.View>
    </Modal>
  );
};
