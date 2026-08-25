import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { moderateScale, exactScale } from "@/src/utils/exactScale";

interface PrescriptionLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export const PrescriptionLoadingOverlay: React.FC<
  PrescriptionLoadingOverlayProps
> = ({ visible, message = "Opening prescription..." }) => {
  // A plain absolute View only fills its own screen's content area — the
  // Tab Navigator renders the tab bar as a sibling outside that area, so it
  // stays uncovered. Modal presents in its own native window above everything,
  // tab bar included.
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      // No-op: swallow Android hardware back instead of letting it fall
      // through to the screen underneath while this loader is up.
      onRequestClose={() => {}}
    >
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: exactScale(24),
          },
        ]}
        pointerEvents="auto"
      >
        <View
          className="flex-row items-center rounded-2xl bg-white shadow-lg"
          style={{
            paddingHorizontal: exactScale(20),
            paddingVertical: exactScale(16),
            gap: exactScale(12),
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 10,
          }}
        >
          <ActivityIndicator size="small" color="#0F7635" />
          <Text
            className="font-inter-medium text-[#1A1C1E]"
            style={{ fontSize: moderateScale(14) }}
          >
            {message}
          </Text>
        </View>
      </View>
    </Modal>
  );
};
