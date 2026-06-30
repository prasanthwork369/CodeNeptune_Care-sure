import { PatientSkeleton } from '@/src/components/profile/patients/PatientSkeleton';
import { DeleteConfirmDialog } from '@/src/components/ui/DeleteConfirmDialog';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Touchable } from '@/src/components/ui/Touchable';
import { icons } from '@/src/constants/icons';
import { useFamilyMembers } from '@/src/hooks/queries/useFamilyMembers';
import { FamilyMember } from '@/src/types/familyMember';
import { getAge } from '@/src/utils/patient';
import { useNav } from '@/src/hooks/useNav';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { moderateScale } from '@/src/utils/exactScale';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const PatientCard = ({ item, onEdit, onDelete, deleting }: { item: FamilyMember; onEdit: (p: FamilyMember) => void; onDelete: (id: string) => void; deleting: string | null }) => {
    const age = item.dateOfBirth ? getAge(item.dateOfBirth) : '';
    const isDeleting = deleting === item.id;
    return (
        <View className="bg-white rounded-2xl mb-3 px-4 py-4 flex-row items-center" style={{ borderWidth: 1, borderColor: '#F0F0F0' }}>
            <View className="items-center justify-center rounded-full mr-3" style={{ width: 46, height: 46, backgroundColor: '#E8F5EE' }}>
                <icons.user_active width={22} height={22} />
            </View>
            <View className="flex-1">
                <Text className="font-inter-bold text-brand-text mb-1" style={{ fontSize: moderateScale(15) }} numberOfLines={1}>{item.name}</Text>
                <View className="flex-row items-center gap-x-2">
                    <Text className="font-inter-medium text-[#6A6A6A]" style={{ fontSize: moderateScale(12) }}>{capitalize(item.gender)}{age ? `  •  ${age}` : ''}</Text>
                    <View className="px-2 py-0.5 rounded-full border border-[#919EAB33]" style={{ backgroundColor: '#F9F9F9' }}>
                        <Text className="font-inter-semibold text-[#222222]" style={{ fontSize: moderateScale(11) }}>{item.relationship}</Text>
                    </View>
                </View>
            </View>
            <Touchable onPress={() => onEdit(item)} activeOpacity={0.6} className="flex-row items-center mr-4" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <icons.edit_icon width={14} height={14} fill="#6A6A6A" />
                <Text className="font-inter-semibold text-[#6A6A6A] ml-1" style={{ fontSize: moderateScale(13) }}>Edit</Text>
            </Touchable>
            <Touchable onPress={() => onDelete(item.id)} disabled={isDeleting} activeOpacity={0.6} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                {isDeleting ? <ActivityIndicator size="small" color="#CA2B25" /> : <icons.delete_red width={20} height={20} />}
            </Touchable>
        </View>
    );
};

export const PatientDetailsLayout: React.FC = () => {
    const router = useNav();
    const { members, loading, deleteMember } = useFamilyMembers();
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeleteConfirm = async () => {
        if (!confirmDeleteId) return;
        const id = confirmDeleteId;
        setConfirmDeleteId(null);
        setDeletingId(id);
        try { await deleteMember(id); } finally { setDeletingId(null); }
    };

    return (
        <View className="flex-1 bg-[#F5F6FB]">
            <ScreenHeader title="Patient Details" />
            <View className="px-4 pt-4 pb-3 bg-[#F5F6FB]">
                <Touchable activeOpacity={0.85} onPress={() => router.push('/profile/add-patient' as any)} className="bg-[#0F7635] rounded-xl py-4 flex-row items-center justify-center" style={{ shadowColor: '#0F172A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }}>
                    <icons.plus_light width={16} height={16} />
                    <Text className="font-inter-semibold text-white ml-2" style={{ fontSize: moderateScale(15) }}>Add Patient</Text>
                </Touchable>
                <View style={{ borderBottomWidth: 1, borderColor: '#E0E0E0', borderStyle: 'dashed', marginTop: 16 }} />
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, flexGrow: 1 }} className="flex-1">
                <Text className="font-inter-bold text-brand-text mb-3" style={{ fontSize: moderateScale(15) }}>Saved Patient</Text>
                {loading ? <PatientSkeleton /> : members.length === 0 ? (
                    <Text className="font-inter-medium text-brand-subtext text-center mt-10" style={{ fontSize: moderateScale(14) }}>No saved patients yet</Text>
                ) : members.map((item) => (
                    <PatientCard key={item.id} item={item} onEdit={(p) => router.push({ pathname: '/profile/add-patient' as any, params: { id: p.id } })} onDelete={(id) => setConfirmDeleteId(id)} deleting={deletingId} />
                ))}
            </ScrollView>
            <DeleteConfirmDialog visible={!!confirmDeleteId} title="Delete this patient?" onCancel={() => setConfirmDeleteId(null)} onConfirm={handleDeleteConfirm} />
        </View>
    );
};
