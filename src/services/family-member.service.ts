import { familyMemberApi } from "../api/family-member.api";
import { FamilyMemberInput } from "../types/familyMember";

export const familyMemberService = {
  getMembers: () => familyMemberApi.getMembers(),
  addMember: (payload: FamilyMemberInput) => familyMemberApi.addMember(payload),
  updateMember: (id: string, payload: Partial<FamilyMemberInput>) =>
    familyMemberApi.updateMember(id, payload),
  deleteMember: (id: string) => familyMemberApi.deleteMember(id),
};
