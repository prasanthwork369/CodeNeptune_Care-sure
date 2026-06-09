import { useFamilyMembers } from "@/src/hooks/queries/useFamilyMembers";
import { useNav } from "@/src/hooks/useNav";
import { FamilyMember } from "@/src/types/familyMember";
import { HealthProblem } from "@/src/constants/data";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function useSelectPatient() {
  const router = useNav();
  const insets = useSafeAreaInsets();
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
      setSelectedPatientId(members[0].id);
    }
  }, [members, selectedPatientId]);

  const [symptoms, setSymptoms] = useState("");
  const [selectedHealthProblem, setSelectedHealthProblem] =
    useState<HealthProblem | null>(null);
  const [showHealthSheet, setShowHealthSheet] = useState(false);
  const [isAddPatientSheetVisible, setIsAddPatientSheetVisible] =
    useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingPatient, setEditingPatient] = useState<FamilyMember | null>(
    null,
  );

  const showEmptyState = !loading && members.length === 0;

  const handleUpdatePhone = async () => {
    if (editingPhone) {
      if (selectedPatient && phoneValue.trim()) {
        setSavingPhone(true);
        await updateMember(selectedPatient.id, {
          phone: phoneValue.trim(),
        });
        setSavingPhone(false);
      }
      setEditingPhone(false);
    } else {
      setPhoneValue(selectedPatient?.phone ?? "");
      setEditingPhone(true);
    }
  };

  const handleAddPatient = async (patient: any) => {
    const created = await addMember(patient);
    if (created?.id) setSelectedPatientId(created.id);
    setIsAddPatientSheetVisible(false);
  };

  const handleEditPatient = async (id: string, patient: any) => {
    await updateMember(id, patient);
    setIsAddPatientSheetVisible(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    await deleteMember(id);
    if (selectedPatientId === id) setSelectedPatientId(null);
  };

  const handleProceed = () => {
    if (!selectedPatient) {
      setIsAddPatientSheetVisible(true);
      return;
    }
    router.push({
      pathname: "/(prescription)/payment",
      params: {
        toPay,
        prescriptionId,
        patientMemberId: selectedPatient?.id ?? "",
      },
    });
  };

  return {
    router,
    insets,
    toPay,
    prescriptionId,
    prescriptionItems,
    members,
    loading,
    selectedPatientId,
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
  };
}
