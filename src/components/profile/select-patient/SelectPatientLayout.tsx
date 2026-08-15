import { HealthProblemSheet } from "@/src/features/prescription/components/HealthProblemSheet";
import { AddPatientSheet } from "@/src/components/profile/patients/AddPatientSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { UploadPrescriptionSheet } from "@/src/components/upload/UploadPrescriptionSheet";
import { HealthProblem } from "@/src/api/health-problem.api";
import { useFamilyMembers } from "@/src/hooks/queries/useFamilyMembers";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";
import { FamilyMember } from "@/src/types/familyMember";
import { getAge } from "@/src/utils/patient";
import { useNav } from "@/src/hooks/useNav";
import { useLocalSearchParams } from "expo-router";
import { Touchable } from "@/src/components/ui/Touchable";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";
import {
  PatientContactInfo,
  PatientEmptyState,
  PatientHealthProblem,
  PatientPrescriptionPreview,
  PatientSelectionChips,
  PatientSelectionFooter,
  PatientSymptomsInput,
  PatientVitalInfo,
  SelectPatientSkeleton,
} from "./sections";

export const SelectPatientLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const {
    toPay = "0",
    prescriptionId = "",
    files = "",
  } = useLocalSearchParams<{
    toPay: string;
    prescriptionId: string;
    files: string;
  }>();

  const prescriptionItems: { localUri: string; name: string; type: string }[] =
    (() => {
      try {
        return files ? JSON.parse(files) : [];
      } catch {
        return [];
      }
    })();

  const { members, loading, addMember, updateMember, deleteMember } =
    useFamilyMembers();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const selectedPatient =
    members.find((m) => m.id === selectedPatientId) ?? members[0] ?? null;

  useEffect(() => {
    if (!selectedPatientId && members.length > 0) {
      const draftId = useCheckoutDraftStore.getState().patientMemberId;
      const stillExists = draftId && members.some((m) => m.id === draftId);
      setSelectedPatientId(stillExists ? draftId : members[0].id);
    }
  }, [members, selectedPatientId]);

  const [symptoms, setSymptoms] = useState(
    () => useCheckoutDraftStore.getState().symptoms,
  );
  const [selectedHealthProblem, setSelectedHealthProblem] =
    useState<HealthProblem | null>(
      () => useCheckoutDraftStore.getState().healthProblem,
    );
  const [customProblemText, setCustomProblemText] = useState("");
  const [showHealthSheet, setShowHealthSheet] = useState(false);
  const [isAddPatientSheetVisible, setIsAddPatientSheetVisible] =
    useState(false);
  const [isUploadSheetVisible, setIsUploadSheetVisible] = useState(false);

  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingPatient, setEditingPatient] = useState<FamilyMember | null>(
    null,
  );

  const showEmptyState = !loading && members.length === 0;
  const showSkeleton = loading && members.length === 0;

  const handleProceed = () => {
    if (!selectedPatient) {
      setIsAddPatientSheetVisible(true);
      return;
    }
    const draft = useCheckoutDraftStore.getState();
    draft.setPatient(selectedPatient.id, selectedPatient.phone ?? "");
    draft.setSymptoms(symptoms);
    draft.setHealthProblem(selectedHealthProblem);
    router.push({
      pathname: "/(prescription)/payment",
      params: {
        toPay,
        prescriptionId,
        patientMemberId: selectedPatient?.id ?? "",
        problem: selectedHealthProblem?.label ?? "",
        symptoms: symptoms ?? "",
        patientPhone: selectedPatient?.phone ?? "",
      },
    });
  };

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

      {showSkeleton ? (
        <SelectPatientSkeleton />
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
            className="flex-1"
            contentContainerStyle={{
              padding: 16,
              paddingBottom: adjustedBottom + 90,
            }}
          >
            <PatientPrescriptionPreview
              items={prescriptionItems}
              onAddPress={() => setIsUploadSheetVisible(true)}
              onItemPress={(index) =>
                router.push({
                  pathname: "/(prescription)/prescription-viewer",
                  params: {
                    imageUrls: JSON.stringify([
                      prescriptionItems[index]?.localUri ?? "",
                    ]),
                    source: "view_only",
                  },
                })
              }
            />

            <PatientSelectionChips
              members={members}
              selectedId={selectedPatient?.id ?? null}
              onSelect={setSelectedPatientId}
              loading={loading}
            />

            <PatientContactInfo
              phone={selectedPatient?.phone ?? ""}
              isEditing={editingPhone}
              onEdit={() => setEditingPhone(true)}
              onSave={async (val) => {
                if (selectedPatient && val.trim()) {
                  setSavingPhone(true);
                  await updateMember(selectedPatient.id, {
                    phone: `+91${val.trim()}`,
                  });
                  setSavingPhone(false);
                }
                setEditingPhone(false);
              }}
              saving={savingPhone}
            />

            <PatientVitalInfo
              age={
                selectedPatient?.dateOfBirth
                  ? getAge(selectedPatient.dateOfBirth)
                  : ""
              }
              gender={selectedPatient?.gender ?? ""}
            />

            <PatientHealthProblem
              selected={selectedHealthProblem}
              onPress={() => setShowHealthSheet(true)}
              customText={customProblemText}
              setCustomText={setCustomProblemText}
            />

            <PatientSymptomsInput value={symptoms} onChangeText={setSymptoms} />
          </ScrollView>

          <PatientSelectionFooter
            toPay={toPay}
            patientName={selectedPatient?.name ?? null}
            safeAreaBottom={adjustedBottom}
            onProceed={handleProceed}
          />
        </>
      )}

      <AddPatientSheet
        isVisible={isAddPatientSheetVisible}
        onClose={() => {
          setIsAddPatientSheetVisible(false);
          setEditingPatient(null);
        }}
        editPatient={editingPatient}
        onAdd={async (patient) => {
          await addMember(patient);
          setIsAddPatientSheetVisible(false);
        }}
        onEdit={async (id, patient) => {
          await updateMember(id, patient);
          setIsAddPatientSheetVisible(false);
          setEditingPatient(null);
        }}
        onDelete={async (id) => {
          await deleteMember(id);
          if (selectedPatientId === id) setSelectedPatientId(null);
        }}
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
      />
    </View>
  );
};
