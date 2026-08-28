import { asError } from "@/src/api/errors";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useState, useMemo } from "react";
import {
  Alert,
  Platform,
  Text,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from "react-native";
import { useSystemTemplate } from "@/src/hooks/queries/useSystemTemplates";
import { useUploadConfig } from "@/src/hooks/queries/useSettings";
import { WebView } from "react-native-webview";
import * as Print from "expo-print";
import { File } from "expo-file-system";
import { downloadLocalFile } from "@/src/utils/fileDownload";
import { logger } from "@/src/utils/logger";

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
  // The API nests patient info under `patient` (matches the web RxModal).
  // Flat fields are kept as an optional fallback for older payloads.
  patient?: {
    name?: string;
    age?: string | number;
    gender?: string;
  };
  patientName?: string;
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
  const [downloading, setDownloading] = useState(false);
  const { validityMonths } = useUploadConfig();

  // Renders the prescription HTML to a PDF and saves it — no print dialog.
  // printToFileAsync writes a temp cache file we clean up after the download.
  const handleDownload = async () => {
    if (downloading || !printHtml) return;
    setDownloading(true);
    try {
      const { uri } = await Print.printToFileAsync({ html: printHtml });
      const sanitizedOrderId = (orderId ?? "prescription").replace(
        /[^a-zA-Z0-9-_]/g,
        "",
      );
      await downloadLocalFile(uri, `RX-${sanitizedOrderId}.pdf`);
      // Android already copied the file into Downloads, so the temp is safe to
      // remove; iOS still references it for the preview/share, so leave it for
      // the OS cache to purge.
      if (Platform.OS === "android") {
        try {
          new File(uri).delete();
        } catch (cleanupError) {
          if (__DEV__)
            logger.debug("[RxDownload] temp cleanup failed:", cleanupError);
        }
      }
    } catch (e) {
      Alert.alert(
        "Download Error",
        asError(e).message ||
          "Could not download the prescription. Please try again.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const prescriptions = clinicalData?.prescriptions || [];
  const doctorName =
    clinicalData?.doctorSnapshot?.name ??
    clinicalData?.doctorName ??
    "Dr. Raj Kumar";
  const regNumber =
    clinicalData?.doctorSnapshot?.registrationNumber ??
    clinicalData?.registrationNumber ??
    "Cs-0001";
  const doctorSignature = clinicalData?.doctorSnapshot?.signatureUrl || "";

  const variables = useMemo(() => {
    const rx = clinicalData?.prescriptions?.[activePatientIdx] || {};
    const medicines = rx.medicines || [];

    const issueDate = new Date(
      clinicalData?.approvedAt || orderCreatedAt || new Date(),
    );
    const expiryDate = new Date(issueDate);
    expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

    // Read the nested `patient` object first (the real API shape, same as the
    // web RxModal); fall back to the flat fields for older payloads.
    const ageVal = rx.patient?.age ?? rx.patientAge;
    const genderVal = rx.patient?.gender ?? rx.patientGender ?? "";
    const patientNameVal =
      rx.patient?.name ?? rx.patientName ?? "Not Specified";

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
      medicines: medicines.map((med) => ({
        name: med.name || "Unknown Medicine",
        description: med.instructions || "",
        quantity: String(med.quantity ?? 1),
      })),
    };
  }, [
    activePatientIdx,
    clinicalData?.approvedAt,
    clinicalData?.prescriptions,
    doctorName,
    doctorSignature,
    orderCreatedAt,
    orderId,
    regNumber,
    validityMonths,
  ]);

  const {
    data: template,
    isLoading,
    isError,
  } = useSystemTemplate(
    "rx.generated",
    "DOCUMENT",
    variables,
    visible && prescriptions.length > 0,
  );

  const htmlContent = useMemo(() => {
    if (!template?.body) return "";
    let body = template.body;

    const baseWidth = 800;
    const padding = 32;
    const availableWidth = screenWidth - padding;
    const scale = availableWidth / baseWidth;

    const previewStyle = `
      <style>
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          width: ${baseWidth}px !important;
          min-width: ${baseWidth}px !important;
          background-color: #ffffff !important;
          zoom: ${scale} !important;
          -webkit-text-size-adjust: none !important;
          overflow-x: hidden !important;
        }
      </style>
    `;
    const metaTag = `<meta name="viewport" content="width=${baseWidth}, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`;

    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${metaTag}${previewStyle}`);
    } else {
      body = metaTag + previewStyle + body;
    }
    return body;
  }, [template, screenWidth]);

  // Print variant of the same template — no device-width `zoom` (that fits the
  // phone screen, not a PDF page). Renders at the design's natural width with
  // page margins so long medicine lists flow onto extra pages without clipping,
  // and color-exact so logos/signatures/coloured backgrounds print correctly.
  /* eslint-disable react-hooks/preserve-manual-memoization */
  const printHtml = useMemo(() => {
    if (!template?.body) return "";
    let body = template.body;

    const printStyle = `
      <style>
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background-color: #ffffff !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        @page { margin: 24px; }
      </style>
    `;
    const metaTag = `<meta name="viewport" content="width=device-width, initial-scale=1.0">`;

    if (body.includes("<head>")) {
      body = body.replace("<head>", `<head>${metaTag}${printStyle}`);
    } else {
      body = metaTag + printStyle + body;
    }
    return body;
  }, [template]);
  /* eslint-enable react-hooks/preserve-manual-memoization */

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
          paddingBottom:
            Math.max(adjustedBottom, exactScale(32)) + exactScale(24),
        }}
      >
        {/* Header Row with Title + download (icon only) on the right */}
        <View
          className="flex-row items-center justify-between"
          style={{ marginBottom: exactScale(16) }}
        >
          <Text
            className="font-inter-bold text-[#1A1C1E] flex-1"
            style={{ fontSize: moderateScale(18) }}
          >
            Verified Digital Prescription
          </Text>
          <Touchable
            onPress={handleDownload}
            disabled={downloading}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: exactScale(12) }}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <icons.download
                width={exactScale(20)}
                height={exactScale(20)}
                fill="#0F7635"
              />
            )}
          </Touchable>
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
            {prescriptions.map((p, idx) => {
              const active = activePatientIdx === idx;
              const name =
                p.patientName ?? p.patient?.name ?? `Patient ${idx + 1}`;
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
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: screenHeight * 0.4,
            }}
          >
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
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              height: screenHeight * 0.4,
            }}
          >
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
            {/* Static backend HTML only. "about:" covers the source={{html}}
                document; a wildcard would let injected markup navigate anywhere,
                and JS is disabled outright since the document never needs it. */}
            <WebView
              originWhitelist={["about:"]}
              javaScriptEnabled={false}
              source={{ html: htmlContent }}
              style={{ flex: 1, backgroundColor: "#ffffff" }}
              containerStyle={{ backgroundColor: "#ffffff" }}
              scalesPageToFit={true}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            />
          </View>
        ) : null}
      </BottomSheetView>
    </GorhomBottomSheet>
  );
};
