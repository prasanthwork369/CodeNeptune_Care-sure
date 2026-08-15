import { HealthProblemSheet } from "@/src/features/prescription/components/HealthProblemSheet";
import { AddPatientSheet } from "@/src/features/profile/components/AddPatientSheet";
import { PatientChipSkeleton } from "@/src/features/profile/components/PatientSkeleton";
import { PatientEmptyState } from "../sections/select-patient";
import { AppButton } from "@/src/components/ui/AppButton";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { UploadPrescriptionSheet } from "@/src/components/upload/UploadPrescriptionSheet";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useSelectPatient } from "@/src/features/prescription/hooks/useSelectPatient";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { getAge } from "@/src/utils/patient";
import { resolveAssetUrl } from "@/src/utils/urls";
import { format } from "@/src/utils/validation";
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
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title="Select Patient"
        rightSlot={
          showEmptyState ? undefined : (
            <Touchable
              onPress={() => {
                setEditingPatient(null);
                setIsAddPatientSheetVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text
                className="font-inter-bold text-[#0F7635]"
                style={{ fontSize: moderateScale(13) }}
              >
                ADD PATIENT
              </Text>
            </Touchable>
          )
        }
      />

      {showEmptyState ? (
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
            className="flex-1"
            contentContainerStyle={{
              ...s.scrollContent,
              paddingBottom: adjustedBottom + exactScale(90),
            }}
          >
            {prescriptionItems.length > 0 && (
              // No bottom margin here: the dashed divider below already owns
              // the spacing (marginVertical), so an extra mb-4 would make the
              // gap under the line double the gap above it.
              <View>
                <Text
                  className="font-inter-semibold text-[#1A1C1E] mb-[10px]"
                  style={{ fontSize: moderateScale(14) }}
                >
                  Prescription
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row" style={{ gap: exactScale(10) }}>
                    <Touchable
                      onPress={() => setIsUploadSheetVisible(true)}
                      disabled={isAddingImage}
                      className="w-[72px] h-[72px] rounded-[10px] border border-[#919EAB33] bg-[#FCFDFF] items-center justify-center"
                    >
                      {isAddingImage ? (
                        <ActivityIndicator size="small" color="#0F7635" />
                      ) : (
                        <icons.add_photo width={24} height={24} />
                      )}
                    </Touchable>
                    {prescriptionItems.map((item, index) => (
                      <View
                        key={index}
                        style={{ position: "relative", width: 72, height: 72 }}
                      >
                        <Touchable
                          activeOpacity={0.8}
                          onPress={() => handleViewPrescription(index)}
                          className="w-[72px] h-[72px] rounded-[10px] overflow-hidden border border-[#919EAB33] bg-[#F9FAFB]"
                        >
                          {isPdf(item.localUri, item.type) ? (
                            <View className="flex-1 items-center justify-center">
                              <icons.upload_file width={22} height={22} />
                              <Text
                                className="font-inter-bold text-[#1A1C1E] mt-0.5"
                                style={{ fontSize: moderateScale(8) }}
                              >
                                PDF
                              </Text>
                            </View>
                          ) : (
                            <Image
                              source={{ uri: item.localUri }}
                              style={{ width: "100%", height: "100%" }}
                              resizeMode="contain"
                            />
                          )}
                          {removingImageIndex === index && (
                            <View
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: "rgba(255,255,255,0.7)",
                              }}
                            >
                              <ActivityIndicator size="small" color="#0F7635" />
                            </View>
                          )}
                        </Touchable>

                        {/* Remove (X) badge — mirrors the web ImageUpload */}
                        <Touchable
                          onPress={() => removeImage(index)}
                          disabled={removingImageIndex !== null}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            width: 20,
                            height: 20,
                            borderRadius: 10,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "#FFFFFF",
                            borderWidth: 1,
                            borderColor: "#919EAB33",
                            elevation: 2,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.1,
                            shadowRadius: 1,
                            zIndex: 30,
                          }}
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
                <View
                  style={{
                    borderTopWidth: 1.5,
                    borderColor: "#E5E7EB",
                    borderStyle: "dashed",
                    marginVertical: exactScale(16),
                  }}
                />
              </View>
            )}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 16 }}
            >
              <View className="flex-row pr-1" style={{ gap: exactScale(8) }}>
                {loading ? (
                  <PatientChipSkeleton />
                ) : members.length === 0 ? (
                  <Text
                    className="font-inter text-[#919EAB] py-2"
                    style={{ fontSize: moderateScale(12) }}
                  >
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
                        className="px-[14px] py-[9px] rounded-md border"
                        style={{
                          borderColor: sel ? "#0F7635" : "#E0E0E0",
                          backgroundColor: sel ? "#0F7635" : "#fff",
                        }}
                      >
                        <Text
                          className="font-inter-medium"
                          style={{
                            color: sel ? "#FFFFFF" : "#6A6A6A",
                            fontSize: moderateScale(13),
                          }}
                        >
                          {p.name}{" "}
                          <Text className="font-inter">({p.relationship})</Text>
                        </Text>
                      </Touchable>
                    );
                  })
                )}
              </View>
            </ScrollView>

            <Text
              className="font-inter-bold text-[#222222] mb-2"
              style={{ fontSize: moderateScale(13) }}
            >
              Doctor will reach you at
            </Text>
            <View className="mb-4">
              <View className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] bg-white">
                {editingPhone ? (
                  <View className="flex-1 flex-row items-center">
                    <Text
                      className="font-inter-semibold text-[#222222] mr-1"
                      style={{ fontSize: moderateScale(14) }}
                    >
                      +91
                    </Text>
                    <View
                      style={{
                        width: 1,
                        height: 16,
                        backgroundColor: "#919EAB33",
                        marginRight: 2,
                      }}
                    />
                    <TextInput
                      className="flex-1 font-inter-semibold text-[#222222]"
                      style={s.contactInput}
                      value={phoneValue}
                      onChangeText={handlePhoneChange}
                      keyboardType="number-pad"
                      maxLength={10}
                      autoFocus
                      placeholderTextColor="#6A6A6A"
                      placeholder="Enter mobile number"
                    />
                  </View>
                ) : (
                  <Text
                    className="flex-1"
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
                  // hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {savingPhone ? (
                    <ActivityIndicator size="small" color="#0F7635" />
                  ) : (
                    <Text
                      className="font-inter-bold text-[#0F7635]"
                      style={{ fontSize: moderateScale(13) }}
                    >
                      {editingPhone ? "Done" : "Edit"}
                    </Text>
                  )}
                </Touchable>
              </View>
              {!!phoneError && (
                <Text
                  className="font-inter-medium text-[#EF4444] mt-1.5 px-1"
                  style={{ fontSize: moderateScale(12) }}
                >
                  {phoneError}
                </Text>
              )}
            </View>

            <View className="flex-row mb-4" style={{ gap: exactScale(12) }}>
              <View className="flex-1">
                <Text
                  className="font-inter-bold text-[#222222] mb-2"
                  style={{ fontSize: moderateScale(13) }}
                >
                  Age
                </Text>
                <View
                  className="border border-[#919EAB33] rounded-md px-[14px] bg-white"
                  style={s.vitalCard}
                >
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
                        <Text style={{ fontSize: moderateScale(14) }}>
                          <Text className="font-inter-bold text-[#222222]">
                            {value}
                          </Text>
                          <Text className="font-inter-medium text-[#919EAB]">
                            {" "}
                            {unitLabel}
                          </Text>
                        </Text>
                      );
                    })()
                  ) : (
                    <Text
                      className="font-inter-bold text-[#222222]"
                      style={{ fontSize: moderateScale(14) }}
                    >
                      —
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <Text
                  className="font-inter-bold text-[#222222] mb-2"
                  style={{ fontSize: moderateScale(13) }}
                >
                  Gender
                </Text>
                <View
                  className="flex-row items-center bg-[#F1FFF6] border border-[#0F763533] rounded-full px-6"
                  style={s.genderCard}
                >
                  {selectedPatient?.gender === "FEMALE" ? (
                    <icons.female width={18} height={18} color="#0F7635" />
                  ) : (
                    <icons.male width={18} height={18} color="#0F7635" />
                  )}
                  <Text
                    className="ml-1.5 font-inter-bold text-[#0F7635]"
                    style={{ fontSize: moderateScale(13) }}
                  >
                    {selectedPatient?.gender
                      ? selectedPatient.gender.charAt(0) +
                        selectedPatient.gender.slice(1).toLowerCase()
                      : "—"}
                  </Text>
                </View>
              </View>
            </View>

            <Text
              className="font-inter-bold text-[#222222] mb-2"
              style={{ fontSize: moderateScale(13) }}
            >
              Select Your Health Problem
            </Text>
            <Touchable
              onPress={() => setShowHealthSheet(true)}
              className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] bg-white mb-4"
              style={s.healthSelector}
              activeOpacity={0.85}
            >
              {selectedHealthProblem ? (
                <View className="flex-row items-center gap-[10px]">
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
                    <Text
                      style={{
                        fontSize: moderateScale(20),
                        lineHeight: moderateScale(24),
                      }}
                    >
                      {selectedHealthProblem.icon}
                    </Text>
                  )}
                  <Text
                    className="font-inter-medium text-[#1A1C1E]"
                    style={{ fontSize: moderateScale(14) }}
                  >
                    {selectedHealthProblem.label}
                  </Text>
                </View>
              ) : (
                <Text
                  className="font-inter text-[#6A6A6A]"
                  style={{ fontSize: moderateScale(14) }}
                >
                  Select
                </Text>
              )}
              <icons.down_arrow width={14} height={14} />
            </Touchable>

            {selectedHealthProblem?.id === "other" && (
              <View className="mb-4">
                <TextInput
                  value={customProblemText}
                  onChangeText={setCustomProblemText}
                  placeholder="Type the health problem..."
                  placeholderTextColor="#6A6A6A"
                  className="w-full font-inter text-[#1A1C1E] bg-white border border-[#919EAB33] rounded-md px-[14px]"
                  style={s.customProblemInput}
                />
              </View>
            )}

            <Text
              className="font-inter-bold text-[#222222] mb-2"
              style={{ fontSize: moderateScale(13) }}
            >
              Help us understand your symptoms
            </Text>
            <TextInput
              placeholder="Eg: Mild fever and body pain"
              placeholderTextColor="#6A6A6A"
              allowFontScaling={false}
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              className="border border-[#919EAB33] rounded-md px-[14px] bg-white font-inter text-[#1A1C1E]"
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
        // Override the default pickers so images are uploaded and appended to
        // this screen's list, instead of navigating back into Preview. The
        // delay lets the sheet dismiss before the OS picker opens.
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
