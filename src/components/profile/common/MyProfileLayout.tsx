import { UpdateProfilePayload } from "@/src/api/profile.api";
import { DatePickerModal } from "@/src/components/ui/DatePickerModal";
import { FormField } from "@/src/components/ui/FormField";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useEmailVerification } from "@/src/hooks/mutations/useEmailVerification";
import { useProfile } from "@/src/hooks/queries/useProfile";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useNav } from "@/src/hooks/useNav";
import { moderateScale } from "@/src/utils/exactScale";
import { format, validate } from "@/src/utils/validation";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmailVerifyModal } from "./EmailVerifyModal";

// Label shown to the user vs. value sent to the backend (kept in sync with
// AddPatientLayout — "Prefer not to say" maps to the "OTHER" gender value).
const GENDERS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Prefer not to say", value: "OTHER" },
];

export const MyProfileLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { profile, updating, error, updateProfile } = useProfile();
  const { requestVerify, requesting } = useEmailVerification();
  const isOffline = useIsOffline();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Hydrate the form once per profile (keyed by id). A background refetch of the
  // same profile returns a new object each time; re-syncing on every change would
  // clobber the user's in-progress edits — e.g. revert a changed email back to
  // the verified one and make the Verify button disappear.
  const hydratedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!profile || hydratedIdRef.current === profile.id) return;
    hydratedIdRef.current = profile.id;
    setFirstName(profile.firstName ?? "");
    setLastName(profile.lastName ?? "");
    setEmail(profile.email ?? "");
    if (profile.gender) {
      const val = profile.gender.toUpperCase();
      setGender(GENDERS.some((x) => x.value === val) ? val : "");
    }
    if (profile.dateOfBirth) setDob(new Date(profile.dateOfBirth));
  }, [profile]);

  const formattedDob = dob
    ? `${String(dob.getDate()).padStart(2, "0")}-${String(dob.getMonth() + 1).padStart(2, "0")}-${dob.getFullYear()}`
    : "";

  // Show the "Verified" badge only while the field still holds the exact
  // address that was verified. Once the user edits the email it's a new,
  // unverified address, so the Verify button must re-enable.
  const isCurrentEmailVerified =
    !!profile?.isEmailVerified &&
    !!email.trim() &&
    email.trim().toLowerCase() === (profile.email ?? "").trim().toLowerCase();

  // Dismiss the keyboard first so it doesn't stay open over the gender sheet
  // when a text field (name/email) was focused.
  const handleGenderPick = () => {
    Keyboard.dismiss();
    setShowGenderSheet(true);
  };

  const handleSave = async () => {
    try {
      const payload: UpdateProfilePayload = {};
      if (firstName.trim()) payload.firstName = firstName.trim();
      if (lastName.trim()) payload.lastName = lastName.trim();
      payload.email = email.trim();
      if (gender) payload.gender = gender;
      if (dob) payload.dateOfBirth = dob.toISOString();

      if (Object.keys(payload).length === 0) return;

      await updateProfile(payload);
      router.back();
    } catch (err: any) {
      if (__DEV__) {
        console.error("[Profile Update Error]", err);
        // Log full API validation details to identify which field is failing
        if (err?.data)
          console.error(
            "[Profile Update Details]",
            JSON.stringify(err.data, null, 2),
          );
      }
    }
  };

  // Sends the OTP to the entered email, then opens the verify sheet.
  // Validation errors show inline under the field (not a popup alert).
  const handleVerifyEmail = async () => {
    const result = validate.email(email);
    if (!result.valid) {
      setEmailError(result.message);
      return;
    }
    setEmailError("");
    try {
      await requestVerify(email.trim());
      setShowEmailVerify(true);
    } catch (err: any) {
      setEmailError(err?.message ?? "Could not send code. Please try again.");
    }
  };

  const handleEmailVerified = () => {
    setShowEmailVerify(false);
    // Profile is refreshed via React Query invalidation inside useEmailVerification.
    // isEmailVerified on the profile object will flip to true, which updates the
    // rightSlot badge automatically — no Alert needed.
  };

  // Opens the dedicated Delete Account confirmation screen, which handles the
  // actual deletion (and the "lose access to" details from the design).
  const handleDeleteAccount = () => router.push("/profile/delete-account" as any);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F6FB" }}>
      <ScreenHeader title="My Profile" backgroundColor="#FFFFFF" showBorder />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      >
        {/* First Name */}
        <FormField
          variant="boxed"
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />

        {/* Last Name */}
        <FormField
          variant="boxed"
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />

        {/* Mobile Number */}
        <FormField
          variant="boxed"
          label="Mobile Number"
          value={format.phone(profile?.phoneNumber)}
          editable={false}
          keyboardType="number-pad"
        />

        {/* Email */}
        <FormField
          variant="boxed"
          label="Email"
          value={email}
          onChangeText={(t) => {
            setEmail(t);
            if (emailError) setEmailError("");
          }}
          placeholder="Enter email address"
          keyboardType="email-address"
          error={emailError}
          rightSlot={
            isCurrentEmailVerified ? (
              // Already verified — show a green badge, no action needed
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <icons.check_circle width={16} height={16} fill="#0F7635" />
                <Text
                  style={{
                    fontSize: moderateScale(12),
                    fontWeight: "600",
                    color: "#0F7635",
                  }}
                >
                  Verified
                </Text>
              </View>
            ) : email ? (
              // Not yet verified — show the Verify button
              <Touchable
                onPress={handleVerifyEmail}
                disabled={requesting}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                {requesting ? (
                  <ActivityIndicator size="small" color="#0F7635" />
                ) : (
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontWeight: "600",
                      color: "#0F7635",
                    }}
                  >
                    Verify
                  </Text>
                )}
              </Touchable>
            ) : null
          }
        />

        {/* Gender + Date of Birth row */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          {/* Gender */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontWeight: "600",
                color: "#222222",
                marginBottom: 6,
              }}
            >
              Gender
            </Text>
            <Touchable
              onPress={handleGenderPick}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E8E8E8",
                paddingHorizontal: 14,
                height: 48,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: moderateScale(14),
                  color: gender ? "#111827" : "#AAAAAA",
                }}
              >
                {GENDERS.find((x) => x.value === gender)?.label || "Select"}
              </Text>
              <icons.down_arrow width={16} height={16} />
            </Touchable>
          </View>

          {/* Date of Birth */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontWeight: "600",
                color: "#222222",
                marginBottom: 6,
              }}
            >
              Date of Birth
            </Text>
            <Touchable
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#FFFFFF",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E8E8E8",
                paddingHorizontal: 14,
                height: 48,
              }}
            >
              <Text
                style={{
                  flex: 1,
                  fontSize: moderateScale(14),
                  color: formattedDob ? "#111827" : "#AAAAAA",
                }}
              >
                {formattedDob || "DD-MM-YYYY"}
              </Text>
              <icons.calendar_month width={18} height={18} />
            </Touchable>
          </View>
        </View>

        <DatePickerModal
          visible={showDatePicker}
          value={dob ?? new Date(2000, 0, 1)}
          maximumDate={new Date()}
          onClose={() => setShowDatePicker(false)}
          onChange={(date) => setDob(date)}
        />

        {error ? (
          <Text
            style={{
              fontSize: moderateScale(13),
              fontWeight: "500",
              color: "#EF4444",
              marginBottom: 12,
            }}
          >
            {error}
          </Text>
        ) : null}

        {/* Delete Account */}
        <View
          style={{
            marginTop: 24,
            borderTopWidth: 1,
            borderTopColor: "#E8E8E8",
            paddingTop: 20,
          }}
        >
          <Touchable
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
            style={{ marginBottom: 6 }}
          >
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "700",
                color: "#CA2B25",
              }}
            >
              Delete Account
            </Text>
          </Touchable>
          <Text
            style={{
              fontSize: moderateScale(13),
              color: "#6B7280",
              lineHeight: moderateScale(20),
            }}
          >
            Deleting your account will remove all your order, wallet amount and
            any active referral
          </Text>
        </View>
      </ScrollView>

      {/* Save Changes */}
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: "#F5F6FB" }}>
        <View
          style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}
        >
          <Touchable
            onPress={handleSave}
            disabled={updating || isOffline}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#0F7635",
              borderRadius: 10,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
              opacity: updating || isOffline ? 0.5 : 1,
            }}
          >
            {updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                Save Changes
              </Text>
            )}
          </Touchable>
        </View>
      </SafeAreaView>

      {/* Gender Picker Sheet */}
      <GorhomBottomSheet
        isVisible={showGenderSheet}
        onClose={() => setShowGenderSheet(false)}
      >
        <BottomSheetView
          // Adjusted bottom inset so the last option isn't hidden behind the
          // Android 3-button nav bar (edge-to-edge is enabled); consistent with
          // the tab bar / other bottom UI.
          style={{
            paddingHorizontal: 20,
            paddingTop: 24,
            paddingBottom: adjustedBottom + 8,
          }}
        >
          <Text
            style={{
              fontSize: moderateScale(16),
              fontWeight: "700",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Select Gender
          </Text>
          {GENDERS.map((g, i) => (
            <Touchable
              key={g.value}
              onPress={() => {
                setGender(g.value);
                setShowGenderSheet(false);
              }}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
                borderBottomWidth: i < GENDERS.length - 1 ? 1 : 0,
                borderBottomColor: "#F3F4F6",
              }}
            >
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: gender === g.value ? "600" : "400",
                  color: gender === g.value ? "#0F7635" : "#111827",
                }}
              >
                {g.label}
              </Text>
              {gender === g.value && (
                <icons.check_circle width={20} height={20} fill="#0F7635" />
              )}
            </Touchable>
          ))}
          <View style={{ height: 8 }} />
        </BottomSheetView>
      </GorhomBottomSheet>

      {/* Email Verification Modal */}
      <EmailVerifyModal
        isVisible={showEmailVerify}
        email={email.trim()}
        onClose={() => setShowEmailVerify(false)}
        onVerified={handleEmailVerified}
      />
    </View>
  );
};
