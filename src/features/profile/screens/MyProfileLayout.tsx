import { asError } from "@/src/api/errors";
import { DatePickerModal } from "@/src/components/ui/DatePickerModal";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { VerifiedBadge } from "@/src/components/ui/VerifiedBadge";
import { UnsavedChangesGuard } from "@/src/components/ui/UnsavedChangesGuard";
import { icons } from "@/src/constants/icons";
import { useEmailVerification } from "@/src/features/profile/hooks/useEmailVerification";
import { useProfile } from "@/src/features/profile/hooks/useProfile";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useNav } from "@/src/hooks/useNav";
import { exactScale } from "@/src/utils/exactScale";
import { format, validate } from "@/src/utils/validation";
import { getMaxDob, getMinDob, validateDob } from "@/src/utils/patient";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmailVerifyModal } from "../components/EmailVerifyModal";
import { ProfileEditField } from "../components/ProfileEditField";
import { GENDERS } from "../constants/profile.constants";
import { useProfileFormState } from "../hooks/useProfileFormState";
import { UpdateProfilePayload } from "../types";
import { styles as s } from "./MyProfileLayout.styles";

export const MyProfileLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { profile, updating, error, updateProfile } = useProfile();
  const { requestVerify, requesting } = useEmailVerification();
  const isOffline = useIsOffline();

  // Seeded synchronously from profile (already available on first render via
  // cached initialData) so the first render never compares empty fields
  // against a populated profile — that mismatch briefly made hasChanges true
  // and flashed the Save button enabled before this effect corrected it.
  const [firstName, setFirstName] = useState(() => profile?.firstName ?? "");
  const [lastName, setLastName] = useState(() => profile?.lastName ?? "");
  const [email, setEmail] = useState(() => profile?.email ?? "");
  const [gender, setGender] = useState(() => {
    if (!profile?.gender) return "";
    const val = profile.gender.toUpperCase();
    return GENDERS.some((x) => x.value === val) ? val : "";
  });
  const [dob, setDob] = useState<Date | null>(() =>
    profile?.dateOfBirth ? new Date(profile.dateOfBirth) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderSheet, setShowGenderSheet] = useState(false);
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [dobError, setDobError] = useState("");
  const [saveCompleted, setSaveCompleted] = useState(false);

  // Hydrate form once per profile id to prevent clobbering in-flight edits during refetches
  const hydratedIdRef = useRef<string | null>(profile?.id ?? null);
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

  const {
    normalizedFirstName,
    normalizedLastName,
    normalizedEmail,
    normalizedGender,
    hasChanges,
    isSaveDisabled,
  } = useProfileFormState({
    firstName,
    lastName,
    email,
    gender,
    dob,
    profile,
    updating,
    isOffline,
  });

  const isCurrentEmailVerified =
    !!profile?.isEmailVerified &&
    !!normalizedEmail &&
    normalizedEmail.toLowerCase() === (profile.email ?? "").trim().toLowerCase();

  const handleGenderPick = () => {
    Keyboard.dismiss();
    setShowGenderSheet(true);
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;
    try {
      const payload: UpdateProfilePayload = {};
      if (normalizedFirstName) payload.firstName = normalizedFirstName;
      if (normalizedLastName) payload.lastName = normalizedLastName;
      payload.email = normalizedEmail;
      if (normalizedGender) payload.gender = normalizedGender;

      if (dob) {
        const dobValidation = validateDob(dob.toISOString());
        if (!dobValidation.valid) {
          setDobError(
            dobValidation.error ?? "Please enter a valid date of birth.",
          );
          return;
        }
        setDobError("");
        payload.dateOfBirth = dob.toISOString();
      }

      if (Object.keys(payload).length === 0) return;

      await updateProfile(payload);
      setSaveCompleted(true);
      setTimeout(() => router.back(), 0);
    } catch (e) {
      const err = asError(e);
      if (__DEV__) console.error("[Profile Update Error]", err);
    }
  };

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
    } catch (e) {
      setEmailError(
        asError(e).message ?? "Could not send code. Please try again.",
      );
    }
  };

  const handleEmailVerified = () => {
    setShowEmailVerify(false);
  };

  const handleDeleteAccount = () => router.push("/profile/delete-account");

  return (
    <View style={s.root}>
      <UnsavedChangesGuard hasUnsavedChanges={!saveCompleted && hasChanges} />
      <ScreenHeader title="My Profile" backgroundColor="#FFFFFF" showBorder />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        overScrollMode="auto"
        contentContainerStyle={s.scrollContent}
      >
        <ProfileEditField
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Enter first name"
        />

        <ProfileEditField
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Enter last name"
        />

        <ProfileEditField
          label="Mobile Number"
          value={format.phone(profile?.phoneNumber)}
          editable={false}
          keyboardType="number-pad"
          rightSlot={profile?.isPhoneVerified ? <VerifiedBadge /> : null}
        />

        <ProfileEditField
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
              <VerifiedBadge />
            ) : email ? (
              <Touchable
                onPress={handleVerifyEmail}
                disabled={requesting}
                hitSlop={{
                  top: exactScale(8),
                  bottom: exactScale(8),
                  left: exactScale(8),
                  right: exactScale(8),
                }}
              >
                {requesting ? (
                  <ActivityIndicator size="small" color="#0F7635" />
                ) : (
                  <Text style={s.verifyText}>Verify</Text>
                )}
              </Touchable>
            ) : null
          }
        />

        <View style={s.dobRow}>
          <View style={s.dobCol}>
            <Text style={s.fieldLabel}>Gender</Text>
            <Touchable
              onPress={handleGenderPick}
              activeOpacity={0.8}
              style={s.pickerBtn}
            >
              <Text style={gender ? s.pickerText : s.pickerPlaceholder}>
                {GENDERS.find((x) => x.value === gender)?.label || "Select"}
              </Text>
              <icons.down_arrow width={exactScale(16)} height={exactScale(16)} />
            </Touchable>
          </View>

          <View style={s.dobCol}>
            <Text style={s.fieldLabel}>Date of Birth</Text>
            <Touchable
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.8}
              style={s.pickerBtn}
            >
              <Text style={formattedDob ? s.pickerText : s.pickerPlaceholder}>
                {formattedDob || "DD-MM-YYYY"}
              </Text>
              <icons.calendar_month width={exactScale(18)} height={exactScale(18)} />
            </Touchable>
            {dobError ? <Text style={s.fieldError}>{dobError}</Text> : null}
          </View>
        </View>

        <DatePickerModal
          visible={showDatePicker}
          value={dob ?? new Date(2000, 0, 1)}
          minimumDate={getMinDob()}
          maximumDate={getMaxDob()}
          onClose={() => setShowDatePicker(false)}
          onChange={(date) => {
            setDob(date);
            setDobError("");
          }}
        />

        {error ? <Text style={s.generalError}>{error}</Text> : null}

        <View style={s.deleteCardWrapper}>
          <View style={s.deleteCard}>
            <Touchable onPress={handleDeleteAccount} activeOpacity={0.6}>
              <View style={s.deleteRow}>
                <View style={{ flex: 1 }}>
                  <Text style={s.deleteTitle}>Delete Account</Text>
                  <Text style={s.deleteDesc}>
                    Deleting your account will remove all your order, wallet
                    amount and any active referral
                  </Text>
                </View>
                <View style={s.deleteArrowWrap}>
                  <icons.arrow_forward_gray width={exactScale(18)} height={exactScale(18)} />
                </View>
              </View>
            </Touchable>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={s.bottomArea}>
        <View style={s.bottomPadding}>
          <Touchable
            testID="save-profile-btn"
            onPress={handleSave}
            disabled={isSaveDisabled}
            activeOpacity={0.85}
            style={[
              s.saveBtn,
              isSaveDisabled ? s.saveBtnDisabled : s.saveBtnEnabled,
            ]}
          >
            {updating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.saveBtnText}>Save Changes</Text>
            )}
          </Touchable>
        </View>
      </SafeAreaView>

      <GorhomBottomSheet
        isVisible={showGenderSheet}
        onClose={() => setShowGenderSheet(false)}
      >
        <BottomSheetView
          style={[
            s.genderSheetContent,
            { paddingBottom: adjustedBottom + exactScale(8) },
          ]}
        >
          <Text style={s.genderSheetTitle}>Select Gender</Text>
          {GENDERS.map((g) => (
            <Touchable
              key={g.value}
              onPress={() => {
                setGender(g.value);
                setShowGenderSheet(false);
              }}
              activeOpacity={0.8}
              style={s.genderRow}
            >
              <Text
                style={gender === g.value ? s.genderLabelActive : s.genderLabel}
              >
                {g.label}
              </Text>
              {gender === g.value && (
                <icons.check_circle
                  width={exactScale(20)}
                  height={exactScale(20)}
                  fill="#0F7635"
                />
              )}
            </Touchable>
          ))}
          <View style={{ height: exactScale(8) }} />
        </BottomSheetView>
      </GorhomBottomSheet>

      <EmailVerifyModal
        isVisible={showEmailVerify}
        email={email.trim()}
        onClose={() => setShowEmailVerify(false)}
        onVerified={handleEmailVerified}
      />
    </View>
  );
};
