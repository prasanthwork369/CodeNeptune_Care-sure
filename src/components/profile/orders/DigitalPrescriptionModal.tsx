import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState, useMemo } from "react";
import { Image, Text, useWindowDimensions, View, ActivityIndicator } from "react-native";
import { useSystemTemplate } from "@/src/hooks/queries/useSystemTemplates";
import { WebView } from "react-native-webview";

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
  orderId?: string;
  orderCreatedAt?: string | Date;
}

function formatDateString(value: Date): string {
  const day = String(value.getDate()).padStart(2, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const year = value.getFullYear();
  return `${day}/${month}/${year}`;
}

export const DigitalPrescriptionModal: React.FC<
  DigitalPrescriptionModalProps
> = ({ visible, onClose, clinicalData, orderId, orderCreatedAt }) => {
  const adjustedBottom = useAdjustedBottomInset();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [activePatientIdx, setActivePatientIdx] = useState(0);

  const prescriptions = clinicalData?.prescriptions || [];
  const rx = prescriptions[activePatientIdx] || {};
  const medicines = rx.medicines || [];
  const doctorName =
    clinicalData?.doctorSnapshot?.name ??
    clinicalData?.doctorName ??
    "Dr. Raj Kumar";
  const regNumber =
    clinicalData?.doctorSnapshot?.registrationNumber ??
    clinicalData?.registrationNumber ??
    "Cs-0001";
  const doctorSignature = clinicalData?.doctorSnapshot?.signatureUrl || "";

  const issueDate = new Date(
    clinicalData?.approvedAt || orderCreatedAt || new Date()
  );
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + 6); // standard 6 months validity

  const variables = useMemo(() => {
    const ageVal = rx.patientAge;
    const genderVal = rx.patientGender || "";
    const patientNameVal = rx.patientName || "Not Specified";

    return {
      doctorName,
      doctorRegistrationNumber: regNumber,
      prescriptionNo: orderId ? `RX-${orderId}` : "",
      date: formatDateString(issueDate),
      expiryDate: formatDateString(expiryDate),
      dob: "",
      age: ageVal !== undefined && ageVal !== null ? String(ageVal) : "",
      gender: genderVal,
      patientName: patientNameVal,
      diagnosis: "",
      doctorSignature: doctorSignature,
      medicines: medicines.map((med: any) => ({
        name: med.name || "Unknown Medicine",
        description: med.instructions || "",
        quantity: String(med.quantity ?? 1),
      })),
    };
  }, [
    doctorName,
    regNumber,
    orderId,
    rx,
    medicines,
    doctorSignature,
    issueDate,
    expiryDate,
  ]);

  const {
    data: template,
    isLoading,
    isError,
  } = useSystemTemplate(
    "rx.generated",
    "DOCUMENT",
    variables,
    visible && prescriptions.length > 0
  );

  const htmlContent = useMemo(() => {
    if (!template?.body) return "";
    let body = template.body;

    // Template design width is 680px.
    // Calculate viewport scale based on device screen layout (padding: 20px on each side).
    const containerWidth = screenWidth - 40;
    const scale = containerWidth / 510;
    
    const zoomStyle = `
      <style>
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          zoom: ${scale.toFixed(3)} !important;
          -webkit-text-size-adjust: none !important;
          background-color: #ffffff !important;
        }
      </style>
    `;

    const metaTag = `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">`;

    if (!body.includes("viewport")) {
      if (body.includes("<head>")) {
        body = body.replace("<head>", `<head>${metaTag}${zoomStyle}`);
      } else {
        body = metaTag + zoomStyle + body;
      }
    } else {
      // If template already has head, inject the zoomStyle
      if (body.includes("<head>")) {
        body = body.replace("<head>", `<head>${zoomStyle}`);
      }
    }
    return body;
  }, [template?.body, screenWidth]);

  if (!clinicalData || prescriptions.length === 0) {
    return null;
  }

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
        {/* Header Row with Title */}
        <View style={{ marginBottom: exactScale(16) }}>
          <Text
            className="font-inter-bold text-[#1A1C1E]"
            style={{ fontSize: moderateScale(18) }}
          >
            Verified Digital Prescription
          </Text>
        </View>

        {/* Tab System for Multiple Patients */}
        {prescriptions.length > 1 && (
          <View
            className="flex-row flex-wrap gap-2 pb-2 mb-2"
            style={{
              borderBottomWidth: 1,
              borderColor: "#E5E7EB",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {prescriptions.map((p: any, idx: number) => {
              const active = activePatientIdx === idx;
              const name = p.patientName ?? p.patient?.name ?? `Patient ${idx + 1}`;
              return (
                <Touchable
                  key={idx}
                  onPress={() => setActivePatientIdx(idx)}
                  className="rounded-xl"
                  style={{
                    backgroundColor: active ? "#0F7635" : "#FFFFFF",
                    borderWidth: 1,
                    borderColor: active ? "#0F7635" : "#E5E7EB",
                    paddingHorizontal: exactScale(12),
                    paddingVertical: exactScale(6),
                    borderRadius: exactScale(8),
                    marginRight: exactScale(6),
                    marginBottom: exactScale(6),
                  }}
                >
                  <Text
                    style={{
                      color: active ? "#FFFFFF" : "#4B5563",
                      fontSize: moderateScale(12),
                      fontWeight: "bold",
                    }}
                  >
                    {name}
                  </Text>
                </Touchable>
              );
            })}
          </View>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={{ alignItems: "center", justifyContent: "center", height: screenHeight * 0.4 }}>
            <ActivityIndicator size="large" color="#0F7635" />
            <Text
              style={{
                fontSize: moderateScale(13),
                color: "#6B7280",
                marginTop: 12,
              }}
            >
              Loading prescription…
            </Text>
          </View>
        )}

        {/* Error State */}
        {isError && (
          <View style={{ alignItems: "center", justifyContent: "center", height: screenHeight * 0.4 }}>
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "bold",
                color: "#DC2626",
              }}
            >
              Could not load prescription
            </Text>
            <Text
              style={{
                fontSize: moderateScale(12),
                color: "#9CA3AF",
                marginTop: 4,
                textAlign: "center",
              }}
            >
              The prescription template could not be fetched.
            </Text>
          </View>
        )}

        {/* Prescription Document Rendered via WebView */}
        {!isLoading && !isError && htmlContent ? (
          <View
            style={{
              height: screenHeight * 0.6,
              borderRadius: exactScale(12),
              borderWidth: 1,
              borderColor: "#EEEFF1",
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
            }}
          >
            <WebView
              originWhitelist={["*"]}
              source={{ html: htmlContent }}
              style={{ flex: 1, backgroundColor: "#ffffff" }}
              containerStyle={{ backgroundColor: "#ffffff" }}
              scalesPageToFit={true}
              nestedScrollEnabled
            />
          </View>
        ) : null}
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
