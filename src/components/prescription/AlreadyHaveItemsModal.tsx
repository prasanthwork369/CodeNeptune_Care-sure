import { icons } from "@/src/constants/icons";
import { Touchable } from "@/src/components/ui/Touchable";
import React from "react";
import { moderateScale } from "@/src/utils/exactScale";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AlreadyHaveItemsModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: () => void;
  onReplace: () => void;
  isProceeding?: boolean;
}

export const AlreadyHaveItemsModal: React.FC<AlreadyHaveItemsModalProps> = ({
  visible,
  onClose,
  onAdd,
  onReplace,
  isProceeding = false,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 16,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 28,
            padding: 32,
            width: "100%",
            maxWidth: 380,
            maxHeight: Math.max(
              0,
              screenHeight - insets.top - insets.bottom - 32,
            ),
            position: "relative",
            shadowColor: "#919EAB33",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.18,
            shadowRadius: 14,
            elevation: 6,
          }}
        >
          {/* Close button at top right */}
          <Touchable
            onPress={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#919EAB14",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <icons.close_small width={14} height={14} />
          </Touchable>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{ flexShrink: 1 }}
            contentContainerStyle={{ alignItems: "center" }}
          >
            {/* Top Green Circle with Icon */}
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: "#EDFDF4",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <icons.drug_basket width={48} height={48} />
            </View>

            {/* Title */}
            <Text
              style={{
                fontSize: moderateScale(21),
                fontWeight: "700",
                color: "#111827",
                textAlign: "center",
                marginBottom: 10,
                paddingHorizontal: 12,
                lineHeight: moderateScale(28),
              }}
            >
              You Already Have Items in Your Cart
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: moderateScale(14.5),
                fontWeight: "400",
                color: "#6B7280",
                textAlign: "center",
                lineHeight: moderateScale(22),
                marginBottom: 28,
                paddingHorizontal: 12,
              }}
            >
              Your cart already has items. Add these medicines or replace your
              cart.
            </Text>
          </ScrollView>

          {/* Actions */}
          {isProceeding ? (
            <ActivityIndicator
              size="large"
              color="#0F7635"
              style={{ marginVertical: 24 }}
            />
          ) : (
            <View style={{ width: "100%" }}>
              {/* Add to Existing Cart */}
              <Touchable
                onPress={onAdd}
                activeOpacity={0.85}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#0F7635",
                  borderRadius: 14,
                  paddingVertical: 16,
                  marginBottom: 14,
                  gap: 10,
                }}
              >
                <icons.shopping_cart width={20} height={20} color="#fff" />
                <Text
                  style={{
                    fontSize: moderateScale(15.5),
                    fontWeight: "600",
                    color: "#fff",
                  }}
                >
                  Add to Existing Cart
                </Text>
              </Touchable>

              {/* Replace Current Cart */}
              <Touchable
                onPress={onReplace}
                activeOpacity={0.85}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  paddingVertical: 16,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  gap: 10,
                }}
              >
                <icons.swapcart width={20} height={20} color="#1D4ED8" />
                <Text
                  style={{
                    fontSize: moderateScale(15.5),
                    fontWeight: "600",
                    color: "#1D4ED8",
                  }}
                >
                  Replace Current Cart
                </Text>
              </Touchable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
