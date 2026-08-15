import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface UploadSheetOptionsProps {
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
  onCancel: () => void;
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
          <IconComponent
            width={exactScale(20)}
            height={exactScale(20)}
            color={iconColor}
          />
        </View>
        <View style={s.actionText}>
          <Text style={s.actionLabel}>{label}</Text>
          <Text style={s.actionSublabel}>{sublabel}</Text>
        </View>
      </Touchable>
    </Animated.View>
  );
};

/** Shared body of the avatar picker — used by the profile sheet and the photo preview sheet. */
export const UploadSheetOptions: React.FC<UploadSheetOptionsProps> = ({
  onSelectCamera,
  onSelectLibrary,
  onCancel,
}) => (
  <>
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

    <Touchable onPress={onCancel} activeOpacity={0.7} style={s.cancelBtn}>
      <Text style={s.cancelText}>Cancel</Text>
    </Touchable>
  </>
);

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
  actionLabel: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#111",
  },
  actionSublabel: {
    fontSize: moderateScale(12),
    color: "#9CA3AF",
    marginTop: exactScale(2),
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
  cancelText: {
    fontSize: moderateScale(15),
    fontWeight: "600",
    color: "#CF1A1A",
  },
});
