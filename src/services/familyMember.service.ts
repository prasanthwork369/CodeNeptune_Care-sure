import { familyMemberApi } from '../api/familyMember.api';
import { FamilyMemberInput } from '../types/familyMember';
import { sanitizeAsciiFields } from '../utils/validation';

// iOS paste and dictation bypass the Android input filter, so strip here before the payload leaves.
const TEXT_FIELDS = ['name', 'relationship'] as const;

export const familyMemberService = {
    getMembers: () => familyMemberApi.getMembers(),
    addMember: (payload: FamilyMemberInput) =>
        familyMemberApi.addMember(sanitizeAsciiFields(payload, TEXT_FIELDS)),
    updateMember: (id: string, payload: Partial<FamilyMemberInput>) =>
        familyMemberApi.updateMember(id, sanitizeAsciiFields(payload, TEXT_FIELDS)),
    deleteMember: (id: string) => familyMemberApi.deleteMember(id),
};
