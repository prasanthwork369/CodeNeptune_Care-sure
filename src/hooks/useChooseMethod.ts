import { useCart } from "@/src/hooks/queries/useCart";
import { useFamilyMembers } from "@/src/hooks/queries/useFamilyMembers";
import { useNav } from "@/src/hooks/useNav";
import { useUIStore } from "@/src/store/uiStore";
import { FamilyMember } from "@/src/types/familyMember";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useChooseMethod() {
  const router = useNav();
  const insets = useSafeAreaInsets();
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
    FamilyMember | null
  >(null);

  const handleProceed = () => {
    if (selectedOption === "upload") {
      if (!membersLoading && !selectedPatient) {
        setIsAddPatientSheetVisible(true);
        return;
      }
      useUIStore.getState().setIsRxFromCartFlow(true);
      setIsUploadSheetVisible(true);
    } else if (selectedOption === "call") {
      router.push({
        pathname: "/(prescription)/select-patient",
        params: { toPay },
      });
    }
  };

  const handleAddPatient = async (patient: any) => {
    try {
      const created = await addMember(patient);
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
      setSelectedPatientId(tempId);
    }
  };

  const handleEditPatient = async (id: string, patient: any) => {
    try {
      await updateMember(id, patient);
    } catch {
      setLocalMembers((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...patient } : m)),
      );
    }
    setIsAddPatientSheetVisible(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    try {
      await deleteMember(id);
      if (selectedPatientId === id) setSelectedPatientId(null);
    } catch {
      setLocalMembers((prev) => prev.filter((m) => m.id !== id));
      if (selectedPatientId === id) setSelectedPatientId(null);
    }
  };

  return {
    router,
    insets,
    toPay,
    hasRx,
    rxItems,
    members,
    membersLoading,
    selectedOption,
    setSelectedOption,
    selectedPatientId,
    setSelectedPatientId,
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
  };
}
