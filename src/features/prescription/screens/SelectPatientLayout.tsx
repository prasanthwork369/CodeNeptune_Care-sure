import { HealthProblemSheet } from "@/src/features/prescription/components/HealthProblemSheet";
import { AddPatientSheet } from "@/src/features/profile/components/AddPatientSheet";
import { PatientChipSkeleton } from "@/src/features/profile/components/PatientSkeleton";
import { PatientEmptyState } from "../sections/select-patient";
import { AppButton } from "@/src/components/ui/AppButton";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { UploadPrescriptionSheet } from "../components/UploadPrescriptionSheet";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useSelectPatient } from "@/src/features/prescription/hooks/useSelectPatient";
import { exactScale } from "@/src/utils/exactScale";
import { getAge } from "@/src/utils/patient";
import { resolveAssetUrl } from "@/src/utils/urls";
import { format } from "@/src/utils/validation";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles as s } from "./SelectPatientLayout.styles";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

export const SelectPatientLayout: React.FC = () => {
  const {
    router,
    toPay,
    prescriptionItems,
    isAddingImage,
    removingImageIndex,
    addImageFromLibrary,
    addImageFromCamera,
    addImageFromPdf,
    removeImage,
    members,
    loading,
    refreshing,
    listError,
    refetch,
    setSelectedPatientId,
    selectedPatient,
    symptoms,
    setSymptoms,
    selectedHealthProblem,
    setSelectedHealthProblem,
    customProblemText,
    setCustomProblemText,
    showHealthSheet,
    setShowHealthSheet,
    isAddPatientSheetVisible,
    setIsAddPatientSheetVisible,
    editingPhone,
    phoneValue,
    handlePhoneChange,
    phoneError,
    savingPhone,
    editingPatient,
    setEditingPatient,
    showEmptyState,
    handleUpdatePhone,
    handleAddPatient,
    handleEditPatient,
    handleDeletePatient,
    handleProceed,
  } = useSelectPatient();
  const adjustedBottom = useAdjustedBottomInset();
  const listErrorState = useQueryErrorState(listError);
  const [isUploadSheetVisible, setIsUploadSheetVisible] = React.useState(false);

  const handleViewPrescription = React.useCallback(
    (index: number) => {
      const item = prescriptionItems[index];
      if (!item) return;

      const reordered = [
        item.localUri,
        ...prescriptionItems
          .filter((_, i) => i !== index)
          .map((p) => p.localUri),
      ];

      router.push({
        pathname: "/(prescription)/prescription-viewer",
        params: {
          imageUrls: JSON.stringify(reordered),
          patientName: selectedPatient?.name ?? "",
          uploadedDate: new Date().toLocaleDateString(),
          source: "view_only",
        },
      });
    },
    [prescriptionItems, router, selectedPatient?.name],
  );

  return (
    <View style={s.root}>
      <ScreenHeader
        title="Select Patient"
        rightSlot={
          showEmptyState || (!loading && listErrorState && members.length === 0) ? undefined : (
            <Touchable
              onPress={() => {
                setEditingPatient(null);
                setIsAddPatientSheetVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={s.addPatientHeaderBtn}>
                ADD PATIENT
              </Text>
            </Touchable>
          )
        }
      />

      {!loading && listErrorState && members.length === 0 ? (
        listErrorState === "offline" ? (
          <NoInternetState
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        ) : (
          <RetryState
            title="Couldn't load patients"
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        )
      ) : showEmptyState ? (
        <PatientEmptyState
          onAddPress={() => {
            setEditingPatient(null);
            setIsAddPatientSheetVisible(true);
          }}
        />
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            overScrollMode="auto"
            style={{ flex: 1 }}
            contentContainerStyle={[
              s.scrollContent,
              {
                paddingBottom: adjustedBottom + exactScale(90),
              },
            ]}
          >
            {prescriptionItems.length > 0 && (
              <View>
                <Text style={s.sectionTitle}>
                  Prescription
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={s.rxThumbContainer}>
                    <Touchable
                      onPress={() => setIsUploadSheetVisible(true)}
                      disabled={isAddingImage}
                      style={s.rxAddPhotoBtn}
                    >
                      {isAddingImage ? (
                        <ActivityIndicator size="small" color="#0F7635" />
                      ) : (
                        <icons.add_photo width={24} height={24} />
                      )}
                    </Touchable>
                    {prescriptionItems.map((item, index) => (
                      <View key={index} style={s.rxThumbItemWrap}>
                        <Touchable
                          activeOpacity={0.8}
                          onPress={() => handleViewPrescription(index)}
                          style={s.rxThumbItem}
                        >
                          {isPdf(item.localUri, item.type) ? (
                            <View style={s.rxPdfThumbBox}>
                              <icons.upload_file width={22} height={22} />
                              <Text style={s.rxPdfThumbText}>
                                PDF
                              </Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: item.localUri }}
                              style={s.rxImage}
                              resizeMode="contain"
                            />
                          )}
                          {removingImageIndex === index && (
                            <View style={s.rxRemovingOverlay}>
                              <ActivityIndicator size="small" color="#0F7635" />
                            </View>
                          )}
                        </Touchable>

                        <Touchable
                          onPress={() => removeImage(index)}
                          disabled={removingImageIndex !== null}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          style={s.rxRemoveBadge}
                        >
                          <icons.close_small
                            width={10}
                            height={10}
                            fill="#222222"
                          />
                        </Touchable>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <View style={s.dashedDivider} />
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={s.patientsScrollView}
            >
              <View style={s.patientsRow}>
                {loading ? (
                  <PatientChipSkeleton />
                ) : members.length === 0 ? (
                  <Text style={s.noPatientsText}>
                    No patients yet. Tap &quot;ADD PATIENT&quot;
                  </Text>
                ) : (
                  members.map((p) => {
                    const sel = selectedPatient?.id === p.id;
                    return (
                      <Touchable
                        key={p.id}
                        onPress={() => setSelectedPatientId(p.id)}
                        activeOpacity={0.8}
                        style={[
                          s.patientChip,
                          {
                            borderColor: sel ? "#0F7635" : "#E0E0E0",
                            backgroundColor: sel ? "#0F7635" : "#FFFFFF",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.patientChipText,
                            {
                              color: sel ? "#FFFFFF" : "#6A6A6A",
                            },
                          ]}
                        >
                          {p.name}{" "}
                          <Text>({p.relationship})</Text>
                        </Text>
                      </Touchable>
                    );
                  })
                )}
              </View>
            </ScrollView>

            <Text style={s.sectionHeadingBold}>
              Doctor will reach you at
            </Text>
            <View style={s.phoneRowWrapper}>
              <View style={s.phoneInputBox}>
                {editingPhone ? (
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                    <Text style={s.phoneCountryPrefix}>
                      +91
                    </Text>
                    <View style={s.phonePrefixDivider} />
                    <TextInput
                      ref={(r) => applyDigitsOnlyFilter(r, 10)}
                      style={s.contactInput}
                      value={phoneValue}
                      onChangeText={handlePhoneChange}
                      keyboardType="number-pad"
                      autoFocus
                      placeholderTextColor="#6A6A6A"
                      placeholder="Enter mobile number"
                    />
                  </View>
                ) : (
                  <Text
                    style={[
                      s.contactValue,
                      {
                        fontFamily: selectedPatient?.phone
                          ? "Inter_600SemiBold"
                          : "Inter_400Regular",
                        color: selectedPatient?.phone ? "#222222" : "#919EAB",
                      },
                    ]}
                  >
                    {format.phone(selectedPatient?.phone) ||
                      "e.g. +91 98765 43210"}
                  </Text>
                )}
                <Touchable
                  onPress={handleUpdatePhone}
                  disabled={savingPhone}
                  activeOpacity={0.7}
                >
                  {savingPhone ? (
                    <ActivityIndicator size="small" color="#0F7635" />
                  ) : (
                    <Text style={s.phoneActionText}>
                      {editingPhone ? "Done" : "Edit"}
                    </Text>
                  )}
                </Touchable>
              </View>
              {!!phoneError && (
                <Text style={s.phoneErrorText}>
                  {phoneError}
                </Text>
              )}
            </View>

            <View style={s.vitalsRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.sectionHeadingBold}>
                  Age
                </Text>
                <View style={s.vitalCard}>
                  {selectedPatient?.dateOfBirth ? (
                    (() => {
                      const [, value, unit] =
                        getAge(selectedPatient.dateOfBirth).match(
                          /^(\d+)\s*(.+)$/,
                        ) ?? [];
                      const unitLabel = unit?.startsWith("yr")
                        ? "Years old"
                        : unit?.startsWith("month")
                          ? "Months old"
                          : unit?.startsWith("day")
                            ? "Days old"
                            : unit;
                      return (
                        <Text style={s.vitalCardText}>
                          <Text style={s.vitalValueBold}>
                            {value}
                          </Text>
                          <Text style={s.vitalUnitSubtext}>
                            {" "}
                            {unitLabel}
                          </Text>
                        </Text>
                      );
                    })()
                  ) : (
                    <Text style={[s.vitalCardText, s.vitalValueBold]}>
                      —
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <Text style={s.sectionHeadingBold}>
                  Gender
                </Text>
                <View style={s.genderCard}>
                  {selectedPatient?.gender === "FEMALE" ? (
                    <icons.female width={18} height={18} color="#0F7635" />
                  ) : (
                    <icons.male width={18} height={18} color="#0F7635" />
                  )}
                  <Text style={s.genderCardText}>
                    {selectedPatient?.gender
                      ? selectedPatient.gender.charAt(0) +
                        selectedPatient.gender.slice(1).toLowerCase()
                      : "—"}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={s.sectionHeadingBold}>
              Select Your Health Problem
            </Text>
            <Touchable
              onPress={() => setShowHealthSheet(true)}
              style={s.healthSelector}
              activeOpacity={0.85}
            >
              {selectedHealthProblem ? (
                <View style={s.healthSelectedContent}>
                  {selectedHealthProblem.icon &&
                  (selectedHealthProblem.icon.startsWith("http") ||
                    selectedHealthProblem.icon.startsWith("/") ||
                    selectedHealthProblem.icon.includes(".")) ? (
                    <RemoteIcon
                      uri={resolveAssetUrl(selectedHealthProblem.icon)}
                      size={24}
                      style={{ borderRadius: 12 }}
                    />
                  ) : (
                    <Text style={s.healthEmoji}>
                      {selectedHealthProblem.icon}
                    </Text>
                  )}
                  <Text style={s.healthLabel}>
                    {selectedHealthProblem.label}
                  </Text>
                </View>
              ) : (
                <Text style={s.healthPlaceholder}>
                  Select
                </Text>
              )}
              <icons.down_arrow width={14} height={14} />
            </Touchable>

            {selectedHealthProblem?.id === "other" && (
              <View style={s.customProblemWrapper}>
                <TextInput
                  value={customProblemText}
                  onChangeText={setCustomProblemText}
                  placeholder="Type the health problem..."
                  placeholderTextColor="#6A6A6A"
                  style={s.customProblemInput}
                />
              </View>
            )}

            <Text style={s.sectionHeadingBold}>
              Help us understand your symptoms
            </Text>
            <TextInput
              placeholder="Eg: Mild fever and body pain"
              placeholderTextColor="#6A6A6A"
              allowFontScaling={false}
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              style={s.symptomsInput}
            />
          </ScrollView>

          <View
            style={[
              s.footer,
              { paddingBottom: adjustedBottom + exactScale(16) },
            ]}
          >
            <AppButton
              title="Continue"
              onPress={handleProceed}
              size="md"
              style={s.continueButton}
              textStyle={s.continueButtonText}
              testID="select-patient-continue"
              accessibilityLabel="Continue"
              accessibilityHint="Continues with the selected patient details"
            />
          </View>
        </>
      )}

      <AddPatientSheet
        isVisible={isAddPatientSheetVisible}
        onClose={() => {
          setIsAddPatientSheetVisible(false);
          setEditingPatient(null);
        }}
        editPatient={editingPatient}
        onAdd={handleAddPatient}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />
      <HealthProblemSheet
        isVisible={showHealthSheet}
        selected={selectedHealthProblem}
        onSelect={setSelectedHealthProblem}
        onClose={() => setShowHealthSheet(false)}
      />
      <UploadPrescriptionSheet
        isVisible={isUploadSheetVisible}
        onClose={() => setIsUploadSheetVisible(false)}
        toPay={toPay}
        patientMemberId={selectedPatient?.id}
        onUploadFile={() => {
          setIsUploadSheetVisible(false);
          setTimeout(addImageFromLibrary, 400);
        }}
        onTakePhoto={() => {
          setIsUploadSheetVisible(false);
          setTimeout(addImageFromCamera, 400);
        }}
        onUploadPdf={() => {
          setIsUploadSheetVisible(false);
          setTimeout(addImageFromPdf, 400);
        }}
      />
    </View>
  );
};
