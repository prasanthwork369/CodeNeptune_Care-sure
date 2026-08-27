import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { Touchable } from "@/src/components/ui/Touchable";
import { Image } from "expo-image";
import React from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { moderateScale } from "@/src/utils/exactScale";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface InfoModalProps {
  title: string;
  message: string;
  onClose: () => void;
  onDismiss?: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({
  title,
  message,
  onClose,
  onDismiss,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const handleClose = () => {
    onClose();
    onDismiss?.();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/50 items-center justify-center px-6"
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full"
          style={{
            maxHeight: Math.max(
              0,
              screenHeight - insets.top - insets.bottom - 32,
            ),
          }}
        >
          <View
            className="bg-white rounded-[20px] w-full relative overflow-hidden"
            style={{ maxHeight: "100%" }}
          >
            <Touchable
              onPress={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#F1F2F4] items-center justify-center z-10"
            >
              <icons.close_dark width={14} height={14} />
            </Touchable>

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={{ flexShrink: 1 }}
              contentContainerStyle={{
                alignItems: "center",
                paddingHorizontal: 24,
                paddingTop: 28,
                paddingBottom: 8,
              }}
            >
              <View className="w-16 h-16 rounded-full bg-[#FDEAEA] items-center justify-center mb-4">
                <Image
                  source={HOME_IMAGES.prescriptionInfo}
                  style={{ width: 32, height: 32 }}
                  contentFit="contain"
                />
              </View>

              <Text
                className="font-inter-bold text-[#0F1724] mb-2 text-center"
                style={{ fontSize: moderateScale(18) }}
              >
                {title}
              </Text>
              <Text
                className="font-inter-medium text-[#6A6A6A] text-center leading-5"
                style={{ fontSize: moderateScale(13) }}
              >
                {message}
              </Text>
            </ScrollView>

            <View className="px-5 pt-4 pb-5">
              <Touchable
                onPress={handleClose}
                activeOpacity={0.85}
                className="w-full bg-brand-primary rounded-lg py-3.5 items-center"
              >
                <Text
                  className="font-inter-bold text-white"
                  style={{ fontSize: moderateScale(15) }}
                >
                  Understood, Got it
                </Text>
              </Touchable>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

