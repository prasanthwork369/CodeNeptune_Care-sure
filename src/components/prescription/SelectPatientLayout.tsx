import { HealthProblemSheet } from "@/src/components/prescription/HealthProblemSheet";
import { AddPatientSheet } from "@/src/components/profile/patients/AddPatientSheet";
import { PatientChipSkeleton } from "@/src/components/profile/patients/PatientSkeleton";
import { PatientEmptyState } from "@/src/components/profile/select-patient/sections";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { getAge } from "@/src/utils/patient";
import { Touchable } from "@/src/components/ui/Touchable";
import { useSelectPatient } from "@/src/hooks/useSelectPatient";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

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
              <Text className="text-[13px] font-inter-bold text-[#0F7635]">
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
              padding: 16,
              paddingBottom: insets.bottom + 90,
            }}
          >
            {prescriptionItems.length > 0 && (
              <View className="mb-4">
                <Text className="text-[14px] font-inter-semibold text-[#1A1C1E] mb-[10px]">
                  Prescription
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row" style={{ gap: 10 }}>
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
                            <Text className="text-[8px] font-inter-bold text-[#1A1C1E] mt-0.5">
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
              <View className="flex-row pr-1" style={{ gap: 8 }}>
                {loading ? (
                  <PatientChipSkeleton />
                ) : members.length === 0 ? (
                  <Text className="text-[12px] font-inter text-[#919EAB] py-2">
                    No patients yet. Tap "ADD PATIENT"
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
                          className="text-[13px] font-inter-medium"
                          style={{ color: sel ? "#FFFFFF" : "#6A6A6A" }}
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

            <Text className="text-[13px] font-inter-semibold text-[#222222] mb-2">
              Doctor will reach you at
            </Text>
            <View
              className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] bg-white mb-4"
              style={{ minHeight: 52 }}
            >
              {editingPhone ? (
                <TextInput
                  className="flex-1 text-[14px] font-inter-semibold text-[#1A1C1E] py-3"
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
                  className="flex-1 text-[14px] py-3"
                  style={{
                    fontFamily:
                      phoneValue || selectedPatient?.phone
                        ? "Inter_600SemiBold"
                        : "Inter_400Regular",
                    color:
                      phoneValue || selectedPatient?.phone
                        ? "#1A1C1E"
                        : "#919EAB",
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {savingPhone ? (
                  <ActivityIndicator size="small" color="#0F7635" />
                ) : (
                  <Text className="text-[13px] font-inter-bold text-[#0F7635]">
                    {editingPhone ? "Done" : "Edit"}
                  </Text>
                )}
              </Touchable>
            </View>

            <View className="flex-row mb-4" style={{ gap: 12 }}>
              <View className="flex-1">
                <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">
                  Age
                </Text>
                <View className="border border-[#919EAB33] rounded-md px-[14px] py-[14px] bg-white">
                  <Text className="text-[14px] font-inter-semibold text-[#1A1C1E]">
                    {selectedPatient?.dateOfBirth
                      ? getAge(selectedPatient.dateOfBirth)
                      : "—"}
                  </Text>
                </View>
              </View>
              <View>
                <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">
                  Gender
                </Text>
                <View className="flex-row items-center bg-[#F1FFF6] border border-[#0F763533] rounded-md px-4 py-[12px]">
                  {selectedPatient?.gender === "FEMALE" ? (
                    <icons.female width={18} height={18} color="#0F7635" />
                  ) : (
                    <icons.male width={18} height={18} color="#0F7635" />
                  )}
                  <Text className="ml-1.5 text-[13px] font-inter-semibold text-[#0F7635]">
                    {selectedPatient?.gender
                      ? selectedPatient.gender.charAt(0) +
                        selectedPatient.gender.slice(1).toLowerCase()
                      : "—"}
                  </Text>
                </View>
              </View>
            </View>

            <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">
              Select Your Health Problem
            </Text>
            <Touchable
              onPress={() => setShowHealthSheet(true)}
              className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] py-[10px] bg-white mb-4"
              activeOpacity={0.85}
            >
              {selectedHealthProblem ? (
                <View className="flex-row items-center gap-[10px]">
                  <Text className="text-[20px] leading-[24px]">
                    {selectedHealthProblem.emoji}
                  </Text>
                  <Text className="text-[14px] font-inter-medium text-[#1A1C1E]">
                    {selectedHealthProblem.label}
                  </Text>
                </View>
              ) : (
                <Text className="text-[14px] font-inter text-[#919EAB]">
                  Select
                </Text>
              )}
              <icons.down_arrow width={16} height={16} />
            </Touchable>

            <Text className="text-[13px] font-inter-semibold text-[#1A1C1E] mb-2">
              Help us understand your symptoms
            </Text>
            <TextInput
              placeholder="Eg: Mild fever and body pain"
              placeholderTextColor="#919EAB"
              multiline
              value={symptoms}
              onChangeText={setSymptoms}
              className="border border-[#919EAB33] rounded-md px-[14px] pt-3 pb-3 bg-white text-[14px] font-inter text-[#1A1C1E]"
              style={{ minHeight: 100, textAlignVertical: "top" }}
            />
          </ScrollView>

          <View
            className="bg-white px-4 pt-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: "#919EAB22",
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View className="flex-row items-center pb-4">
              <Image
                source={HOME_IMAGES.verifiedUser}
                style={{ width: 22, height: 22, marginRight: 10 }}
                resizeMode="contain"
              />
              <View className="flex-1">
                <Text className="text-[14px] font-inter-bold text-[#1A1C1E]">
                  Take care, {selectedPatient?.name ?? "there"}
                </Text>
                <Text className="text-[12px] font-inter-medium text-[#6A6A6A] mt-0.5">
                  Your medicines will be there when you need them
                </Text>
              </View>
            </View>
            <View style={{ height: 1, backgroundColor: "#919EAB22" }} />
            <View className="flex-row items-center pt-4">
              <View className="mr-4">
                <Text className="text-[11px] font-inter-medium text-[#6A6A6A]">
                  To Pay
                </Text>
                <Text className="text-[18px] font-inter-extrabold text-[#1A1C1E]">
                  ₹{Number(toPay).toFixed(2)}
                </Text>
              </View>
              <Touchable
                activeOpacity={0.85}
                onPress={handleProceed}
                className="flex-1 items-center ml-5 justify-center py-4 rounded-xl bg-[#0F7635]"
              >
                <Text className="text-[15px] font-inter-semibold text-white">
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
