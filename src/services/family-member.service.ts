import { familyMemberApi } from "../features/profile/api/family-member.api";
import type { FamilyMemberInput } from "../features/profile/types";

export const familyMemberService = {
  getMembers: () => familyMemberApi.getMembers(),
  addMember: (payload: FamilyMemberInput) => familyMemberApi.addMember(payload),
  updateMember: (id: string, payload: Partial<FamilyMemberInput>) =>
    familyMemberApi.updateMember(id, payload),
  deleteMember: (id: string) => familyMemberApi.deleteMember(id),
};
