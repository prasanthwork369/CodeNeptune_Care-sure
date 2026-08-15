import { icons } from "@/src/constants/icons";
import { Touchable } from "@/src/components/ui/Touchable";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { Modal, ScrollView, Text, View } from "react-native";

interface PrescriptionRejectedModalProps {
  visible: boolean;
  onClose: () => void;
  /** One reason per uploaded file, in upload order. */
  reasons: string[];
}

export const PrescriptionRejectedModal: React.FC<
  PrescriptionRejectedModalProps
> = ({ visible, onClose, reasons }) => (
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
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: exactScale(24),
      }}
    >
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: exactScale(20),
          width: "100%",
          // Never grow past the screen when many files were rejected.
          maxHeight: "75%",
          paddingHorizontal: exactScale(24),
          paddingTop: exactScale(28),
          paddingBottom: exactScale(24),
        }}
      >
        <View
          className="flex-row items-center justify-between"
          style={{ marginBottom: exactScale(24) }}
        >
          <Text
            className="font-inter-bold text-[#222222] flex-1"
            style={{ fontSize: moderateScale(18) }}
          >
            Prescription Rejected
          </Text>
          <Touchable
            onPress={onClose}
            className="items-center justify-center"
            style={{
              width: exactScale(40),
              height: exactScale(40),
              borderRadius: exactScale(20),
              backgroundColor: "#F1F0F5",
              marginLeft: exactScale(12),
            }}
          >
            <icons.close_dark
              width={exactScale(14)}
              height={exactScale(14)}
              fill="#222222"
            />
          </Touchable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          {reasons.map((reason, index) => (
            <View key={index}>
              {index > 0 && (
                <View
                  style={{
                    marginVertical: exactScale(20),
                    borderTopWidth: 1,
                    borderColor: "#E5E7EB",
                    borderStyle: "dashed",
                  }}
                />
              )}
              <View
                className="self-start"
                style={{
                  borderWidth: 1,
                  borderColor: "#F5C2C2",
                  backgroundColor: "#FEF2F2",
                  borderRadius: exactScale(6),
                  paddingHorizontal: exactScale(10),
                  paddingVertical: exactScale(5),
                  marginBottom: exactScale(12),
                }}
              >
                <Text
                  className="font-inter-bold text-[#C22307]"
                  style={{ fontSize: moderateScale(12), letterSpacing: 0.5 }}
                >
                  FILE {index + 1}
                </Text>
              </View>
              <Text
                className="font-inter-medium text-[#6A6A6A]"
                style={{
                  fontSize: moderateScale(13),
                  lineHeight: moderateScale(20),
                }}
              >
                {reason}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);
