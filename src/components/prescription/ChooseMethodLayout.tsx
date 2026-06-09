import { AddPatientSheet } from "@/src/components/profile/patients/AddPatientSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { UploadPrescriptionSheet } from "@/src/components/upload/UploadPrescriptionSheet";
import { HOME_IMAGES } from "@/src/constants/images";
import { useChooseMethod } from "@/src/hooks/useChooseMethod";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

const RadioButton = ({ selected }: { selected: boolean }) => (
  <View
    style={{
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: selected ? "#0F7635" : "#C4C4C4",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
    }}
  >
    {selected && (
      <View
        style={{
          width: 11,
          height: 11,
          borderRadius: 5.5,
          backgroundColor: "#0F7635",
        }}
      />
    )}
  </View>
);

export const ChooseMethodLayout: React.FC = () => {
  const {
    insets,
    toPay,
    hasRx,
    rxItems,
    selectedOption,
    setSelectedOption,
    selectedPatient,
    isUploadSheetVisible,
    setIsUploadSheetVisible,
    isAddPatientSheetVisible,
    setIsAddPatientSheetVisible,
    editingPatient,
    setEditingPatient,
    handleProceed,
    handleAddPatient,
    handleEditPatient,
    handleDeletePatient,
  } = useChooseMethod();

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Upload Prescription" backgroundColor="#FFFFFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-[#F5F6FB]"
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {hasRx && (
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#919EAB22",
              borderWidth: 1,
            }}
            className="p-3 rounded-xl"
          >
            <View className="flex-row items-center mb-2">
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#FF8D28",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 12,
                    fontFamily: "Inter_700Bold",
                    lineHeight: 14,
                  }}
                >
                  i
                </Text>
              </View>
              <Text
                style={{ color: "#FF8D28" }}
                className="text-[13px] font-inter-bold"
              >
                {rxItems.length} Item{rxItems.length > 1 ? "s" : ""} Requires
                Prescription
              </Text>
            </View>
            {rxItems.map((item) => (
              <View key={item.id} className="flex-row items-start ml-1 mb-0.5">
                <Text
                  style={{ color: "#6A6A6A", marginRight: 6, lineHeight: 18 }}
                >
                  {"•"}
                </Text>
                <Text
                  style={{ color: "#6A6A6A" }}
                  className="text-[12px] font-inter-medium leading-[18px] flex-1"
                >
                  {item.medicineName}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Touchable
          activeOpacity={0.92}
          onPress={() => setSelectedOption("upload")}
        >
          <LinearGradient
            colors={["#FCF5FF", "#E8F3FF"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "#919EAB33",
              padding: 14,
            }}
          >
            <View
              style={{
                backgroundColor: "#D0ECFD",
                alignSelf: "flex-start",
                marginBottom: 12,
              }}
              className="rounded px-2 py-0.5"
            >
              <Text
                style={{ color: "#1A1C1E", fontSize: 10 }}
                className="font-inter-semibold uppercase tracking-wider"
              >
                Order Now
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-start flex-1 pr-4">
                <Image
                  source={HOME_IMAGES.prescription}
                  style={{ width: 30, height: 30 }}
                  resizeMode="contain"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-[14px] font-inter-bold text-[#1A1C1E]">
                    Upload Prescription
                  </Text>
                  <Text className="text-[12px] font-inter-medium text-[#6A6A6A] mt-0.5 leading-[17px]">
                    The Following Item Requires Verification Before Purchase
                  </Text>
                </View>
              </View>
              <RadioButton selected={selectedOption === "upload"} />
            </View>
          </LinearGradient>
        </Touchable>

        <View
          style={{
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#919EAB33",
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <Touchable
            activeOpacity={0.92}
            onPress={() => setSelectedOption("call")}
          >
            <LinearGradient
              colors={["#FCF5FF", "#E8F3FF"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ padding: 14 }}
            >
              <View
                style={{
                  backgroundColor: "#D0ECFD",
                  alignSelf: "flex-start",
                  marginBottom: 12,
                }}
                className="rounded px-2 py-0.5"
              >
                <Text
                  style={{ color: "#1A1C1E", fontSize: 10 }}
                  className="font-inter-semibold uppercase tracking-wider"
                >
                  Call Us
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-start flex-1 pr-4">
                  <View className="w-11 h-11 items-center justify-center">
                    <Image
                      source={HOME_IMAGES.stethoscope}
                      style={{ width: 36, height: 36 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className="text-[14px] font-inter-bold text-[#1A1C1E]">
                      Don't have a prescription? Call us
                    </Text>
                    <Text className="text-[12px] font-inter-medium text-[#6A6A6A] mt-0.5 leading-[17px]">
                      Our Pharmacists Will Assist You And Help You Complete Your
                      Order
                    </Text>
                  </View>
                </View>
                <RadioButton selected={selectedOption === "call"} />
              </View>
            </LinearGradient>
          </Touchable>
        </View>
      </ScrollView>

      <View
        className="bg-white border-t border-[#919EAB33] px-4 flex-row items-center justify-between"
        style={{ paddingTop: 12, paddingBottom: insets.bottom + 12 }}
      >
        <View>
          <Text className="text-[11px] font-inter-medium text-brand-text">
            To Pay
          </Text>
          <Text className="text-[18px] font-inter-extrabold text-brand-text">
            ₹{Number(toPay).toFixed(2)}
          </Text>
        </View>
        <Touchable
          activeOpacity={0.85}
          onPress={handleProceed}
          disabled={!selectedOption}
          className="flex-1 ml-10 rounded-lg py-4 items-center"
          style={{ backgroundColor: selectedOption ? "#0F7635" : "#919EAB66" }}
        >
          <Text className="text-[15px] font-inter-semibold text-white">
            Proceed
          </Text>
        </Touchable>
      </View>

      <UploadPrescriptionSheet
        isVisible={isUploadSheetVisible}
        onClose={() => setIsUploadSheetVisible(false)}
        toPay={toPay}
        patientMemberId={selectedPatient?.id}
      />
      <AddPatientSheet
        isVisible={isAddPatientSheetVisible}
        onClose={() => {
          setIsAddPatientSheetVisible(false);
          setEditingPatient(null);
        }}
        editPatient={editingPatient}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
        onAdd={handleAddPatient}
      />
    </View>
  );
};
