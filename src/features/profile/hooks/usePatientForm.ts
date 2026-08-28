import { useEffect, useState } from "react";
import { validateDob } from "@/src/utils/patient";
import type { FamilyMember, FamilyMemberInput } from "../types";
import { PATIENT_RELATIONSHIPS } from "../constants/profile.constants";

export { PATIENT_RELATIONSHIPS as RELATIONSHIPS };

export interface PatientFormErrors {
  name?: string;
  mobile?: string;
  dob?: string;
  relationship?: string;
  otherRelationship?: string;
  gender?: string;
}

/**
 * Field state, hydration, validation, and dirty-check for patient forms.
 */
export function usePatientForm(
  editPatient?: FamilyMember | null,
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
      const isOther = !!rel && !PATIENT_RELATIONSHIPS.slice(0, -1).includes(rel as any);
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
    // Keyed on the patient's id so re-renders don't stomp in-progress edits.
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
