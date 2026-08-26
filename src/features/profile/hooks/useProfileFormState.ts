import { validate } from "@/src/utils/validation";
import { validateDob } from "@/src/utils/patient";
import type { CustomerProfile } from "../types";
import { GENDERS, normalizeDob } from "../utils/profileForm.utils";

export interface UseProfileFormStateParams {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: Date | null;
  profile?: CustomerProfile | null;
  updating?: boolean;
  isOffline?: boolean;
}

export interface UseProfileFormStateReturn {
  normalizedFirstName: string;
  normalizedLastName: string;
  normalizedEmail: string;
  normalizedGender: string;
  normalizedDob: string;

  isFirstNameChanged: boolean;
  isLastNameChanged: boolean;
  isEmailChanged: boolean;
  isGenderChanged: boolean;
  isDobChanged: boolean;

  hasChanges: boolean;
  isEmailValid: boolean;
  isDobValid: boolean;
  isFormValid: boolean;
  isSaveDisabled: boolean;
}

export function useProfileFormState({
  firstName,
  lastName,
  email,
  gender,
  dob,
  profile,
  updating = false,
  isOffline = false,
}: UseProfileFormStateParams): UseProfileFormStateReturn {
  const normalizedFirstName = firstName.trim();
  const normalizedInitialFirstName = (profile?.firstName ?? "").trim();
  const isFirstNameChanged = normalizedFirstName !== normalizedInitialFirstName;

  const normalizedLastName = lastName.trim();
  const normalizedInitialLastName = (profile?.lastName ?? "").trim();
  const isLastNameChanged = normalizedLastName !== normalizedInitialLastName;

  const normalizedEmail = email.trim();
  const normalizedInitialEmail = (profile?.email ?? "").trim();
  const isEmailChanged = normalizedEmail !== normalizedInitialEmail;

  const normalizedGender = gender;
  const initialGender = profile?.gender ? profile.gender.toUpperCase() : "";
  const normalizedInitialGender = GENDERS.some((x) => x.value === initialGender)
    ? initialGender
    : "";
  const isGenderChanged = normalizedGender !== normalizedInitialGender;

  const normalizedDob = normalizeDob(dob);
  const normalizedInitialDob = normalizeDob(profile?.dateOfBirth);
  const isDobChanged = normalizedDob !== normalizedInitialDob;

  const hasChanges =
    isFirstNameChanged ||
    isLastNameChanged ||
    isEmailChanged ||
    isGenderChanged ||
    isDobChanged;

  const isEmailValid = !normalizedEmail || validate.email(normalizedEmail).valid;
  const isDobValid = !dob || validateDob(dob.toISOString()).valid;
  const isFormValid = isEmailValid && isDobValid;

  const isSaveDisabled =
    !hasChanges ||
    !isFormValid ||
    updating ||
    isOffline;

  return {
    normalizedFirstName,
    normalizedLastName,
    normalizedEmail,
    normalizedGender,
    normalizedDob,

    isFirstNameChanged,
    isLastNameChanged,
    isEmailChanged,
    isGenderChanged,
    isDobChanged,

    hasChanges,
    isEmailValid,
    isDobValid,
    isFormValid,
    isSaveDisabled,
  };
}
