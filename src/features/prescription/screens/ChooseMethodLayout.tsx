import { AddPatientSheet } from "@/src/features/profile/components/AddPatientSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { UploadPrescriptionSheet } from "../components/UploadPrescriptionSheet";
import { useCart } from "@/src/hooks/queries/useCart";
import { useFamilyMembers } from "@/src/hooks/queries/useFamilyMembers";
import { useNav } from "@/src/hooks/useNav";
import { useUIStore } from "@/src/store/uiStore";
import { FamilyMember } from "@/src/types/familyMember";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import {
  CallMethodCard,
  ChooseMethodFooter,
  RequiresPrescriptionWarning,
  UploadMethodCard,
} from "../sections/choose-method";

export const ChooseMethodLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { toPay = "1100", skipRx } = useLocalSearchParams<{
    toPay: string;
    skipRx?: string;
  }>();
  const hasRx = skipRx !== "true";
  const { items } = useCart();
  const rxItems = items.filter((i) => i.requiresPrescription);
  const {
    members: apiMembers,
    loading: membersLoading,
    addMember,
    updateMember,
    deleteMember,
  } = useFamilyMembers();
  const [localMembers, setLocalMembers] = useState<FamilyMember[]>([]);
  const members = apiMembers.length > 0 ? apiMembers : localMembers;
  const [selectedOption, setSelectedOption] = useState<
    "upload" | "call" | null
  >(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const selectedPatient =
    members.find((m) => m.id === selectedPatientId) ?? members[0] ?? null;
  const [isUploadSheetVisible, setIsUploadSheetVisible] = useState(false);
  const [isAddPatientSheetVisible, setIsAddPatientSheetVisible] =
    useState(false);
  const [editingPatient, setEditingPatient] = useState<
    (typeof members)[0] | null
  >(null);

  const handleProceed = () => {
    if (selectedOption === "upload") {
      useUIStore.getState().setIsRxFromCartFlow(true);
      setIsUploadSheetVisible(true);
    } else if (selectedOption === "call") {
      if (!selectedPatient) {
        setIsAddPatientSheetVisible(true);
        return;
      }
      router.push({
        pathname: "/(prescription)/select-patient",
        params: { toPay },
      });
    }
  };

  const getButtonLabel = () => {
    if (membersLoading && selectedOption === "call") return "Loading…";
    return "Proceed";
  };

  return (
    <View className="flex-1 bg-white">
      <ScreenHeader title="Upload Prescription" backgroundColor="#FFFFFF" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        className="flex-1 bg-[#F5F6FB]"
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {hasRx && rxItems.length > 0 && (
          <RequiresPrescriptionWarning
            itemCount={rxItems.length}
            items={rxItems}
          />
        )}

        <UploadMethodCard
          isSelected={selectedOption === "upload"}
          onSelect={() => setSelectedOption("upload")}
        />

        <CallMethodCard
          isSelected={selectedOption === "call"}
          onSelect={() => setSelectedOption("call")}
        />
      </ScrollView>

      <ChooseMethodFooter
        toPay={toPay}
        safeAreaBottom={adjustedBottom}
        canProceed={
          !!selectedOption && (selectedOption === "upload" || !membersLoading)
        }
        onProceed={handleProceed}
        buttonLabel={getButtonLabel()}
      />

      <UploadPrescriptionSheet
        isVisible={isUploadSheetVisible}
        onClose={() => setIsUploadSheetVisible(false)}
        onReopen={() => setIsUploadSheetVisible(true)}
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
        onEdit={async (id, patient) => {
          try {
            await updateMember(id, patient);
          } catch {
            setLocalMembers((prev) =>
              prev.map((m) => (m.id === id ? { ...m, ...patient } : m)),
            );
          }
          setIsAddPatientSheetVisible(false);
          setEditingPatient(null);
        }}
        onDelete={async (id) => {
          try {
            await deleteMember(id);
            if (selectedPatientId === id) setSelectedPatientId(null);
          } catch {
            setLocalMembers((prev) => prev.filter((m) => m.id !== id));
            if (selectedPatientId === id) setSelectedPatientId(null);
          }
        }}
        onAdd={async (patient) => {
          let patientId: string | null = null;
          try {
            const created = await addMember(patient);
            patientId = created.id;
            setSelectedPatientId(created.id);
          } catch {
            const tempId = `local-${Date.now()}`;
            setLocalMembers((prev) => [
              ...prev,
              {
                id: tempId,
                name: patient.name,
                relationship: patient.relationship,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phone: patient.phone,
                isDefault: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ]);
            patientId = tempId;
            setSelectedPatientId(tempId);
          }
          setIsAddPatientSheetVisible(false);
          if (patientId) {
            if (selectedOption === "upload") setIsUploadSheetVisible(true);
            else if (selectedOption === "call")
              router.push({
                pathname: "/(prescription)/select-patient",
                params: { toPay },
              });
          }
        }}
      />
    </View>
  );
};
