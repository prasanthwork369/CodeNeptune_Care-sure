import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface UploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
}

const ActionRow = ({
  IconComponent,
  label,
  sublabel,
  onPress,
  iconBg,
  iconColor,
  last = false,
}: {
  IconComponent: React.FC<import("react-native-svg").SvgProps>;
  label: string;
  sublabel: string;
  onPress: () => void;
  iconBg: string;
  iconColor: string;
  last?: boolean;
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Touchable
        onPress={onPress}
        activeOpacity={1}
        onPressIn={() => {
          scale.value = withTiming(0.97, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, {
            duration: 180,
            easing: Easing.out(Easing.quad),
          });
        }}
        style={[s.actionRow, !last && s.actionRowBorder]}
      >
        <View style={[s.actionIcon, { backgroundColor: iconBg }]}>
          <IconComponent width={exactScale(20)} height={exactScale(20)} color={iconColor} />
        </View>
        <View style={s.actionText}>
          <Text style={s.actionLabel}>{label}</Text>
          <Text style={s.actionSublabel}>{sublabel}</Text>
        </View>
      </Touchable>
    </Animated.View>
  );
};

const UploadBottomSheet: React.FC<UploadBottomSheetProps> = ({
  visible,
  onClose,
  onSelectCamera,
  onSelectLibrary,
}) => {
  const adjustedBottom = useAdjustedBottomInset();

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#F5F5F7",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(12),
          paddingBottom: Math.max(adjustedBottom, exactScale(24)),
        }}
      >
        <View style={s.actionsCard}>
          <ActionRow
            IconComponent={icons.photo_camera_green}
            label="Take a Photo"
            sublabel="Use your device camera"
            onPress={onSelectCamera}
            iconBg="#E8F5EE"
            iconColor="#0F7635"
          />
          <ActionRow
            IconComponent={icons.outline_gallery}
            label="Choose from Gallery"
            sublabel="Pick from your photo library"
            onPress={onSelectLibrary}
            iconBg="#E8F0FE"
            iconColor="#4285F4"
            last
          />
        </View>

        <Touchable onPress={onClose} activeOpacity={0.7} style={s.cancelBtn}>
          <Text style={s.cancelText}>Cancel</Text>
        </Touchable>
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};

const s = StyleSheet.create({
  actionsCard: {
    backgroundColor: "#fff",
    borderRadius: exactScale(20),
    overflow: "hidden",
    marginBottom: exactScale(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EBEBEB",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: exactScale(16),
    paddingVertical: exactScale(14),
    backgroundColor: "#fff",
  },
  actionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  actionIcon: {
    width: exactScale(44),
    height: exactScale(44),
    borderRadius: exactScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginRight: exactScale(14),
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: moderateScale(15), fontWeight: "600", color: "#111" },
  actionSublabel: {
    fontSize: moderateScale(12),
    color: "#9CA3AF",
    marginTop: exactScale(2),
  },
  actionArrow: {
    width: exactScale(28),
    height: exactScale(28),
    borderRadius: exactScale(8),
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderRadius: exactScale(16),
    paddingVertical: exactScale(15),
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EBEBEB",
    marginBottom: exactScale(14),
  },
  cancelText: { fontSize: moderateScale(15), fontWeight: "600", color: "#CF1A1A" },
});

export default UploadBottomSheet;
