import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { UnsavedChangesGuard } from "@/src/components/ui/UnsavedChangesGuard";
import { useFamilyMembers } from "@/src/features/profile/hooks/useFamilyMembers";
import { usePatientForm } from "@/src/features/profile/hooks/usePatientForm";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { PatientFormFields } from "../components/PatientFormFields";
import { styles as s } from "./AddPatientLayout.styles";

export const AddPatientLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { members, addMember, updateMember } = useFamilyMembers();
  const isOffline = useIsOffline();
  const inFlight = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveCompleted, setSaveCompleted] = useState(false);

  const editPatient = id ? (members.find((m) => m.id === id) ?? null) : null;
  const isEditMode = !!editPatient;

  const {
    name,
    setName,
    mobile,
    setMobile,
    dob,
    setDob,
    dobDate,
    setDobDate,
    showDatePicker,
    setShowDatePicker,
    relationship,
    setRelationship,
    otherRelationship,
    setOtherRelationship,
    gender,
    setGender,
    errors,
    setErrors,
    isDirty,
    isFormValid,
    validate,
    buildPayload,
  } = usePatientForm(editPatient, true);

  const isSaveDisabled =
    isSubmitting || !isFormValid || (isEditMode && !isDirty) || isOffline;

  const setMobileRef = (ref: TextInput | null) => {
    if (ref) applyDigitsOnlyFilter(ref, 10);
  };

  const handleSubmit = async () => {
    if (inFlight.current) return;
    if (!validate()) return;

    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (isEditMode && editPatient) {
        await updateMember(editPatient.id, payload);
      } else {
        await addMember(payload);
      }
      setSaveCompleted(true);
      router.back();
    } catch {
      // Error surfaced by useFamilyMembers mutation toast
    } finally {
      setIsSubmitting(false);
      inFlight.current = false;
    }
  };

  return (
    <View style={s.root}>
      <UnsavedChangesGuard hasUnsavedChanges={!saveCompleted && isDirty} />
      <ScreenHeader
        title={isEditMode ? "Edit Patient" : "Add Patient Details"}
        backgroundColor="#FFFFFF"
        showBorder
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.avoidingView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            s.scrollContent,
            { paddingBottom: adjustedBottom + exactScale(32) },
          ]}
        >
          <PatientFormFields
            name={name}
            setName={setName}
            mobile={mobile}
            setMobile={setMobile}
            dob={dob}
            setDob={setDob}
            dobDate={dobDate}
            setDobDate={setDobDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
            relationship={relationship}
            setRelationship={setRelationship}
            otherRelationship={otherRelationship}
            setOtherRelationship={setOtherRelationship}
            gender={gender}
            setGender={setGender}
            errors={errors}
            setErrors={setErrors}
            setMobileRef={setMobileRef}
          />
        </ScrollView>

        <View style={[s.bottomBar, { paddingBottom: adjustedBottom + exactScale(12) }]}>
          <Touchable
            testID="save-patient-btn"
            onPress={handleSubmit}
            disabled={isSaveDisabled}
            style={[
              s.submitBtn,
              isSaveDisabled ? s.submitBtnDisabled : s.submitBtnEnabled,
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.submitBtnText}>
                {isEditMode ? "Update Details" : "Add Patient"}
              </Text>
            )}
          </Touchable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
