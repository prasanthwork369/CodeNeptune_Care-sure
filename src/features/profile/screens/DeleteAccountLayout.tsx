import { asError } from "@/src/api/errors";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { HOME_IMAGES } from "@/src/constants/images";
import { useAuth } from "@/src/hooks/mutations/useAuth";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import { ConfirmActionModal } from "../components/ConfirmActionModal";

// The three things the user loses on deletion — icon + copy, matching the design.
const LOSS_ITEMS = [
  {
    Icon: icons.wallet_red,
    title: "Your wallet balance and coins",
    desc: "All remaining balance and coins will be lost",
  },
  {
    Icon: icons.prescriptions_red,
    title: "Your orders and prescriptions",
    desc: "All order history and prescription details will be deleted",
  },
  {
    Icon: icons.person_red,
    title: "Account and profile data",
    desc: "All your personal information and preferences will be deleted",
  },
];

/**
 * Delete Account confirmation screen. Screen only composes the UI; the actual
 * account deletion lives in useAuth().deleteAccount (clears auth on success, so
 * the root layout redirects back to login).
 */
export const DeleteAccountLayout: React.FC = () => {
  const { deleteAccount, deletingAccount } = useAuth();
  const adjustedBottom = useAdjustedBottomInset();

  // Final "are you sure" popup — reuses the profile logout confirm dialog so
  // the destructive delete requires one more deliberate tap.
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (deletingAccount) return;
    setShowConfirm(false);
    try {
      await deleteAccount();
      // On success the auth state is cleared → root layout redirects to login.
    } catch (e) {
      Alert.alert(
        "Delete Account",
        asError(e).message ??
          "Could not delete your account. Please try again.",
      );
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScreenHeader
        title="Delete Account"
        backgroundColor="#FFFFFF"
        showBorder
      />

      <View
        style={{
          flex: 1,
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(16),
          paddingBottom: exactScale(24),
        }}
      >
        {/* Hero illustration */}
        <View style={{ alignItems: "center" }}>
          <Image
            source={HOME_IMAGES.deleteAccount}
            style={{ width: exactScale(112), height: exactScale(112) }}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text
          style={{
            fontSize: moderateScale(21),
            fontWeight: "700",
            color: "#1A1C1E",
            textAlign: "center",
            lineHeight: moderateScale(29),
            marginTop: exactScale(12),
          }}
        >
          Are you sure you want{"\n"}to delete your account
        </Text>

        {/* Subtitle */}
        <Text
          style={{
            fontSize: moderateScale(13),
            color: "#9AA0A6",
            textAlign: "center",
            lineHeight: moderateScale(21),
            marginTop: exactScale(10),
            paddingHorizontal: exactScale(8),
          }}
        >
          This action is permanent and cannot be undone. All your data will be
          permanently removed from our system
        </Text>

        {/* Section label */}
        <Text
          style={{
            fontSize: moderateScale(16),
            fontWeight: "700",
            color: "#1A1C1E",
            marginTop: exactScale(24),
            marginBottom: exactScale(12),
          }}
        >
          You will lose access to
        </Text>

        {/* Loss items card */}
        <View
          style={{
            borderWidth: 1,
            borderColor: "#EFEFEF",
            borderRadius: exactScale(12),
            paddingHorizontal: exactScale(16),
            paddingVertical: exactScale(6),
          }}
        >
          {LOSS_ITEMS.map(({ Icon, title, desc }, i) => (
            <View
              key={title}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                paddingVertical: exactScale(14),
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: "#F3F4F6",
              }}
            >
              {/* Pink icon circle */}
              <View
                style={{
                  width: exactScale(40),
                  height: exactScale(40),
                  borderRadius: exactScale(20),
                  backgroundColor: "#FDECEC",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon width={exactScale(20)} height={exactScale(20)} />
              </View>

              <View style={{ flex: 1, marginLeft: exactScale(12) }}>
                <Text
                  style={{
                    fontSize: moderateScale(14.5),
                    fontWeight: "700",
                    color: "#1A1C1E",
                  }}
                >
                  {title}
                </Text>
                <Text
                  style={{
                    fontSize: moderateScale(12.5),
                    color: "#9AA0A6",
                    lineHeight: moderateScale(18),
                    marginTop: exactScale(3),
                  }}
                >
                  {desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Footer — destructive action */}
      <View
        style={{
          paddingHorizontal: exactScale(20),
          paddingTop: exactScale(10),
          paddingBottom: adjustedBottom + exactScale(10),
          backgroundColor: "#FFFFFF",
        }}
      >
        <Touchable
          onPress={() => setShowConfirm(true)}
          disabled={deletingAccount}
          activeOpacity={0.85}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E5352F",
            borderRadius: exactScale(12),
            height: exactScale(56),
            opacity: deletingAccount ? 0.7 : 1,
          }}
        >
          {deletingAccount ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <icons.delete_white
                width={exactScale(18)}
                height={exactScale(19)}
              />
              <Text
                style={{
                  fontSize: moderateScale(15.5),
                  fontWeight: "700",
                  color: "#FFFFFF",
                  marginLeft: exactScale(10),
                }}
              >
                Yes, Delete My Account
              </Text>
            </>
          )}
        </Touchable>

        <Touchable
          onPress={() => router.back()}
          disabled={deletingAccount}
          activeOpacity={0.8}
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: exactScale(48),
            marginTop: exactScale(10),
            borderWidth: 1,
            borderColor: "#EFEFEF",
            borderRadius: exactScale(12),
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(15),
              fontWeight: "600",
              color: "#5F6368",
            }}
          >
            Keep My Account
          </Text>
        </Touchable>
      </View>

      {/* Final confirmation — same look as the profile logout popup. */}
      <ConfirmActionModal
        isVisible={showConfirm}
        message="Are you sure you want to delete your account"
        icon={<icons.delete_red width={36} height={36} />}
        confirmLabel="Yes"
        cancelLabel="No"
        isLoading={deletingAccount}
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
};
