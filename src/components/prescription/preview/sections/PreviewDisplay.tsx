import { AnimatedImage } from "@/src/components/ui/AnimatedImage";
import { PdfViewer } from "@/src/components/ui/PdfViewer";
import { icons } from "@/src/constants/icons";
import { PreviewDisplayProps } from "@/src/types/prescription";
import { Touchable } from "@/src/components/ui/Touchable";
import { useZoomGesture } from "@/src/hooks/ui/useZoomGesture";
import React, { useEffect } from "react";
import { Alert, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

export const PreviewDisplay: React.FC<PreviewDisplayProps> = ({
  activeItem,
  screenWidth,
  previewHeight,
  onLayout,
  onPrev,
  showPrev,
  onNext,
  showNext,
}) => {
  const containerWidth = screenWidth - 48;

  const { resetZoom, composedGesture, animatedStyle } = useZoomGesture({
    containerWidth,
    containerHeight: previewHeight,
  });

  // Reset zoom when active item changes
  useEffect(() => {
    resetZoom();
  }, [activeItem?.localUri]);

  return (
    <View style={{ flex: 1, position: "relative" }}>
      <View
        className="rounded-md overflow-hidden"
        style={{
          flex: 1,
          shadowColor: "#919EAB33",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.5,
          shadowRadius: 1,
          elevation: 0,
          borderWidth: 1,
          borderColor: "#919EAB33",
          backgroundColor: "#F9FAFB",
        }}
        onLayout={(e) => onLayout(e.nativeEvent.layout.height)}
      >
        {activeItem && isPdf(activeItem.localUri, activeItem.type) ? (
          <PdfViewer
            uri={activeItem.localUri}
            style={{
              width: containerWidth,
              height: previewHeight,
              backgroundColor: "#F9FAFB",
            }}
            onError={() => Alert.alert("Error", "Could not load PDF.")}
          />
        ) : activeItem && previewHeight > 0 ? (
          <GestureDetector gesture={composedGesture}>
            <Animated.View
              style={{
                width: containerWidth,
                height: previewHeight,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AnimatedImage
                source={{ uri: activeItem.localUri }}
                style={[
                  {
                    width: containerWidth,
                    height: previewHeight,
                  },
                  animatedStyle,
                ]}
                contentFit="contain"
              />
            </Animated.View>
          </GestureDetector>
        ) : null}
      </View>

      {showPrev && (
        <Touchable
          onPress={onPrev}
          style={{
            position: "absolute",
            left: -20,
            top: "50%",
            marginTop: -24,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#919EAB33",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            elevation: 8,
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
          }}
        >
          <icons.arrow_back_ios width={16} height={16} fill="#222222" />
        </Touchable>
      )}

      {showNext && (
        <Touchable
          onPress={onNext}
          style={{
            position: "absolute",
            right: -20,
            top: "50%",
            marginTop: -24,
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#919EAB33",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            elevation: 8,
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
          }}
        >
          <icons.arrow_forward_ios width={16} height={16} fill="#222222" />
        </Touchable>
      )}
    </View>
  );
};
