export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMemberInput {
  name: string;
  relationship: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  isDefault?: boolean;
}

export const RELATIONSHIPS = [
  'Self',
  'Father',
  'Mother',
  'Husband',
  'Wife',
  'Son',
  'Daughter',
  'Brother',
  'Sister',
  'Other'
];

