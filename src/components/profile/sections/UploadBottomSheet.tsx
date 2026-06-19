import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { Feather } from "@expo/vector-icons";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface UploadBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectCamera: () => void;
  onSelectLibrary: () => void;
}

const ActionRow = ({
  iconName,
  label,
  sublabel,
  onPress,
  iconBg,
  iconColor,
  last = false,
}: {
  iconName: React.ComponentProps<typeof Feather>["name"];
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
          <Feather name={iconName} size={20} color={iconColor} />
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
  const insets = useSafeAreaInsets();

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#F5F5F7",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        <View style={s.actionsCard}>
          <ActionRow
            iconName="camera"
            label="Take a Photo"
            sublabel="Use your device camera"
            onPress={onSelectCamera}
            iconBg="#E8F5EE"
            iconColor="#0F7635"
          />
          <ActionRow
            iconName="image"
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
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EBEBEB",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  actionRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionText: { flex: 1 },
  actionLabel: { fontSize: 15, fontFamily: "Inter-SemiBold", color: "#111" },
  actionSublabel: {
    fontSize: 12,
    fontFamily: "Inter",
    color: "#9CA3AF",
    marginTop: 2,
  },
  actionArrow: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#EBEBEB",
    marginBottom: 4,
  },
  cancelText: { fontSize: 15, fontFamily: "Inter-SemiBold", color: "#CF1A1A" },
});

export default UploadBottomSheet;
