import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import type { FamilyMember, FamilyMemberInput } from "../types";
import { usePatientForm } from "../hooks/usePatientForm";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { exactScale } from "@/src/utils/exactScale";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { PatientFormFields } from "./PatientFormFields";
import { styles as s } from "./AddPatientSheet.styles";

interface AddPatientSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (patient: FamilyMemberInput) => Promise<void>;
  editPatient?: FamilyMember | null;
  onEdit?: (id: string, patient: FamilyMemberInput) => Promise<void>;
  onDelete?: (id: string) => void;
}

export function AddPatientSheet({
  isVisible,
  onClose,
  onAdd,
  editPatient,
  onEdit,
}: AddPatientSheetProps) {
  const adjustedBottom = useAdjustedBottomInset();
  const snapPoints = useMemo(() => ["80%"], []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);

  const scrollRef = useRef<React.ElementRef<typeof BottomSheetScrollView>>(null);
  const otherRelY = useRef(0);
  const otherFocusedRef = useRef(false);
  const [kbHeight, setKbHeight] = useState(0);

  const scrollOtherAboveKeyboard = () => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, otherRelY.current),
          animated: true,
        });
      }),
    );
  };

  useEffect(() => {
    if (!isVisible) return;
    const subs = [
      KeyboardEvents.addListener("keyboardDidShow", (e) => {
        setKbHeight(e.height);
        if (otherFocusedRef.current) scrollOtherAboveKeyboard();
      }),
      KeyboardEvents.addListener("keyboardDidHide", () => setKbHeight(0)),
    ];
    return () => subs.forEach((sub) => sub.remove());
  }, [isVisible]);

  const isEditMode = !!editPatient;
  const mobileRef = useRef<TextInput | null>(null);
  const setMobileRef = (ref: TextInput | null) => {
    mobileRef.current = ref;
    if (ref) applyDigitsOnlyFilter(ref, 10);
  };

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
  } = usePatientForm(editPatient, isVisible);

  const isSaveDisabled =
    isSubmitting || !isFormValid || (isEditMode && !isDirty);

  const handleSubmit = async () => {
    if (inFlight.current) return;
    if (!validate()) return;

    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (isEditMode && editPatient && onEdit) {
        await onEdit(editPatient.id, payload);
      } else {
        await onAdd(payload);
      }
      onClose();
    } catch {
      // Error handled by caller / toast
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <GorhomBottomSheet
      isVisible={isVisible}
      onClose={onClose}
      snapPoints={snapPoints}
      closeButtonOffset="80%"
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      backgroundStyle={s.sheetBackground}
    >
      <BottomSheetScrollView
        ref={scrollRef}
        style={s.sheetScroll}
        contentContainerStyle={{
          paddingTop: 0,
          paddingBottom: adjustedBottom + exactScale(10) + kbHeight,
        }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.headerRow}>
          <Text style={s.title}>
            {isEditMode ? "Edit Patient" : "Add Family Member"}
          </Text>
        </View>

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
          onOtherFocus={() => {
            otherFocusedRef.current = true;
            scrollOtherAboveKeyboard();
          }}
          onOtherLayout={(y) => {
            otherRelY.current = y;
          }}
        />

        <Touchable
          onPress={handleSubmit}
          disabled={isSaveDisabled}
          activeOpacity={0.85}
          style={[
            s.submitBtn,
            isSaveDisabled ? s.submitBtnDisabled : s.submitBtnEnabled,
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={s.submitBtnText}>
              {isEditMode ? "Save Changes" : "Add Patient"}
            </Text>
          )}
        </Touchable>
      </BottomSheetScrollView>
    </GorhomBottomSheet>
  );
}
