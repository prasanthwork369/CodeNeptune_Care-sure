import { API_ENDPOINTS } from "@/src/utils/urls";
import { apiClient } from "@/src/api/client";
import type { FamilyMember, FamilyMemberInput } from "../types/api.types";

export const familyMemberApi = {
  getMembers: async (): Promise<FamilyMember[]> => {
    const { data } = await apiClient.get(API_ENDPOINTS.FAMILY_MEMBERS);
    return data.data as FamilyMember[];
  },

  addMember: async (payload: FamilyMemberInput): Promise<FamilyMember> => {
    const { data } = await apiClient.post(
      API_ENDPOINTS.FAMILY_MEMBERS,
      payload,
    );
    return data.data as FamilyMember;
  },

  updateMember: async (
    memberId: string,
    payload: Partial<FamilyMemberInput>,
  ): Promise<FamilyMember> => {
    const { data } = await apiClient.patch(
      API_ENDPOINTS.FAMILY_MEMBER_BY_ID(memberId),
      payload,
    );
    return data.data as FamilyMember;
  },

  deleteMember: async (memberId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.FAMILY_MEMBER_BY_ID(memberId));
  },
};
