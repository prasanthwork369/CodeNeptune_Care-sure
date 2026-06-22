import { GorhomBottomSheet } from '@/src/components/ui/GorhomBottomSheet';
import { Touchable } from '@/src/components/ui/Touchable';
import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import {
    Text,
    View,
    Image,
    useWindowDimensions,
} from 'react-native';
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { icons } from '@/src/constants/icons';

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
    const adjustedBottom = useAdjustedBottomInset();
    const { height: screenHeight } = useWindowDimensions();

    const docName = clinicalData.doctorSnapshot?.name ?? clinicalData.doctorName ?? 'Medical Practitioner';
    const regNo = clinicalData.doctorSnapshot?.registrationNumber ?? clinicalData.registrationNumber ?? '—';
    const signatureUrl = clinicalData.doctorSnapshot?.signatureUrl;

    return (
        <GorhomBottomSheet
            isVisible={visible}
            onClose={onClose}
            backgroundStyle={{ backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
        >
                <BottomSheetView
                    style={{
                        paddingHorizontal: 20,
                        paddingTop: 22,
                        paddingBottom: Math.max(adjustedBottom, 16) + 16,
                    }}
                >
                    {/* Header Row with Title and Close Button */}
                    <View className="flex-row justify-between items-center mb-5">
                        <Text className="text-[18px] font-inter-bold text-[#1A1C1E]">
                            Verified Digital Prescription
                        </Text>
                        <Touchable
                            onPress={onClose}
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

                    <BottomSheetScrollView
                        showsVerticalScrollIndicator={false}
                        style={{ maxHeight: Math.min(500, screenHeight - adjustedBottom - 220) }}
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
                    </BottomSheetScrollView>
                </BottomSheetView>
        </GorhomBottomSheet>
    );
};
