import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { BottomSheetView } from '@gorhom/bottom-sheet';

interface UploadBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelectCamera: () => void;
    onSelectLibrary: () => void;
}

const ActionRow = ({
    iconName, label, sublabel, onPress, iconBg, iconColor, last = false,
}: {
    iconName: React.ComponentProps<typeof Feather>['name'];
    label: string;
    sublabel: string;
    onPress: () => void;
    iconBg: string;
    iconColor: string;
    last?: boolean;
}) => {
    const scale = useSharedValue(1);
    const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

    return (
        <Animated.View style={animStyle}>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={1}
                onPressIn={() => { scale.value = withTiming(0.97, { duration: 80 }); }}
                onPressOut={() => { scale.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }); }}
                style={[s.actionRow, !last && s.actionRowBorder]}
            >
                <View style={[s.actionIcon, { backgroundColor: iconBg }]}>
                    <Feather name={iconName} size={20} color={iconColor} />
                </View>
                <View style={s.actionText}>
                    <Text style={s.actionLabel}>{label}</Text>
                    <Text style={s.actionSublabel}>{sublabel}</Text>
                </View>
                <View style={s.actionArrow}>
                    <Feather name="chevron-right" size={18} color="#C0C0C0" />
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const UploadBottomSheet: React.FC<UploadBottomSheetProps> = ({
    visible, onClose, onSelectCamera, onSelectLibrary,
}) => {
    const insets = useSafeAreaInsets();

    return (
        <GorhomBottomSheet
            isVisible={visible}
            onClose={onClose}
            backgroundStyle={{ backgroundColor: '#F5F5F7', borderTopLeftRadius: 36, borderTopRightRadius: 36 }}
        >
            <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 24) }}>
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

                <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={s.cancelBtn}>
                    <Text style={s.cancelText}>Cancel</Text>
                </TouchableOpacity>
            </BottomSheetView>
        </GorhomBottomSheet>
    );
};

const s = StyleSheet.create({
    actionsCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#EBEBEB' },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff' },
    actionRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F0' },
    actionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    actionText: { flex: 1 },
    actionLabel: { fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#111' },
    actionSublabel: { fontSize: 12, fontFamily: 'Inter', color: '#9CA3AF', marginTop: 2 },
    actionArrow: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
    cancelBtn: { backgroundColor: '#fff', borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderColor: '#EBEBEB', marginBottom: 4 },
    cancelText: { fontSize: 15, fontFamily: 'Inter-SemiBold', color: '#CF1A1A' },
});

export default UploadBottomSheet;
