import { DatePickerModal } from "@/src/components/ui/DatePickerModal";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { FamilyMember, FamilyMemberInput } from "@/src/types/familyMember";
import { formatDobDisplay, getMaxDob } from "@/src/utils/patient";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { profileStyles as s } from "../profile.styles";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface AddPatientSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onAdd: (patient: FamilyMemberInput) => Promise<void>;
  editPatient?: FamilyMember | null;
  onEdit?: (id: string, patient: FamilyMemberInput) => Promise<void>;
  onDelete?: (id: string) => void;
}

const RELATIONSHIPS = ["Self", "Wife", "Husband", "Mother", "Father", "Other"];

const GENDERS = [
  { label: "Male", value: "MALE", icon: <icons.male width={exactScale(16)} height={exactScale(16)} /> },
  {
    label: "Female",
    value: "FEMALE",
    icon: <icons.female width={exactScale(16)} height={exactScale(16)} />,
  },
  {
    label: "Prefer not to say",
    value: "OTHER",
    icon: <icons.back_hand width={exactScale(16)} height={exactScale(16)} />,
  },
];

export function AddPatientSheet({
  isVisible,
  onClose,
  onAdd,
  editPatient,
  onEdit,
  onDelete,
}: AddPatientSheetProps) {
  const adjustedBottom = useAdjustedBottomInset();
  const snapPoints = useMemo(() => ["80%"], []);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [dobDate, setDobDate] = useState<Date>(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [relationship, setRelationship] = useState("");
  const [otherRelationship, setOtherRelationship] = useState("");
  const [gender, setGender] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    dob?: string;
    relationship?: string;
    mobile?: string;
    gender?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);

  const isEditMode = !!editPatient;
  const mobileRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const maxDob = getMaxDob();

  useEffect(() => {
    if (isVisible && editPatient) {
      setName(editPatient.name ?? "");
      const rawPhone = editPatient.phone ?? "";
      setMobile(rawPhone.startsWith("+91") ? rawPhone.slice(3) : rawPhone);
      setDob(editPatient.dateOfBirth ?? "");
      if (editPatient.dateOfBirth)
        setDobDate(new Date(editPatient.dateOfBirth));
      const rel = editPatient.relationship ?? "";
      const isOther = !RELATIONSHIPS.slice(0, -1).includes(rel);
      setRelationship(isOther && rel ? "Other" : rel);
      setOtherRelationship(isOther ? rel : "");
      setGender(editPatient.gender ?? "");
      setErrors({});
    } else if (isVisible && !editPatient) {
      setName("");
      setMobile("");
      setDob("");
      setDobDate(new Date(2000, 0, 1));
      setRelationship("");
      setOtherRelationship("");
      setGender("");
      setErrors({});
    }
  }, [isVisible, editPatient]);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!relationship) newErrors.relationship = "Please select a relationship";
    else if (relationship === "Other" && !otherRelationship.trim())
      newErrors.relationship = "Please specify the relationship";
    if (!mobile) newErrors.mobile = "Mobile number is required";
    else if (mobile.length !== 10)
      newErrors.mobile = "Enter a valid 10-digit number";
    if (!gender) newErrors.gender = "Please select a gender";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload: FamilyMemberInput = {
      name: name.trim(),
      relationship:
        relationship === "Other" ? otherRelationship.trim() : relationship,
      dateOfBirth: dob,
      gender,
      phone: `+91${mobile}`,
    };

    if (inFlight.current) return;
    inFlight.current = true;
    setIsSubmitting(true);
    try {
      if (isEditMode && editPatient && onEdit)
        await onEdit(editPatient.id, payload);
      else await onAdd(payload);
      onClose();
    } catch {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <GorhomBottomSheet
        isVisible={isVisible}
        onClose={onClose}
        snapPoints={snapPoints}
        closeButtonOffset="80%"
        keyboardBehavior="interactive"
        keyboardBlurBehavior="none"
        backgroundStyle={{
          backgroundColor: "#fff",
          borderTopLeftRadius: exactScale(12),
          borderTopRightRadius: exactScale(12),
        }}
      >
        <BottomSheetScrollView
          style={{ flex: 1, paddingHorizontal: exactScale(20) }}
          contentContainerStyle={{
            paddingTop: exactScale(24),
            paddingBottom: adjustedBottom + exactScale(24),
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: exactScale(20),
            }}
          >
            <Text
              style={s.patientTitle}
              className="font-inter-semibold text-[#222222]"
            >
              {isEditMode ? "Edit Patient" : "Add Family Member"}
            </Text>
          </View>

          <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(14), marginBottom: exactScale(8) }}>
            Name
          </Text>
          <View
            style={[
              { height: exactScale(52), justifyContent: "center" },
              inputStyle,
              { paddingVertical: 0 },
              errors.name ? { borderColor: "#EF4444" } : {},
            ]}
          >
            <TextInput
              placeholder="Enter the name"
              placeholderTextColor="#6A6A6A"
              style={{
                fontSize: moderateScale(14),
                fontWeight: "400",
                color: "#1A1C1E",
                padding: 0,
                margin: 0,
              }}
              value={name}
              onChangeText={(t) => {
                setName(t);
                setErrors((e) => (e.name ? { ...e, name: undefined } : e));
              }}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => mobileRef.current?.focus()}
              autoCorrect={false}
            />
          </View>
          {errors.name && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: moderateScale(12),
                marginTop: exactScale(-12),
                marginBottom: exactScale(12),
              }}
            >
              {errors.name}
            </Text>
          )}

          <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(14), marginBottom: exactScale(8) }}>
            Mobile Number
          </Text>
          <View
            style={[
              { flexDirection: "row", alignItems: "center", height: exactScale(52) },
              inputStyle,
              errors.mobile ? { borderColor: "#EF4444" } : {},
              { paddingVertical: 0, paddingHorizontal: exactScale(16), marginBottom: exactScale(18) },
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(14),
                fontWeight: "500",
                color: "#1A1C1E",
                marginRight: exactScale(8),
              }}
            >
              +91 |
            </Text>
            <TextInput
              ref={mobileRef}
              placeholder="Enter The number"
              placeholderTextColor="#6A6A6A"
              keyboardType="phone-pad"
              maxLength={10}
              returnKeyType="done"
              style={{
                flex: 1,
                fontSize: moderateScale(14),
                fontWeight: "400",
                color: "#1A1C1E",
                height: "100%",
              }}
              value={mobile}
              onChangeText={(t) => {
                const d = t.replace(/\D/g, "");
                setMobile(d);
                setErrors((e) => (e.mobile ? { ...e, mobile: undefined } : e));
              }}
            />
          </View>
          {errors.mobile && (
            <Text
              style={{
                color: "#EF4444",
                fontSize: moderateScale(12),
                marginTop: exactScale(-12),
                marginBottom: exactScale(12),
              }}
            >
              {errors.mobile}
            </Text>
          )}

          <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(14), marginBottom: exactScale(8) }}>
            Relationship
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: exactScale(8),
              marginBottom:
                errors.relationship && relationship !== "Other" ? exactScale(6) : exactScale(18),
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
                  className="rounded-full"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: exactScale(7),
                    paddingHorizontal: exactScale(14),
                    borderWidth: 1,
                    borderColor: sel ? "#0F763533" : "#919EAB33",
                    backgroundColor: sel ? "#F1FFF6" : "#fff",
                    gap: exactScale(5),
                  }}
                >
                  <Text
                    className="font-inter-medium"
                    style={{ fontSize: moderateScale(13), color: sel ? "#0F7635" : "#6A6A6A" }}
                  >
                    {item}
                  </Text>
                </Touchable>
              );
            })}
          </View>
          {errors.relationship && relationship !== "Other" && (
            <Text style={{ color: "#EF4444", fontSize: moderateScale(12), marginBottom: exactScale(12) }}>
              {errors.relationship}
            </Text>
          )}
          {relationship === "Other" && (
            <>
              <TextInput
                placeholder="Specify relationship"
                placeholderTextColor="#6A6A6A"
                style={[
                  inputStyle,
                  {
                    marginTop: exactScale(-10),
                    marginBottom: errors.relationship ? exactScale(6) : exactScale(18),
                  },
                  errors.relationship ? { borderColor: "#EF4444" } : {},
                ]}
                value={otherRelationship}
                onChangeText={(t) => {
                  setOtherRelationship(t);
                  setErrors((e) =>
                    e.relationship ? { ...e, relationship: undefined } : e,
                  );
                }}
                autoCorrect={false}
                autoFocus
              />
              {errors.relationship && (
                <Text
                  style={{ color: "#EF4444", fontSize: moderateScale(12), marginBottom: exactScale(12) }}
                >
                  {errors.relationship}
                </Text>
              )}
            </>
          )}

          <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(14), marginBottom: exactScale(8) }}>
            Date Of Birth
          </Text>
          {errors.dob && (
            <Text style={{ color: "#EF4444", fontSize: moderateScale(12), marginBottom: exactScale(6) }}>
              {errors.dob}
            </Text>
          )}
          <Touchable
            onPress={() => {
              setShowDatePicker(true);
              setErrors((e) => ({ ...e, dob: undefined }));
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: errors.dob ? "#EF4444" : "#919EAB33",
              borderRadius: exactScale(8),
              paddingHorizontal: exactScale(16),
              backgroundColor: "#fff",
              marginBottom: exactScale(18),
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                flex: 1,
                paddingVertical: exactScale(14),
                fontSize: moderateScale(14),
                fontWeight: "400",
                color: dob ? "#1A1C1E" : "#6A6A6A",
              }}
            >
              {formatDobDisplay(dob) || "DD-MM-YYYY"}
            </Text>
            <icons.calendar_month width={exactScale(20)} height={exactScale(20)} fill="#919EAB" />
          </Touchable>
          <DatePickerModal
            visible={showDatePicker}
            value={dobDate}
            maximumDate={maxDob}
            onClose={() => setShowDatePicker(false)}
            onChange={(selected) => {
              setDobDate(selected);
              const d = selected.getDate().toString().padStart(2, "0");
              const m = (selected.getMonth() + 1).toString().padStart(2, "0");
              const y = selected.getFullYear();
              setDob(`${y}-${m}-${d}`);
            }}
          />

          <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(14), marginBottom: exactScale(8) }}>
            Gender
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: exactScale(6),
              marginBottom: errors.gender ? exactScale(6) : exactScale(28),
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
                  className="rounded-full"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: exactScale(10),
                    paddingHorizontal: exactScale(10),
                    borderWidth: 1,
                    borderColor: sel ? "#0F763533" : "#919EAB33",
                    backgroundColor: sel ? "#F1FFF6" : "#fff",
                    gap: exactScale(4),
                  }}
                >
                  {React.cloneElement(icon as React.ReactElement<any>, {
                    color: sel ? "#0F7635" : "#919EAB",
                  })}
                  <Text
                    className="font-inter-medium"
                    style={{ fontSize: moderateScale(12), color: sel ? "#0F7635" : "#6A6A6A" }}
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
                marginTop: exactScale(-4),
                marginBottom: exactScale(16),
              }}
            >
              {errors.gender}
            </Text>
          )}

          <Touchable
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#0F7635",
              borderRadius: exactScale(14),
              paddingVertical: exactScale(16),
              alignItems: "center",
              opacity: isSubmitting ? 0.75 : 1,
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  fontSize: moderateScale(15),
                  fontWeight: "600",
                  color: "#fff",
                }}
              >
                {isEditMode ? "Save Changes" : "Add Patient"}
              </Text>
            )}
          </Touchable>
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    </>
  );
}

const inputStyle: object = {
  borderWidth: 1,
  borderColor: "#919EAB33",
  borderRadius: exactScale(8),
  paddingHorizontal: exactScale(16),
  paddingVertical: exactScale(14),
  fontSize: moderateScale(14),
  fontWeight: "400",
  color: "#6A6A6A",
  backgroundColor: "#fff",
  marginBottom: exactScale(18),
};
