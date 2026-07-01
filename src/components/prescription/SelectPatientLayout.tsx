import { HealthProblemSheet } from "@/src/components/prescription/HealthProblemSheet";
import { AddPatientSheet } from "@/src/components/profile/patients/AddPatientSheet";
import { PatientChipSkeleton } from "@/src/components/profile/patients/PatientSkeleton";
import { PatientEmptyState } from "@/src/components/profile/select-patient/sections";
import { RemoteIcon } from "@/src/components/ui/RemoteIcon";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useSelectPatient } from "@/src/hooks/useSelectPatient";
import { getAge } from "@/src/utils/patient";
import { resolveAssetUrl } from "@/src/utils/urls";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

const isPdf = (uri: string, type?: string) =>
  type === "application/pdf" || uri.toLowerCase().endsWith(".pdf");

export const SelectPatientLayout: React.FC = () => {
  const {
    insets,
    toPay,
    prescriptionId,
    prescriptionItems,
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
    setPhoneValue,
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
              <Text className="font-inter-bold text-[#0F7635]" style={{ fontSize: moderateScale(13, 0.1) }}>
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
            className="flex-1"
            contentContainerStyle={{
              padding: exactScale(16),
              paddingBottom: adjustedBottom + exactScale(90),
            }}
          >
            {prescriptionItems.length > 0 && (
              <View className="mb-4">
                <Text className="font-inter-semibold text-[#1A1C1E] mb-[10px]" style={{ fontSize: moderateScale(14, 0.1) }}>
                  Prescription
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row" style={{ gap: exactScale(10) }}>
                    <Touchable className="w-[72px] h-[72px] rounded-[10px] border border-[#919EAB33] bg-[#FCFDFF] items-center justify-center">
                      <icons.add_photo width={24} height={24} />
                    </Touchable>
                    {prescriptionItems.map((item, index) => (
                      <View
                        key={index}
                        className="w-[72px] h-[72px] rounded-[10px] overflow-hidden border border-[#919EAB33] bg-[#F9FAFB]"
                      >
                        {isPdf(item.localUri, item.type) ? (
                          <View className="flex-1 items-center justify-center">
                            <icons.upload_file width={22} height={22} />
                            <Text className="font-inter-bold text-[#1A1C1E] mt-0.5" style={{ fontSize: moderateScale(8, 0.1) }}>
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
                        <View className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white border border-[#919EAB33] items-center justify-center">
                          <icons.close_small
                            width={8}
                            height={8}
                            fill="#222222"
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </ScrollView>
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
                  <Text className="font-inter text-[#919EAB] py-2" style={{ fontSize: moderateScale(12, 0.1) }}>
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
                          style={{ color: sel ? "#FFFFFF" : "#6A6A6A", fontSize: moderateScale(13, 0.1) }}
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

            <Text className="font-inter-bold text-[#222222] mb-2" style={{ fontSize: moderateScale(13, 0.1) }}>
              Doctor will reach you at
            </Text>
            <View
              className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] bg-white mb-4"
              style={{ minHeight: 52 }}
            >
              {editingPhone ? (
                <TextInput
                  className="flex-1 font-inter-semibold text-[#222222] py-3"
                  style={{ fontSize: moderateScale(14, 0.1) }}
                  value={phoneValue}
                  onChangeText={setPhoneValue}
                  keyboardType="phone-pad"
                  maxLength={15}
                  autoFocus
                  placeholderTextColor="#919EAB"
                  placeholder="Enter phone number"
                />
              ) : (
                <Text
                  className="flex-1 py-3"
                  style={{
                    fontFamily:
                      phoneValue || selectedPatient?.phone
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                    color:
                      phoneValue || selectedPatient?.phone
                        ? "#222222"
                        : "#919EAB",
                    fontSize: moderateScale(14, 0.1),
                  }}
                >
                  {phoneValue ||
                    selectedPatient?.phone ||
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
                  <Text className="font-inter-bold text-[#0F7635]" style={{ fontSize: moderateScale(13, 0.1) }}>
                    {editingPhone ? "Done" : "Edit"}
                  </Text>
                )}
              </Touchable>
            </View>

            <View className="flex-row mb-4" style={{ gap: exactScale(12) }}>
              <View className="flex-1">
                <Text className="font-inter-bold text-[#222222] mb-2" style={{ fontSize: moderateScale(13, 0.1) }}>
                  Age
                </Text>
                <View className="border border-[#919EAB33] rounded-md px-[14px] py-[14px] bg-white">
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
                        <Text style={{ fontSize: moderateScale(14, 0.1) }}>
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
                    <Text className="font-inter-bold text-[#222222]" style={{ fontSize: moderateScale(14, 0.1) }}>
                      —
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <Text className="font-inter-bold text-[#222222] mb-2" style={{ fontSize: moderateScale(13, 0.1) }}>
                  Gender
                </Text>
                <View className="flex-row items-center bg-[#F1FFF6] border border-[#0F763533] rounded-full px-6 py-[14px]">
                  {selectedPatient?.gender === "FEMALE" ? (
                    <icons.female width={18} height={18} color="#0F7635" />
                  ) : (
                    <icons.male width={18} height={18} color="#0F7635" />
                  )}
                  <Text className="ml-1.5 font-inter-bold text-[#0F7635]" style={{ fontSize: moderateScale(13, 0.1) }}>
                    {selectedPatient?.gender
                      ? selectedPatient.gender.charAt(0) +
                        selectedPatient.gender.slice(1).toLowerCase()
                      : "—"}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="font-inter-bold text-[#222222] mb-2" style={{ fontSize: moderateScale(13, 0.1) }}>
              Select Your Health Problem
            </Text>
            <Touchable
              onPress={() => setShowHealthSheet(true)}
              className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] py-[10px] bg-white mb-4"
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
                    <Text style={{ fontSize: moderateScale(20, 0.1), lineHeight: moderateScale(24, 0.1) }}>
                      {selectedHealthProblem.icon}
                    </Text>
                  )}
                  <Text className="font-inter-medium text-[#1A1C1E]" style={{ fontSize: moderateScale(14, 0.1) }}>
                    {selectedHealthProblem.label}
                  </Text>
                </View>
              ) : (
                <Text className="font-inter text-[#6A6A6A]" style={{ fontSize: moderateScale(14, 0.1) }}>
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
                  placeholderTextColor="#919EAB"
                  className="w-full font-inter text-[#1A1C1E] bg-white border border-[#919EAB33] rounded-md px-[14px] py-3"
                  style={{ fontSize: moderateScale(14, 0.1) }}
                />
              </View>
            )}

            <Text className="font-inter-bold text-[#222222] mb-2" style={{ fontSize: moderateScale(13, 0.1) }}>
              Help us understand your symptoms
            </Text>
            <TextInput
              placeholder="Eg: Mild fever and body pain"
              placeholderTextColor="#919EAB"
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              className="border border-[#919EAB33] rounded-md px-[14px] pt-3 pb-3 bg-white font-inter text-[#1A1C1E]"
              style={{ minHeight: 100, textAlignVertical: "top", fontSize: moderateScale(14, 0.1) }}
            />
          </ScrollView>

          <View
            className="bg-white px-4 pt-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: "#919EAB22",
              paddingBottom: adjustedBottom + 16,
            }}
          >
            <View className="flex-row items-center pb-4">
              <Image
                source={HOME_IMAGES.verifiedUser}
                style={{ width: 22, height: 22, marginRight: exactScale(10) }}
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="font-inter-bold text-[#1A1C1E]" style={{ fontSize: moderateScale(14, 0.1) }}>
                  Take care, {selectedPatient?.name ?? "there"}
                </Text>
                <Text className="font-inter-medium text-[#6A6A6A] mt-0.5" style={{ fontSize: moderateScale(12, 0.1) }}>
                  Your medicines will be there when you need them
                </Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: "#919EAB22" }} />
            <View className="flex-row items-center pt-4">
              <View className="mr-4">
                <Text className="font-inter-medium text-[#222222]" style={{ fontSize: moderateScale(11, 0.1) }}>
                  To Pay
                </Text>
                <Text className="font-inter-extrabold text-[#222222]" style={{ fontSize: moderateScale(18, 0.1) }}>
                  ₹{Number(toPay).toFixed(2)}
                </Text>
              </View>
              <Touchable
                activeOpacity={0.85}
                onPress={handleProceed}
                className="flex-1 items-center ml-5 justify-center py-4 rounded-lg bg-[#0F7635]"
              >
                <Text className="font-inter-semibold text-white" style={{ fontSize: moderateScale(15, 0.1) }}>
                  Proceed
                </Text>
              </Touchable>
            </View>
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
    </View>
  );
};
