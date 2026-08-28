import { useFamilyMembers } from "@/src/features/profile/hooks/useFamilyMembers";
import { useNav } from "@/src/hooks/useNav";
import { useSelectPatientImages } from "./useSelectPatientImages";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";
import type { FamilyMember, FamilyMemberInput } from "@/src/features/profile/types";
import type { HealthProblem } from "../types";
import { sanitize, stripIndianCode, validate } from "@/src/utils/validation";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
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

  const {
    members,
    loading,
    refreshing,
    listError,
    refetch,
    addMember,
    updateMember,
    deleteMember,
  } = useFamilyMembers();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  // No explicit pick yet — default to the draft's saved patient if it's
  // still in the list, otherwise the first member. Derived each render
  // instead of synced via an effect, since nothing outside this hook reads
  // selectedPatientId itself (only the resolved selectedPatient below).
  const selectedPatient = (() => {
    const explicit = members.find((m) => m.id === selectedPatientId);
    if (explicit) return explicit;
    if (members.length === 0) return null;
    const draftId = useCheckoutDraftStore.getState().patientMemberId;
    const fromDraft = draftId && members.find((m) => m.id === draftId);
    return fromDraft || members[0];
  })();

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
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneValue, setPhoneValue] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [savingPhone, setSavingPhone] = useState(false);
  const [editingPatient, setEditingPatient] = useState<FamilyMember | null>(
    null,
  );

  // A failed fetch is not "this account has no patients" — the screen shows
  // the load failure instead, so keep it out of the empty state.
  const showEmptyState = !loading && !listError && members.length === 0;

  // Keep the edit field to 10 digits only; country code shown separately as a fixed +91.
  const handlePhoneChange = (text: string) => {
    if (phoneValue.length === 10 && text.startsWith(phoneValue)) return;
    setPhoneValue(sanitize.phone(text));
    setPhoneError("");
  };

  // Skip the API call when "Done" is pressed but the number matches the saved one.
  const isPhoneUnchanged =
    phoneValue.trim() === stripIndianCode(selectedPatient?.phone).trim();

  const handleUpdatePhone = async () => {
    if (editingPhone) {
      if (isPhoneUnchanged) {
        setEditingPhone(false);
        setPhoneError("");
        return;
      }
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

  const handleAddPatient = async (patient: FamilyMemberInput) => {
    const created = await addMember(patient);
    if (created?.id) setSelectedPatientId(created.id);
    setIsAddPatientSheetVisible(false);
  };

  const handleEditPatient = async (
    id: string,
    patient: Partial<FamilyMemberInput>,
  ) => {
    await updateMember(id, patient);
    setIsAddPatientSheetVisible(false);
    setEditingPatient(null);
  };

  const handleDeletePatient = async (id: string) => {
    await deleteMember(id);
    if (selectedPatientId === id) setSelectedPatientId(null);
  };

  // Ref, not state, so a rapid double-tap on Continue (before React re-renders)
  // can't push the payment screen twice. Re-armed on focus so coming back to
  // this screen (e.g. Back from payment) doesn't leave Continue permanently
  // disabled.
  const isProceedingRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      isProceedingRef.current = false;
    }, []),
  );

  const handleProceed = () => {
    if (isProceedingRef.current) return;
    if (!selectedPatient) {
      setIsAddPatientSheetVisible(true);
      return;
    }
    isProceedingRef.current = true;
    const draft = useCheckoutDraftStore.getState();
    draft.setPatient(selectedPatient.id, selectedPatient.phone ?? "");
    draft.setSymptoms(symptoms);
    draft.setHealthProblem(selectedHealthProblem);
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
        problem:
          selectedHealthProblem?.id === "other"
            ? customProblemText
            : (selectedHealthProblem?.label ?? ""),
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
    refreshing,
    listError,
    refetch,
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
    isPhoneUnchanged,
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
