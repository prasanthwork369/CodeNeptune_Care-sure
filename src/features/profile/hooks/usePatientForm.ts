import { useEffect, useState } from "react";
import { validateDob } from "@/src/utils/patient";
import type { FamilyMember, FamilyMemberInput } from "../types";

export const RELATIONSHIPS = [
  "Self",
  "Wife",
  "Husband",
  "Mother",
  "Father",
  "Other",
];

export interface PatientFormErrors {
  name?: string;
  mobile?: string;
  dob?: string;
  relationship?: string;
  otherRelationship?: string;
  gender?: string;
}

/**
 * Field state, hydration, validation, and dirty-check for the add/edit
 * patient form. Shared by AddPatientLayout (full screen) and AddPatientSheet
 * (bottom sheet) so a validation/dirty-check fix only has to be made once.
 * Input handlers (onChangeText etc.) stay in each screen, since they carry
 * screen-specific wiring (e.g. the native digit-filter refs).
 */
export function usePatientForm(
  editPatient?: FamilyMember | null,
  // Sheet passes `isVisible` here so the form resets on every open, even for
  // repeated add-mode use where `editPatient` stays null across opens.
  resetSignal: unknown = true,
) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [otherRelationship, setOtherRelationship] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<PatientFormErrors>({});

  useEffect(() => {
    if (editPatient) {
      setName(editPatient.name ?? "");
      const rawPhone = editPatient.phone ?? "";
      setMobile(rawPhone.startsWith("+91") ? rawPhone.slice(3) : rawPhone);
      setDob(editPatient.dateOfBirth ?? "");
      if (editPatient.dateOfBirth)
        setDobDate(new Date(editPatient.dateOfBirth));
      const rel = editPatient.relationship ?? "";
      const isOther = !!rel && !RELATIONSHIPS.slice(0, -1).includes(rel);
      setRelationship(isOther ? "Other" : rel);
      setOtherRelationship(isOther ? rel : "");
      setGender(editPatient.gender ?? "");
    } else {
      setName("");
      setMobile("");
      setDob("");
      setDobDate(new Date(2000, 0, 1));
      setRelationship("");
      setOtherRelationship("");
      setGender("");
    }
    setErrors({});
    // Keyed on the patient's id (not the object) so a parent re-render with a
    // new-but-equal `editPatient` reference doesn't stomp in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPatient?.id, resetSignal]);

  const existingPhone = editPatient?.phone?.startsWith("+91")
    ? editPatient.phone.slice(3)
    : (editPatient?.phone ?? "");
  const existingRelationship = editPatient?.relationship ?? "";
  const currentRelationship =
    relationship === "Other" ? otherRelationship : relationship;

  const isDirty = editPatient
    ? name.trim() !== (editPatient.name ?? "").trim() ||
      mobile !== existingPhone ||
      dob !== (editPatient.dateOfBirth ?? "") ||
      currentRelationship.trim() !== existingRelationship.trim() ||
      gender !== (editPatient.gender ?? "")
    : !!(name || mobile || dob || relationship || otherRelationship || gender);

  const isFormValid =
    !!name.trim() &&
    mobile.length === 10 &&
    validateDob(dob).valid &&
    !!relationship &&
    (relationship !== "Other" || !!otherRelationship.trim()) &&
    !!gender;

  const validate = (): boolean => {
    const newErrors: PatientFormErrors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!mobile) newErrors.mobile = "Mobile number is required";
    else if (mobile.length !== 10)
      newErrors.mobile = "Enter a valid 10-digit number";
    const dobValidation = validateDob(dob);
    if (!dobValidation.valid) newErrors.dob = dobValidation.error;
    if (!relationship) newErrors.relationship = "Please select a relationship";
    if (relationship === "Other" && !otherRelationship.trim())
      newErrors.otherRelationship = "Please specify relationship";
    if (!gender) newErrors.gender = "Please select a gender";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = (): FamilyMemberInput => ({
    name: name.trim(),
    relationship:
      relationship === "Other" ? otherRelationship.trim() : relationship,
    dateOfBirth: dob,
    gender,
    phone: `+91${mobile}`,
  });

  return {
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
  };
}
