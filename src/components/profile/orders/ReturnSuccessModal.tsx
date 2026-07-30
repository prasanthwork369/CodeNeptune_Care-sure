import { HOME_IMAGES } from "@/src/constants/images";
import { orderStyles as s } from "./orders.styles";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { Image, Modal, Text, View } from "react-native";

interface ReturnSuccessModalProps {
  isVisible: boolean;
  onClose: () => void;
  onGoHome: () => void;
}

export const ReturnSuccessModal: React.FC<ReturnSuccessModalProps> = ({
  isVisible,
  onClose,
  onGoHome,
}) => {
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/70 items-center justify-center px-8">
        <View
          className="bg-white w-full items-center"
          style={{
            borderRadius: 20,
            paddingHorizontal: 32,
            paddingVertical: 36,
          }}
        >
          {/* Success tick image */}
          <Image
            source={HOME_IMAGES.successTick}
            style={[s.returnSuccessImg, { marginBottom: 20 }]}
            resizeMode="contain"
          />

          {/* Title */}
          <Text
            className="font-inter-bold text-[#1A1C1E] text-center"
            style={{ fontSize: s.label20.fontSize, marginBottom: 28 }}
          >
            Return Request Submitted
          </Text>

          {/* Go Home Button */}
          <Touchable
            onPress={onGoHome}
            activeOpacity={0.8}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 40,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              borderRadius: 999,
            }}
          >
            <Text
              style={s.labelXl}
              className="font-inter-semibold text-[#1A1C1E]"
            >
              Go Home
            </Text>
          </Touchable>
        </View>
      </View>
    </Modal>
  );
};
