import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React from "react";
import { Image, Text, useWindowDimensions, View } from "react-native";

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
  if (!iso) return "—";
  const dateObj = new Date(iso);
  const datePart = dateObj.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const timePart = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart}, ${timePart}`;
}

export const DigitalPrescriptionModal: React.FC<
  DigitalPrescriptionModalProps
> = ({ visible, onClose, clinicalData }) => {
  const adjustedBottom = useAdjustedBottomInset();
  const { height: screenHeight } = useWindowDimensions();

  const docName =
    clinicalData.doctorSnapshot?.name ??
    clinicalData.doctorName ??
    "Medical Practitioner";
  const regNo =
    clinicalData.doctorSnapshot?.registrationNumber ??
    clinicalData.registrationNumber ??
    "—";
  const signatureUrl = clinicalData.doctorSnapshot?.signatureUrl;

  return (
    <GorhomBottomSheet
      isVisible={visible}
      onClose={onClose}
      backgroundStyle={{
        backgroundColor: "#fff",
        borderTopLeftRadius: exactScale(12),
        borderTopRightRadius: exactScale(12),
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(22),
          paddingBottom: Math.max(adjustedBottom, exactScale(32)) + exactScale(24),
        }}
      >
        {/* Header Row with Title (Static) */}
        <View style={{ marginBottom: exactScale(16) }}>
          <Text
            className="font-inter-bold text-[#1A1C1E]"
            style={{ fontSize: moderateScale(18) }}
          >
            Verified Digital Prescription
          </Text>
        </View>

        {/* Prescription Card Box */}
        <View
          className="bg-white border border-[#919EAB33] overflow-hidden shadow-sm"
          style={{
            borderRadius: exactScale(16),
          }}
        >
            {/* Green Top Border/Accent Band */}
            <View
              style={{ height: exactScale(6), backgroundColor: "#0F7635" }}
            />

            <View style={{ padding: exactScale(16) }}>
              {/* Doctor / Clinic Row */}
              <View
                className="flex-row justify-between items-start"
                style={{ marginBottom: exactScale(16) }}
              >
                {/* Left: Doctor Information */}
                <View
                  className="flex-1"
                  style={{ paddingRight: exactScale(16) }}
                >
                  <Text
                    className="font-inter-bold text-[#1A1C1E]"
                    style={{ fontSize: moderateScale(15) }}
                  >
                    Dr. {docName}
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-subtext uppercase"
                    style={{
                      fontSize: moderateScale(9),
                      letterSpacing: 0.5,
                      marginTop: exactScale(2),
                    }}
                  >
                    MEDICAL PRACTITIONER
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-text"
                    style={{
                      fontSize: moderateScale(11),
                      marginTop: exactScale(8),
                    }}
                  >
                    Reg No: {regNo}
                  </Text>
                </View>

                {/* Right: Caresure Clinics Info */}
                <View className="items-end">
                  <Text
                    className="font-inter-bold text-[#0F7635]"
                    style={{ fontSize: moderateScale(13) }}
                  >
                    CARESURE CLINICS
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-subtext"
                    style={{
                      fontSize: moderateScale(9),
                      marginTop: exactScale(2),
                    }}
                  >
                    Digital Health Service
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-subtext"
                    style={{ fontSize: moderateScale(9) }}
                  >
                    support@caresure.com
                  </Text>
                </View>
              </View>

              {/* Dynamic Loop rendering across multiple patient prescriptions */}
              {(clinicalData.prescriptions ?? []).map(
                (prescription, pIndex) => {
                  const patientName = prescription.patientName ?? "Patient";
                  const medicines = prescription.medicines ?? [];
                  const ageVal = prescription.patientAge;
                  const genderVal = prescription.patientGender;

                  let ageGenderDisplay = "—";
                  if (ageVal && genderVal) {
                    const capitalizedGender =
                      genderVal.charAt(0).toUpperCase() +
                      genderVal.slice(1).toLowerCase();
                    ageGenderDisplay = `${ageVal} Years / ${capitalizedGender}`;
                  } else if (ageVal) {
                    ageGenderDisplay = `${ageVal} Years`;
                  } else if (genderVal) {
                    ageGenderDisplay =
                      genderVal.charAt(0).toUpperCase() +
                      genderVal.slice(1).toLowerCase();
                  }

                  return (
                    <View
                      key={pIndex}
                      style={
                        pIndex > 0
                          ? {
                              marginTop: exactScale(22),
                              borderTopWidth: 1,
                              borderColor: "#EEEFF1",
                              borderStyle: "dashed",
                              paddingTop: exactScale(18),
                            }
                          : {}
                      }
                    >
                      {/* Patient Details Grid Columns */}
                      <View
                        className="bg-[#FAFAFA] border border-[#EEEFF1] flex-row justify-between"
                        style={{
                          borderRadius: exactScale(12),
                          paddingHorizontal: exactScale(12),
                          paddingVertical: exactScale(10),
                        }}
                      >
                        {/* Column 1: Patient Name */}
                        <View className="flex-1">
                          <Text
                            className="font-inter-semibold text-brand-subtext uppercase"
                            style={{
                              fontSize: moderateScale(10),
                              letterSpacing: 0.5,
                              marginBottom: exactScale(4),
                            }}
                          >
                            PATIENT NAME
                          </Text>
                          <Text
                            className="font-inter-bold text-[#1A1C1E]"
                            numberOfLines={1}
                            style={{ fontSize: moderateScale(13) }}
                          >
                            {patientName}
                          </Text>
                        </View>

                        {/* Column 2: Age / Gender */}
                        <View
                          className="flex-1 border-l border-r border-[#EEEFF1]"
                          style={{ paddingHorizontal: exactScale(8) }}
                        >
                          <Text
                            className="font-inter-semibold text-brand-subtext uppercase"
                            style={{
                              fontSize: moderateScale(10),
                              letterSpacing: 0.5,
                              marginBottom: exactScale(4),
                            }}
                          >
                            AGE / GENDER
                          </Text>
                          <Text
                            className="font-inter-bold text-[#1A1C1E]"
                            style={{ fontSize: moderateScale(13) }}
                          >
                            {ageGenderDisplay}
                          </Text>
                        </View>

                        {/* Column 3: Date & Time */}
                        <View
                          className="flex-1"
                          style={{ paddingLeft: exactScale(8) }}
                        >
                          <Text
                            className="font-inter-semibold text-brand-subtext uppercase"
                            style={{
                              fontSize: moderateScale(10),
                              letterSpacing: 0.5,
                              marginBottom: exactScale(4),
                            }}
                          >
                            DATE & TIME
                          </Text>
                          <Text
                            className="font-inter-bold text-[#1A1C1E]"
                            numberOfLines={2}
                            style={{ fontSize: moderateScale(11) }}
                          >
                            {formatDate(
                              clinicalData.approvedAt ?? clinicalData.timestamp,
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* Prescription Green Symbol */}
                      <Text
                        className="font-inter-extrabold text-[#0F7635]"
                        style={{
                          fontSize: moderateScale(24),
                          marginTop: exactScale(12),
                          marginBottom: exactScale(6),
                          marginLeft: exactScale(4),
                        }}
                      >
                        Rₓ
                      </Text>

                      {/* Medicines Listing */}
                      <View style={{ gap: exactScale(12) }}>
                        {medicines.map((med, index) => (
                          <View key={index}>
                            <View
                              className="flex-row items-center justify-between"
                              style={{ paddingVertical: exactScale(4) }}
                            >
                              <Text
                                className="font-inter-bold text-[#1A1C1E] flex-1"
                                numberOfLines={2}
                                style={{
                                  fontSize: moderateScale(14),
                                  paddingRight: exactScale(12),
                                }}
                              >
                                {med.name}
                              </Text>
                              <View
                                className="bg-[#F4F6F8]"
                                style={{
                                  borderRadius: exactScale(6),
                                  paddingHorizontal: exactScale(10),
                                  paddingVertical: exactScale(4),
                                }}
                              >
                                <Text
                                  className="font-inter-bold text-[#6A6A6A]"
                                  style={{ fontSize: moderateScale(11) }}
                                >
                                  QTY: {med.quantity}
                                </Text>
                              </View>
                            </View>
                            {index < medicines.length - 1 && (
                              <View
                                style={{
                                  height: 1,
                                  backgroundColor: "#F4F6F8",
                                  marginTop: exactScale(12),
                                }}
                              />
                            )}
                          </View>
                        ))}
                      </View>
                    </View>
                  );
                },
              )}

              {/* Compact Digitally Signed Rx Footer */}
              <View
                style={{
                  borderTopWidth: 1,
                  borderColor: "#EEEFF1",
                  borderStyle: "solid",
                  marginTop: exactScale(14),
                  paddingTop: exactScale(12),
                }}
              >
                <View
                  className="flex-row justify-between items-center"
                  style={{ gap: exactScale(12) }}
                >
                  {/* Left Side: Digitally Signed Label & Disclaimer */}
                  <View className="flex-1">
                    <View
                      className="flex-row items-center bg-[#F1FFF6] border border-[#0F763522]"
                      style={{
                        borderRadius: exactScale(12),
                        paddingHorizontal: exactScale(8),
                        paddingVertical: exactScale(2),
                        alignSelf: "flex-start",
                        marginBottom: exactScale(6),
                      }}
                    >
                      <icons.verified_user_round
                        width={exactScale(12)}
                        height={exactScale(12)}
                        fill="#0F7635"
                      />
                      <Text
                        className="font-inter-bold text-[#0F7635]"
                        style={{
                          fontSize: moderateScale(9),
                          marginLeft: exactScale(4),
                          letterSpacing: 0.3,
                        }}
                      >
                        DIGITALLY SIGNED RX
                      </Text>
                    </View>
                    <Text
                      className="font-inter text-brand-subtext"
                      style={{
                        fontSize: moderateScale(9),
                        lineHeight: moderateScale(13),
                      }}
                    >
                      This is a computer-generated prescription verified via
                      CareSure Digital Health and does not require a physical
                      signature.
                    </Text>
                  </View>

                  {/* Right Side: Signature Image or Doctor Name */}
                  <View className="items-center justify-center">
                    {signatureUrl ? (
                      <View className="items-center">
                        <Image
                          source={{ uri: signatureUrl }}
                          style={{
                            width: exactScale(135),
                            height: exactScale(46),
                          }}
                          resizeMode="contain"
                        />
                        <Text
                          className="font-inter-bold text-[#919EAB] text-center"
                          style={{
                            fontSize: moderateScale(7.5),
                            letterSpacing: 0.5,
                            marginTop: exactScale(4),
                          }}
                        >
                          AUTHORIZED SIGNATORY
                        </Text>
                      </View>
                    ) : (
                      <View className="items-center">
                        <Text
                          className="font-inter-bold text-brand-text"
                          style={{ fontSize: moderateScale(11) }}
                        >
                          Dr. {docName}
                        </Text>
                        <Text
                          className="font-inter-bold text-[#919EAB] text-center"
                          style={{
                            fontSize: moderateScale(7.5),
                            letterSpacing: 0.5,
                            marginTop: exactScale(2),
                          }}
                        >
                          AUTHORIZED SIGNATORY
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </BottomSheetView>
    </GorhomBottomSheet>
  );
};
