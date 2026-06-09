import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, withSpring, Easing, runOnJS,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const translateY = useSharedValue(600);
    const opacity = useSharedValue(0);
    const [renderModal, setRenderModal] = React.useState(visible);

    useEffect(() => {
        if (visible) {
            setRenderModal(true);
            opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
            translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
        } else {
            opacity.value = withTiming(0, { duration: 250 });
            translateY.value = withTiming(600, { duration: 280, easing: Easing.in(Easing.ease) }, (finished) => {
                if (finished) runOnJS(setRenderModal)(false);
            });
        }
    }, [visible]);

    const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
    const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));

    return (
        <Modal transparent visible={renderModal} animationType="none" statusBarTranslucent onRequestClose={onClose}>
            <View style={s.root}>
                <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                    <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={onClose} />
                </Animated.View>

                <Animated.View style={[s.sheet, sheetStyle, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                    <View style={s.handle} />

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
                </Animated.View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    root: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        backgroundColor: '#F5F5F7',
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#DCDCDC', marginBottom: 20 },
    header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, paddingHorizontal: 4 },
    headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E8F5EE', alignItems: 'center', justifyContent: 'center' },
    headerTitle: { fontSize: 17, fontFamily: 'Inter-Bold', color: '#111', letterSpacing: 0.1 },
    headerSub: { fontSize: 13, fontFamily: 'Inter', color: '#999', marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E0E0E0', marginBottom: 16 },
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
