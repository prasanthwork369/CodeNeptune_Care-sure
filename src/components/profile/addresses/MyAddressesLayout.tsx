import { Address } from "@/src/api/address.api";
import { DeleteConfirmDialog } from "@/src/components/ui/DeleteConfirmDialog";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useNav } from "@/src/hooks/useNav";
import { AddressType } from "@/src/types/address";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { profileStyles as s } from "../profile.styles";
import { AddressSkeleton } from "./AddressSkeleton";

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
  const fullAddress = [
    item.line1,
    item.line2,
    item.city,
    item.state,
    item.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  const isDeleting = deleting === item.id;
  return (
    <View
      className="bg-white mb-3 rounded-lg py-2 overflow-hidden"
      style={{ borderWidth: 1, borderColor: "#F0F0F0" }}
    >
      <View className="flex-row items-center px-4 py-2 gap-x-2">
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
        style={s.addrAction}
        className="font-inter-regular text-[#6A6A6A] leading-[20px] px-4 pb-4"
      >
        {fullAddress}
      </Text>
      <View style={{ height: 1, backgroundColor: "#F0F0F0" }} />
      <View className="flex-row items-center justify-between px-4 py-3">
        <Touchable
          className="flex-row items-center gap-x-1.5"
          activeOpacity={0.6}
          onPress={() => onEdit(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <icons.edit_icon width={15} height={15} fill="#6A6A6A" />
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
              <icons.delete_icon width={15} height={15} fill="#6A6A6A" />
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
  const { addresses, loading, error, deleteAddress } = useAddress();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const shouldShowInitialShimmer = loading && addresses.length === 0;

  const handleDeleteConfirm = async () => {
    if (!confirmId) return;
    setConfirmId(null);
    await deleteAddress(confirmId);
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader title="My Addresses" backgroundColor="#FFFFFF" />
      <View className="px-4 pt-4 pb-3 bg-[#F5F6FB]">
        <Touchable
          activeOpacity={0.85}
          onPress={() => router.push("/profile/addresses/add")}
          className="bg-[#0F7635] rounded-lg py-4 flex-row items-center justify-center"
        >
          <icons.plus_light width={16} height={16} />
          <Text
            style={s.addrTitle}
            className="font-inter-semibold text-white ml-2"
          >
            Add New Address
          </Text>
        </Touchable>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: "#E0E0E0",
            borderStyle: "dashed",
            marginTop: 16,
          }}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
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
                deleting={null}
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
