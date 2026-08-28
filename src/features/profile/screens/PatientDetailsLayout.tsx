import { PatientSkeleton } from "../components/PatientSkeleton";
import { profileStyles as s } from "../profile.styles";
import { DeleteConfirmDialog } from "@/src/components/ui/DeleteConfirmDialog";
import { NoInternetState } from "@/src/components/ui/NoInternetState";
import { RetryState } from "@/src/components/ui/RetryState";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useFamilyMembers } from "@/src/features/profile/hooks/useFamilyMembers";
import type { FamilyMember } from "../types";
import { getAge } from "@/src/utils/patient";
import { useQueryErrorState } from "@/src/hooks/ui/useQueryErrorState";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { requireInternet } from "@/src/utils/offline";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const PatientCard = ({
  item,
  onEdit,
  onDelete,
  deleting,
  isLast,
}: {
  item: FamilyMember;
  onEdit: (p: FamilyMember) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
  isLast: boolean;
}) => {
  const age = item.dateOfBirth ? getAge(item.dateOfBirth) : "";
  const isDeleting = deleting === item.id;
  return (
    <View>
      <View
        className="flex-row items-center"
        style={{
          paddingHorizontal: exactScale(10),
          paddingVertical: exactScale(14),
        }}
      >
        <View
          className="items-center justify-center rounded-full mr-3"
          style={[
            s.patientAvatar,
            {
              width: exactScale(48),
              height: exactScale(48),
              backgroundColor: "#E3EEEE",
            },
          ]}
        >
          <icons.user_active
            width={exactScale(22)}
            height={exactScale(22)}
          />
        </View>
        <View className="flex-1">
          <Text
            style={s.patientName}
            className="font-inter-bold text-brand-text mb-1.5"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View className="flex-row items-center gap-x-2">
            <View className="flex-row items-center">
              <Text
                style={s.patientDob}
                className="font-inter-medium text-[#6A6A6A]"
              >
                {capitalize(item.gender)}
              </Text>
              {age ? (
                <Text
                  style={s.patientDob}
                  className="font-inter-medium text-[#6A6A6A]"
                >
                  {" "}
                  | {age}
                </Text>
              ) : null}
            </View>
            <View
              className="px-2 py-0.5 rounded-full border border-[#DDE1E5]"
              style={{ backgroundColor: "#FAFAFA" }}
            >
              <Text
                style={s.patientTag}
                className="font-inter-medium text-[#222222]"
              >
                {item.relationship}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            width: 1,
            height: exactScale(16),
            backgroundColor: "#E1E5E8",
            marginRight: exactScale(8),
          }}
        />
        <Touchable
          onPress={() => onEdit(item)}
          activeOpacity={0.6}
          className="mr-3"
          hitSlop={{
            top: exactScale(10),
            bottom: exactScale(10),
            left: exactScale(10),
            right: exactScale(10),
          }}
        >
          <Text
            style={s.patientDetail}
            className="font-inter-semibold text-[#6A6A6A]"
          >
            Edit
          </Text>
        </Touchable>
        <Touchable
          onPress={() => onDelete(item.id)}
          disabled={isDeleting}
          activeOpacity={0.6}
          hitSlop={{
            top: exactScale(10),
            bottom: exactScale(10),
            left: exactScale(10),
            right: exactScale(10),
          }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#CA2B25" />
          ) : (
            <icons.delete_red
              width={exactScale(20)}
              height={exactScale(20)}
            />
          )}
        </Touchable>
      </View>
      {!isLast && (
        <View
          style={{
            borderTopWidth: 1,
            borderColor: "#DDE2E6",
            borderStyle: "dashed",
          }}
        />
      )}
    </View>
  );
};

export const PatientDetailsLayout: React.FC = () => {
  const router = useNav();
  const {
    members,
    loading,
    refreshing,
    listError,
    refetch,
    deleteMember,
  } = useFamilyMembers();
  const listErrorState = useQueryErrorState(listError);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Offline: show only the offline state, even with cached patients — Add
  // Patient, Edit and Delete all assume a live connection, same as My
  // Addresses. Device state is known immediately, so there's no fetch worth
  // waiting on before saying so.
  const isOffline = useIsOffline();

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    if (!requireInternet()) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await deleteMember(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isOffline) {
    return (
      <View className="flex-1 bg-[#F5F6FB]">
        <ScreenHeader title="Patient Details" />
        <NoInternetState
          onRetry={() => void refetch()}
          retrying={refreshing}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="Patient Details" />
      <View className="px-4 pt-5 pb-1 bg-[#F5F6FB]">
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.push("/profile/patients/add")}
          className="bg-[#0F7635] flex-row items-center justify-center"
          style={{
            height: exactScale(50),
            borderRadius: exactScale(12),
          }}
        >
          <icons.plus_light
            width={exactScale(18)}
            height={exactScale(18)}
          />
          <Text
            style={s.patientName}
            className="font-inter-semibold text-white ml-2"
          >
            Add Patient
          </Text>
        </Touchable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={{
          paddingHorizontal: exactScale(16),
          paddingTop: exactScale(16),
          paddingBottom: exactScale(40),
          flexGrow: 1,
        }}
        className="flex-1"
      >
        <Text
          style={s.patientName}
          className="font-inter-bold text-brand-text mb-3"
        >
          Saved Patient
        </Text>
        {loading ? (
          <PatientSkeleton />
        ) : members.length === 0 && listErrorState ? (
          <RetryState
            title="Couldn't load patients"
            onRetry={() => void refetch()}
            retrying={refreshing}
          />
        ) : members.length === 0 ? (
          <Text
            style={s.patientValue}
            className="font-inter-medium text-brand-subtext text-center mt-10"
          >
            No saved patients yet
          </Text>
        ) : (
          <View
            className="bg-white overflow-hidden"
            style={{
              borderWidth: 1,
              borderColor: "#EEF0F2",
              borderRadius: exactScale(12),
            }}
          >
            {members.map((item, index) => (
              <PatientCard
                key={item.id}
                item={item}
                onEdit={(p) =>
                  router.push({
                    pathname: "/profile/patients/add",
                    params: { id: p.id },
                  })
                }
                onDelete={(id) => setConfirmDeleteId(id)}
                deleting={deletingId}
                isLast={index === members.length - 1}
              />
            ))}
          </View>
        )}
      </ScrollView>
      <DeleteConfirmDialog
        visible={!!confirmDeleteId}
        title="Delete this patient?"
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};
