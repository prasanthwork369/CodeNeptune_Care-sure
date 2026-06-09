import { Touchable } from '@/src/components/ui/Touchable';
import React, { useEffect } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
    Image,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { icons } from '@/src/constants/icons';

// Spring physics config matching standard CareSure animations
const SHEET_SPRING = { damping: 28, stiffness: 290, mass: 0.95 };
const EASE_OUT = Easing.out(Easing.cubic);

interface MedicineItem {
    name: string;
    quantity: number;
    dosageForm?: string;
    medicineId?: string;
    instructions?: string;
    manufacturer?: string;
    originalName?: string;
    thumbnailUrl?: string;
    isDoctorAdded?: boolean;
}

interface PrescriptionDetails {
    medicines: MedicineItem[];
    patientId?: string;
    patientName: string;
    patientAge?: string | number;
    patientGender?: string;
}

interface DoctorSnapshot {
    id?: string;
    name: string;
    signatureUrl?: string;
    registrationNumber?: string;
}

interface ClinicalData {
    timestamp: string;
    approvedAt?: string;
    approvedBy?: string;
    doctorName: string;
    prescriptions: PrescriptionDetails[];
    doctorSnapshot?: DoctorSnapshot;
    registrationNumber?: string;
}

interface DigitalPrescriptionModalProps {
    visible: boolean;
    onClose: () => void;
    clinicalData: ClinicalData;
}

function formatDate(iso: string) {
    if (!iso) return '—';
    const dateObj = new Date(iso);
    const datePart = dateObj.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const timePart = dateObj.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });
    return `${datePart}, ${timePart}`;
}

export const DigitalPrescriptionModal: React.FC<DigitalPrescriptionModalProps> = ({
    visible,
    onClose,
    clinicalData,
}) => {
    const insets = useSafeAreaInsets();
    const { height: screenHeight } = useWindowDimensions();

    const sheetY = useSharedValue(screenHeight);
    const overlayOpacity = useSharedValue(0);
    const panY = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            overlayOpacity.value = withTiming(1, { duration: 250, easing: EASE_OUT });
            sheetY.value = withSpring(0, SHEET_SPRING);
        } else {
            overlayOpacity.value = withTiming(0, { duration: 220, easing: EASE_OUT });
            sheetY.value = withTiming(screenHeight, { duration: 280, easing: EASE_OUT });
        }
    }, [visible]);

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: sheetY.value + panY.value }],
    }));

    const panGesture = Gesture.Pan()
        .onUpdate((e) => {
            panY.value = Math.max(0, e.translationY);
        })
        .onEnd((e) => {
            if (e.translationY > 100 || e.velocityY > 800) {
                runOnJS(handleClose)();
            } else {
                panY.value = withSpring(0, { damping: 22, stiffness: 300 });
            }
        });

    const handleClose = () => {
        overlayOpacity.value = withTiming(0, { duration: 220, easing: EASE_OUT });
        sheetY.value = withTiming(screenHeight, { duration: 280, easing: EASE_OUT }, (done) => {
            if (done) runOnJS(onClose)();
        });
    };

    const docName = clinicalData.doctorSnapshot?.name ?? clinicalData.doctorName ?? 'Medical Practitioner';
    const regNo = clinicalData.doctorSnapshot?.registrationNumber ?? clinicalData.registrationNumber ?? '—';
    const signatureUrl = clinicalData.doctorSnapshot?.signatureUrl;

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
            {/* Dark Backdrop overlay */}
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.55)',
                    },
                    overlayStyle,
                ]}
            >
                <Pressable style={{ flex: 1 }} onPress={handleClose} />
            </Animated.View>

            {/* Sliding Content Container */}
            <GestureDetector gesture={panGesture}>
            <Animated.View
                style={[
                    {
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        alignItems: 'center',
                    },
                    sheetStyle,
                ]}
            >
                {/* White bottom sheet modal */}
                <View
                    style={{
                        backgroundColor: '#FFFFFF',
                        borderTopLeftRadius: 24,
                        borderTopRightRadius: 24,
                        width: '100%',
                        paddingHorizontal: 20,
                        paddingTop: 22,
                        paddingBottom: Math.max(insets.bottom, 16) + 16,
                    }}
                >
                    {/* Header Row with Title and Close Button */}
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-[18px] font-inter-bold text-[#1A1C1E]">
                            Verified Digital Prescription
                        </Text>
                        <Touchable
                            onPress={handleClose}
                            activeOpacity={0.7}
                            style={{
                                width: 30,
                                height: 30,
                                borderRadius: 15,
                                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <icons.close_icon width={11} height={11} fill="#FFFFFF" />
                        </Touchable>
                    </View>

                    <ScrollView 
                        showsVerticalScrollIndicator={false} 
                        style={{ maxHeight: Math.min(500, screenHeight - insets.bottom - 220) }} 
                        className="pb-4"
                    >
                        {/* Prescription Card Box */}
                        <View className="bg-white rounded-[16px] border border-[#919EAB33] overflow-hidden shadow-sm mb-4">
                            {/* Green Top Border/Accent Band */}
                            <View className="h-[6px] bg-[#0F7635]" />

                            <View className="p-4">
                                {/* Doctor / Clinic Row */}
                                <View className="flex-row justify-between items-start mb-4">
                                    {/* Left: Doctor Information */}
                                    <View className="flex-1 pr-4">
                                        <Text className="text-[15px] font-inter-bold text-[#1A1C1E]">
                                            Dr. {docName}
                                        </Text>
                                        <Text className="text-[9px] font-inter-semibold text-brand-subtext uppercase tracking-[0.5px] mt-0.5">
                                            MEDICAL PRACTITIONER
                                        </Text>
                                        <Text className="text-[11px] font-inter-semibold text-brand-text mt-2">
                                            Reg No: {regNo}
                                        </Text>
                                    </View>

                                    {/* Right: Caresure Clinics Info */}
                                    <View className="items-end">
                                        <Text className="text-[13px] font-inter-bold text-[#0F7635]">
                                            CARESURE CLINICS
                                        </Text>
                                        <Text className="text-[9px] font-inter-semibold text-brand-subtext mt-0.5">
                                            Digital Health Service
                                        </Text>
                                        <Text className="text-[9px] font-inter-semibold text-brand-subtext">
                                            support@caresure.com
                                        </Text>
                                    </View>
                                </View>

                                {/* Dynamic Loop rendering across multiple patient prescriptions */}
                                {(clinicalData.prescriptions ?? []).map((prescription, pIndex) => {
                                    const patientName = prescription.patientName ?? 'Patient';
                                    const medicines = prescription.medicines ?? [];
                                    const ageVal = prescription.patientAge;
                                    const genderVal = prescription.patientGender;
                                    
                                    let ageGenderDisplay = '—';
                                    if (ageVal && genderVal) {
                                        const capitalizedGender = genderVal.charAt(0).toUpperCase() + genderVal.slice(1).toLowerCase();
                                        ageGenderDisplay = `${ageVal} Years / ${capitalizedGender}`;
                                    } else if (ageVal) {
                                        ageGenderDisplay = `${ageVal} Years`;
                                    } else if (genderVal) {
                                        ageGenderDisplay = genderVal.charAt(0).toUpperCase() + genderVal.slice(1).toLowerCase();
                                    }

                                    return (
                                        <View key={pIndex} style={pIndex > 0 ? { marginTop: 22, borderTopWidth: 1, borderColor: '#EEEFF1', borderStyle: 'dashed', paddingTop: 18 } : {}}>
                                            {/* Patient Details Grid Columns */}
                                            <View className="bg-[#FAFAFA] border border-[#EEEFF1] rounded-xl px-3 py-2.5 flex-row justify-between">
                                                {/* Column 1: Patient Name */}
                                                <View className="flex-1">
                                                    <Text className="text-[10px] font-inter-semibold text-brand-subtext uppercase tracking-[0.5px] mb-1">
                                                        PATIENT NAME
                                                    </Text>
                                                    <Text className="text-[13px] font-inter-bold text-[#1A1C1E]" numberOfLines={1}>
                                                        {patientName}
                                                    </Text>
                                                </View>

                                                {/* Column 2: Age / Gender */}
                                                <View className="flex-1 px-2 border-l border-r border-[#EEEFF1]">
                                                    <Text className="text-[10px] font-inter-semibold text-brand-subtext uppercase tracking-[0.5px] mb-1">
                                                        AGE / GENDER
                                                    </Text>
                                                    <Text className="text-[13px] font-inter-bold text-[#1A1C1E]">
                                                        {ageGenderDisplay}
                                                    </Text>
                                                </View>

                                                {/* Column 3: Date & Time */}
                                                <View className="flex-1 pl-2">
                                                    <Text className="text-[10px] font-inter-semibold text-brand-subtext uppercase tracking-[0.5px] mb-1">
                                                        DATE & TIME
                                                    </Text>
                                                    <Text className="text-[11px] font-inter-bold text-[#1A1C1E]" numberOfLines={2}>
                                                        {formatDate(clinicalData.approvedAt ?? clinicalData.timestamp)}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Prescription Green Symbol */}
                                            <Text className="text-[24px] font-inter-extrabold text-[#0F7635] mt-3 mb-1.5 ml-1">
                                                Rₓ
                                            </Text>

                                            {/* Medicines Listing */}
                                            <View className="gap-y-3">
                                                {medicines.map((med, index) => (
                                                    <View key={index}>
                                                        <View className="flex-row items-center justify-between py-1">
                                                            <Text className="text-[14px] font-inter-bold text-[#1A1C1E] flex-1 pr-3" numberOfLines={2}>
                                                                {med.name}
                                                            </Text>
                                                            <View className="bg-[#F4F6F8] rounded-[6px] px-2.5 py-1">
                                                                <Text className="text-[11px] font-inter-bold text-[#6A6A6A]">
                                                                    QTY: {med.quantity}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        {index < medicines.length - 1 && (
                                                            <View className="h-px bg-[#F4F6F8] mt-3" />
                                                        )}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    );
                                })}

                                {/* Compact Digitally Signed Rx Footer */}
                                <View style={{ borderTopWidth: 1, borderColor: '#EEEFF1', borderStyle: 'solid', marginTop: 14, paddingTop: 12 }}>
                                    <View className="flex-row justify-between items-center gap-3">
                                        {/* Left Side: Digitally Signed Label & Disclaimer */}
                                        <View className="flex-1">
                                            <View className="flex-row items-center bg-[#F1FFF6] border border-[#0F763522] rounded-full px-2 py-0.5 self-start mb-1.5">
                                                <icons.verified_user_round width={12} height={12} fill="#0F7635" />
                                                <Text className="text-[9px] font-inter-bold text-[#0F7635] ml-1 uppercase tracking-[0.3px]">
                                                    DIGITALLY SIGNED RX
                                                </Text>
                                            </View>
                                            <Text className="text-[9px] font-inter text-brand-subtext leading-[13px]">
                                                This is a computer-generated prescription verified via CareSure Digital Health and does not require a physical signature.
                                            </Text>
                                        </View>

                                        {/* Right Side: Signature Image or Doctor Name */}
                                        <View className="items-center justify-center">
                                            {signatureUrl ? (
                                                <View className="items-center">
                                                    <Image
                                                        source={{ uri: signatureUrl }}
                                                        style={{ width: 135, height: 46 }}
                                                        resizeMode="contain"
                                                    />
                                                    <Text className="text-[7.5px] font-inter-bold text-[#919EAB] uppercase tracking-[0.5px] mt-1 text-center">
                                                        AUTHORIZED SIGNATORY
                                                    </Text>
                                                </View>
                                            ) : (
                                                <View className="items-center">
                                                    <Text className="text-[11px] font-inter-bold text-brand-text">
                                                        Dr. {docName}
                                                    </Text>
                                                    <Text className="text-[7.5px] font-inter-bold text-[#919EAB] uppercase tracking-[0.5px] mt-0.5 text-center">
                                                        AUTHORIZED SIGNATORY
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                </View>

                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Animated.View>
            </GestureDetector>
        </Modal>
    );
};
