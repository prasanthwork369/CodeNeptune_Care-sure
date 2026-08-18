import { Address } from "@/src/types/address";
import { DeleteConfirmDialog } from "@/src/components/ui/DeleteConfirmDialog";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { AddressType } from "@/src/types/address";
import React, { useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { profileStyles as s } from "../profile.styles";
import { AddressSkeleton } from "../components/AddressSkeleton";

const labelToType = (label: string): AddressType => {
  const l = label.toUpperCase();
  if (l === "HOME") return "home";
  if (l === "WORK" || l === "OFFICE") return "office";
  return "other";
};

const TypeIcon = ({ type }: { type: AddressType }) => {
  if (type === "home")
    return <icons.home_add width={18} height={18} fill="#0F7635" />;
  if (type === "office")
    return <icons.business width={18} height={18} fill="#0F7635" />;
  return <icons.location_pin width={20} height={20} fill="#0F7635" />;
};

const AddressCard = ({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: Address;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  deleting: string | null;
}) => {
  const type = labelToType(item.label);
  const addressLine = [item.line1, item.line2, item.city]
    .filter(Boolean)
    .join(", ");
  const regionLine = [item.state, item.pincode].filter(Boolean).join(" - ");
  const fullAddress = [addressLine, regionLine].filter(Boolean).join(", ");
  const isDeleting = deleting === item.id;
  return (
    <View
      className="bg-white mb-3 overflow-hidden"
      style={{
        borderWidth: 1,
        borderColor: "#DFE3E8",
        borderRadius: 12,
      }}
    >
      <View
        className="flex-row items-center gap-x-3"
        style={{ paddingHorizontal: 14, paddingTop: 18, paddingBottom: 10 }}
      >
        <TypeIcon type={type} />
        <Text
          style={s.addrAddBtn}
          className="font-inter-semibold text-brand-text capitalize"
        >
          {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
        </Text>
        {item.isDefault && (
          <View className="ml-1 bg-[#ECFDF5] px-2 py-0.5 rounded-full">
            <Text
              style={s.addrSub}
              className="font-inter-semibold text-[#0F7635]"
            >
              Default
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[s.addrAction, { paddingHorizontal: 10, paddingBottom: 14 }]}
        className="font-inter-regular text-[#6A6A6A] leading-[22px]"
        numberOfLines={3}
        ellipsizeMode="tail"
      >
        {fullAddress}
      </Text>
      <View
        style={{
          height: 1,
          backgroundColor: "#E1E5E8",
          marginHorizontal: 10,
        }}
      />
      <View className="flex-row items-center justify-between px-3 py-3">
        <Touchable
          className="flex-row items-center gap-x-1.5"
          activeOpacity={0.6}
          onPress={() => onEdit(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <icons.edit_icon width={18} height={18} fill="#6A6A6A" />
          <Text
            style={s.addrAction}
            className="font-inter-semibold text-[#6A6A6A]"
          >
            Edit
          </Text>
        </Touchable>
        <Touchable
          className="flex-row items-center gap-x-1.5"
          activeOpacity={0.6}
          onPress={() => onDelete(item.id)}
          disabled={isDeleting}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#6A6A6A" />
          ) : (
            <>
              <icons.delete_icon width={18} height={18} fill="#6A6A6A" />
              <Text
                style={s.addrAction}
                className="font-inter-semibold text-[#6A6A6A]"
              >
                Delete
              </Text>
            </>
          )}
        </Touchable>
      </View>
    </View>
  );
};

export const MyAddressesLayout: React.FC = () => {
  const adjustedBottom = useAdjustedBottomInset();
  const router = useNav();
  const { addresses, loading, error, deleting, deleteAddress } = useAddress();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const shouldShowInitialShimmer = loading && addresses.length === 0;
  // Ref, not state, so a rapid double-tap on the confirm dialog's button
  // (before React re-renders to hide it) can't fire a second delete.
  const deletingRef = useRef(false);

  const handleDeleteConfirm = async () => {
    if (!confirmId || deletingRef.current) return;
    deletingRef.current = true;
    const id = confirmId;
    setConfirmId(null);
    try {
      await deleteAddress(id);
    } finally {
      deletingRef.current = false;
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Addresses" backgroundColor="#FFFFFF" />
      <View className="px-4 pt-5 pb-1 bg-[#F5F6FB]">
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.push("/profile/addresses/add")}
          className="bg-[#0F7635] flex-row items-center justify-center"
          style={{ height: 50, borderRadius: 12 }}
        >
          <icons.plus_light width={18} height={18} />
          <Text
            style={s.addrTitle}
            className="font-inter-semibold text-white ml-2"
          >
            Add New Address
          </Text>
        </Touchable>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        overScrollMode="auto"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: adjustedBottom + 24,
          flexGrow: 1,
        }}
        className="flex-1"
      >
        <Text
          style={s.addrAddBtn}
          className="font-inter-bold text-brand-text mb-3"
        >
          Saved Addresses
        </Text>
        {error ? (
          <Text
            style={s.addrAction}
            className="text-red-500 font-inter-medium mb-3"
          >
            {error}
          </Text>
        ) : null}
        {shouldShowInitialShimmer ? (
          <AddressSkeleton />
        ) : (
          <>
            {addresses.map((item) => (
              <AddressCard
                key={item.id}
                item={item}
                onEdit={(id) =>
                  router.push({
                    pathname: "/profile/addresses/add",
                    params: { id },
                  })
                }
                onDelete={(id) => setConfirmId(id)}
                deleting={deleting}
              />
            ))}
            {addresses.length === 0 && (
              <Text
                style={s.addrLabel}
                className="font-inter-medium text-brand-subtext text-center mt-10"
              >
                No saved addresses yet
              </Text>
            )}
          </>
        )}
      </ScrollView>
      <DeleteConfirmDialog
        visible={!!confirmId}
        title="Are you sure you want to delete this address?"
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};
