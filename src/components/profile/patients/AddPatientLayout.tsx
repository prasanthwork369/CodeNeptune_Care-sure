import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { profileStyles as s } from "../profile.styles";
import { icons } from "@/src/constants/icons";
import { useFamilyMembers } from "@/src/hooks/queries/useFamilyMembers";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { FamilyMemberInput } from "@/src/types/familyMember";
import { formatDobDisplay, getMaxDob } from "@/src/utils/patient";
import { DatePickerModal } from "@/src/components/ui/DatePickerModal";
import { RequiredMark } from "@/src/components/ui/RequiredMark";
import { Touchable } from "@/src/components/ui/Touchable";
import { useNav } from "@/src/hooks/useNav";
import { useLocalSearchParams } from "expo-router";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { moderateScale } from "@/src/utils/exactScale";

const RELATIONSHIPS = ["Self", "Wife", "Husband", "Mother", "Father", "Other"];
const GENDERS = [
  { label: "Male", value: "MALE", icon: <icons.male width={16} height={16} /> },
  {
    label: "Female",
    value: "FEMALE",
    icon: <icons.female width={16} height={16} />,
  },
  {
    label: "Prefer not to say",
    value: "OTHER",
    icon: <icons.back_hand width={16} height={16} />,
  },
];

const input: object = {
  borderWidth: 1,
  borderColor: "#919EAB33",
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 14,
  fontSize: moderateScale(14),
  fontWeight: "500",
  color: "#1A1C1E",
  backgroundColor: "#fff",
  marginBottom: 18,
};
const labelStyle = "font-inter-bold text-brand-text mb-2";
const labelTextStyle: object = { fontSize: moderateScale(14) };
const errorText: object = {
  color: "#EF4444",
  fontSize: moderateScale(12),
  marginTop: -12,
  marginBottom: 12,
};

export const AddPatientLayout: React.FC = () => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { members, addMember, updateMember } = useFamilyMembers();
  const isOffline = useIsOffline();
  const inFlight = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const editPatient = id ? (members.find((m) => m.id === id) ?? null) : null;
  const isEditMode = !!editPatient;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const maxDob = getMaxDob();
  const [relationship, setRelationship] = useState("");
  const [otherRelationship, setOtherRelationship] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    dob?: string;
    relationship?: string;
    otherRelationship?: string;
    gender?: string;
  }>({});

  useEffect(() => {
    if (editPatient) {
      setName(editPatient.name ?? "");
      const rawPhone = editPatient.phone ?? "";
      setMobile(rawPhone.startsWith("+91") ? rawPhone.slice(3) : rawPhone);
      setDob(editPatient.dateOfBirth ?? "");
      if (editPatient.dateOfBirth)
        setDobDate(new Date(editPatient.dateOfBirth));
      const rel = editPatient.relationship ?? "";
      if (RELATIONSHIPS.includes(rel)) {
        setRelationship(rel);
      } else {
        setRelationship("Other");
        setOtherRelationship(rel);
      }
      setGender(editPatient.gender ?? "");
    }
  }, [editPatient?.id]);

  const handleSubmit = async () => {
    if (inFlight.current) return;
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!mobile || mobile.length !== 10)
      newErrors.mobile = "Enter a valid 10-digit number";
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!relationship) newErrors.relationship = "Please select a relationship";
    if (relationship === "Other" && !otherRelationship.trim())
      newErrors.otherRelationship = "Please specify relationship";
    if (!gender) newErrors.gender = "Please select a gender";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const finalRelationship =
        relationship === "Other" ? otherRelationship.trim() : relationship;
      const payload: FamilyMemberInput = {
        name: name.trim(),
        relationship: finalRelationship,
        dateOfBirth: dob,
        gender,
        phone: `+91${mobile}`,
      };
      if (isEditMode && editPatient)
        await updateMember(editPatient.id, payload);
      else await addMember(payload);
      router.back();
    } catch {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F5F6FB]">
      <ScreenHeader
        title={isEditMode ? "Edit Patient Details" : "Enter Patient Details"}
        backgroundColor="#F5F6FB"
        showBorder={false}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: adjustedBottom + 90,
          }}
          className="flex-1"
        >
          <Text className={labelStyle} style={labelTextStyle}>Name<RequiredMark /></Text>
          <TextInput
            placeholder="Enter the name"
            placeholderTextColor="#6A6A6A"
            value={name}
            onChangeText={(t) => {
              setName(t);
              setErrors((e) => ({ ...e, name: undefined }));
            }}
            style={[input, errors.name ? { borderColor: "#EF4444" } : {}]}
          />
          {errors.name && <Text style={errorText}>{errors.name}</Text>}

          <Text className={labelStyle} style={labelTextStyle}>Mobile Number<RequiredMark /></Text>
          <View
            style={[
              { flexDirection: "row", alignItems: "center", height: 52 },
              input,
              errors.mobile ? { borderColor: "#EF4444" } : {},
              { paddingVertical: 0, paddingHorizontal: 16, marginBottom: 18 },
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "500",
                color: "#1A1C1E",
                marginRight: 8,
              }}
            >
              +91 |
            </Text>
            <TextInput
              ref={applyDigitsOnlyFilter}
              placeholder="10 digit number"
              placeholderTextColor="#6A6A6A"
              keyboardType="number-pad"
              maxLength={10}
              value={mobile}
              onChangeText={(t) => {
                setMobile(t.replace(/\D/g, ""));
                setErrors((e) => ({ ...e, mobile: undefined }));
              }}
              style={{
                flex: 1,
                fontSize: moderateScale(14),
                fontWeight: "500",
                color: "#1A1C1E",
                height: "100%",
              }}
            />
          </View>
          {errors.mobile && <Text style={errorText}>{errors.mobile}</Text>}

          <Text className={labelStyle} style={labelTextStyle}>Relationship<RequiredMark /></Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom:
                errors.relationship && relationship !== "Other" ? 6 : 18,
            }}
          >
            {RELATIONSHIPS.map((item) => {
              const sel = relationship === item;
              return (
                <Touchable
                  key={item}
                  onPress={() => {
                    setRelationship(item);
                    setErrors((e) => ({ ...e, relationship: undefined }));
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 7,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: sel ? "#0F763533" : "#919EAB33",
                    backgroundColor: sel ? "#F1FFF6" : "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontWeight: "500",
                      color: sel ? "#0F7635" : "#6A6A6A",
                    }}
                  >
                    {item}
                  </Text>
                </Touchable>
              );
            })}
          </View>
          {errors.relationship && relationship !== "Other" && (
            <Text style={[errorText, { marginTop: 0, marginBottom: 12 }]}>
              {errors.relationship}
            </Text>
          )}
          {relationship === "Other" && (
            <View style={{ marginBottom: 18 }}>
              <TextInput
                placeholder="Please specify relationship"
                placeholderTextColor="#6A6A6A"
                value={otherRelationship}
                onChangeText={(t) => {
                  setOtherRelationship(t);
                  setErrors((e) => ({ ...e, otherRelationship: undefined }));
                }}
                style={[
                  input,
                  { marginBottom: 0 },
                  errors.otherRelationship ? { borderColor: "#EF4444" } : {},
                ]}
                autoFocus
              />
              {errors.otherRelationship && (
                <Text style={[errorText, { marginTop: 6, marginBottom: 0 }]}>
                  {errors.otherRelationship}
                </Text>
              )}
            </View>
          )}

          <Text className={labelStyle} style={labelTextStyle}>Date Of Birth<RequiredMark /></Text>
          <Touchable
            onPress={() => {
              setShowDatePicker(true);
              setErrors((e) => ({ ...e, dob: undefined }));
            }}
            style={[
              { flexDirection: "row", alignItems: "center" },
              input,
              errors.dob ? { borderColor: "#EF4444" } : {},
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={{
                flex: 1,
                fontSize: moderateScale(14),
                fontWeight: "500",
                color: dob ? "#1A1C1E" : "#919EAB",
              }}
            >
              {formatDobDisplay(dob) || "DD-MM-YYYY"}
            </Text>
            <icons.calendar_month width={20} height={20} fill="#919EAB" />
          </Touchable>
          {errors.dob && <Text style={errorText}>{errors.dob}</Text>}
          <DatePickerModal
            visible={showDatePicker}
            value={dobDate}
            maximumDate={maxDob}
            onClose={() => setShowDatePicker(false)}
            onChange={(selected) => {
              setDobDate(selected);
              const d = selected.getDate().toString().padStart(2, "0");
              const m = (selected.getMonth() + 1).toString().padStart(2, "0");
              setDob(`${selected.getFullYear()}-${m}-${d}`);
            }}
          />

          <Text className={labelStyle} style={labelTextStyle}>Gender<RequiredMark /></Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: errors.gender ? 6 : 28,
            }}
          >
            {GENDERS.map(({ label: g, value: gVal, icon }) => {
              const sel = gender === gVal;
              return (
                <Touchable
                  key={gVal}
                  onPress={() => {
                    setGender(gVal);
                    setErrors((e) => ({ ...e, gender: undefined }));
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: sel ? "#0F763533" : "#919EAB33",
                    backgroundColor: sel ? "#F1FFF6" : "#fff",
                    gap: 5,
                  }}
                >
                  {React.cloneElement(icon as React.ReactElement<any>, {
                    color: sel ? "#0F7635" : "#919EAB",
                  })}
                  <Text
                    style={{
                      fontSize: moderateScale(11),
                      fontWeight: "500",
                      color: sel ? "#0F7635" : "#6A6A6A",
                    }}
                  >
                    {g}
                  </Text>
                </Touchable>
              );
            })}
          </View>
          {errors.gender && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: moderateScale(12),
                marginTop: -4,
                marginBottom: 16,
              }}
            >
              {errors.gender}
            </Text>
          )}
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 px-5 bg-[#F5F6FB]"
          style={{ paddingBottom: Math.max(adjustedBottom, 20) + 14 }}
        >
          <Touchable
            activeOpacity={0.85}
            onPress={handleSubmit}
            disabled={isSubmitting || isOffline}
            style={{
              backgroundColor: "#0F7635",
              borderRadius: 14,
              paddingVertical: 18,
              alignItems: "center",
              opacity: isSubmitting || isOffline ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(15),
                fontWeight: "600",
                color: "#fff",
              }}
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating…"
                  : "Adding…"
                : isEditMode
                  ? "Update Details"
                  : "Add Patient"}
            </Text>
          </Touchable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};
