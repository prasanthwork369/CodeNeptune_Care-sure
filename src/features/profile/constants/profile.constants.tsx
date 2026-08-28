import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import React from "react";

export const RELATIONSHIPS = [
  "Self",
  "Father",
  "Mother",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Other",
] as const;

export const PATIENT_RELATIONSHIPS = [
  "Self",
  "Wife",
  "Husband",
  "Mother",
  "Father",
  "Other",
] as const;

export type RelationshipType = (typeof RELATIONSHIPS)[number];

export const GENDERS = [
  {
    label: "Male",
    value: "MALE",
  },
  {
    label: "Female",
    value: "FEMALE",
  },
  {
    label: "Prefer not to say",
    value: "OTHER",
  },
] as const;

export interface GenderOption {
  label: string;
  value: string;
  icon: React.ReactNode;
}

export const GENDER_OPTIONS_WITH_ICONS: GenderOption[] = [
  {
    label: "Male",
    value: "MALE",
    icon: <icons.male width={exactScale(16)} height={exactScale(16)} />,
  },
  {
    label: "Female",
    value: "FEMALE",
    icon: <icons.female width={exactScale(16)} height={exactScale(16)} />,
  },
  {
    label: "Prefer not to say",
    value: "OTHER",
    icon: <icons.back_hand width={exactScale(16)} height={exactScale(16)} />,
  },
];

export { INFO_ITEMS } from "./profile-info";
