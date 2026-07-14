import { useFamilyMembers } from "@/src/hooks/queries/useFamilyMembers";
import { useNav } from "@/src/hooks/useNav";
import { useSelectPatientImages } from "@/src/hooks/useSelectPatientImages";
import { FamilyMember } from "@/src/types/familyMember";
import { HealthProblem } from "@/src/api/health-problem.api";
import { sanitize, stripIndianCode, validate } from "@/src/utils/validation";
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
    imageUrls = "",
    category = "",
  } = useLocalSearchParams<{
    toPay: string;
    prescriptionId: string;
    files: string;
    // Set when the prescription hasn't been created yet (deferred to payment):
    // the hosted image URLs + category are carried through to Place Order.
    imageUrls: string;
    category: string;
  }>();

  // Owns the (mutable) prescription image list: seeded from the params and
  // extended when the user adds images on this screen. `hostedUrls` is what
  // gets carried to payment for the deferred prescription creation.
  const images = useSelectPatientImages(files, imageUrls);
  const prescriptionItems = images.items;

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
  const [customProblemText, setCustomProblemText] = useState("");
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

  // Keep the edit field to 10 digits only; country code shown separately as a fixed +91.
  const handlePhoneChange = (text: string) => {
    setPhoneValue(sanitize.phone(text));
    setPhoneError("");
  };

  const handleUpdatePhone = async () => {
    if (editingPhone) {
      const result = validate.phone(phoneValue);
      if (!result.valid) {
        setPhoneError(result.message);
        return;
      }
      if (selectedPatient) {
        setSavingPhone(true);
        await updateMember(selectedPatient.id, {
          phone: `+91${phoneValue.trim()}`,
        });
        setSavingPhone(false);
      }
      setEditingPhone(false);
    } else {
      // Seed with just the local part so the +91 prefix isn't editable.
      setPhoneValue(stripIndianCode(selectedPatient?.phone));
      setPhoneError("");
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
        // Forwarded only when the prescription is still deferred; payment
        // creates it from these at Place Order. Uses the live list so images
        // added on this screen are included.
        imageUrls: JSON.stringify(images.hostedUrls),
        category,
        patientMemberId: selectedPatient?.id ?? "",
        problem: selectedHealthProblem?.id === "other" ? customProblemText : (selectedHealthProblem?.label ?? ""),
        symptoms: symptoms ?? "",
        patientPhone: selectedPatient?.phone ?? "",
      },
    });
  };

  return {
    router,
    insets,
    toPay,
    prescriptionId,
    prescriptionItems,
    isAddingImage: images.isAddingImage,
    removingImageIndex: images.removingIndex,
    addImageFromLibrary: images.addFromLibrary,
    addImageFromCamera: images.addFromCamera,
    addImageFromPdf: images.addFromPdf,
    removeImage: images.removeImage,
    members,
    loading,
    selectedPatientId,
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
  };
}
