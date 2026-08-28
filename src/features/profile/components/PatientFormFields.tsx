import { DatePickerModal } from "@/src/components/ui/DatePickerModal";
import { RequiredMark } from "@/src/components/ui/RequiredMark";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { exactScale } from "@/src/utils/exactScale";
import {
  GENDER_OPTIONS_WITH_ICONS,
  PATIENT_RELATIONSHIPS,
} from "../constants/profile.constants";
import { PatientFormErrors } from "../hooks/usePatientForm";
import { formatDobDisplay, getMaxDob, getMinDob } from "@/src/utils/patient";
import { sanitize } from "@/src/utils/validation";
import React from "react";
import { Text, TextInput, View } from "react-native";
import { styles as s } from "./PatientFormFields.styles";

export interface PatientFormFieldsProps {
  name: string;
  setName: (name: string) => void;
  mobile: string;
  setMobile: (mobile: string) => void;
  dob: string;
  setDob: (dob: string) => void;
  dobDate: Date;
  setDobDate: (date: Date) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  relationship: string;
  setRelationship: (rel: string) => void;
  otherRelationship: string;
  setOtherRelationship: (rel: string) => void;
  gender: string;
  setGender: (gender: string) => void;
  errors: PatientFormErrors;
  setErrors: React.Dispatch<React.SetStateAction<PatientFormErrors>>;
  setMobileRef?: (ref: TextInput | null) => void;
  onOtherFocus?: () => void;
  onOtherLayout?: (y: number) => void;
}

export const PatientFormFields: React.FC<PatientFormFieldsProps> = ({
  name,
  setName,
  mobile,
  setMobile,
  dob,
  setDob,
  dobDate,
  setDobDate,
  showDatePicker,
  setShowDatePicker,
  relationship,
  setRelationship,
  otherRelationship,
  setOtherRelationship,
  gender,
  setGender,
  errors,
  setErrors,
  setMobileRef,
  onOtherFocus,
  onOtherLayout,
}) => {
  return (
    <View>
      {/* Full Name */}
      <View style={s.fieldWrap}>
        <View style={s.labelRow}>
          <Text style={s.label}>Name</Text>
          <RequiredMark />
        </View>
        <TextInput
          testID="add-patient-name-field"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) setErrors((e) => ({ ...e, name: undefined }));
          }}
          placeholder="Enter the name"
          placeholderTextColor="#919EAB80"
          style={s.input}
        />
        {errors.name ? <Text style={s.errorText}>{errors.name}</Text> : null}
      </View>

      {/* Mobile Number */}
      <View style={s.fieldWrap}>
        <View style={s.labelRow}>
          <Text style={s.label}>Mobile Number</Text>
          <RequiredMark />
        </View>
        <View testID="add-patient-mobile-field" style={s.phoneInputWrap}>
          <Text style={s.phonePrefix}>+91</Text>
          <View style={s.phoneDivider} />
          <TextInput
            ref={setMobileRef}
            value={mobile}
            onChangeText={(text) => {
              const cleaned = sanitize.phone(text);
              setMobile(cleaned);
              if (errors.mobile)
                setErrors((e) => ({ ...e, mobile: undefined }));
            }}
            placeholder="Enter Mobile Number"
            placeholderTextColor="#919EAB80"
            keyboardType="number-pad"
            style={s.phoneInput}
          />
        </View>
        {errors.mobile ? (
          <Text style={s.errorText}>{errors.mobile}</Text>
        ) : null}
      </View>

      {/* Date of Birth */}
      <View style={s.fieldWrap}>
        <View style={s.labelRow}>
          <Text style={s.label}>Date of Birth</Text>
          <RequiredMark />
        </View>
        <Touchable
          testID="add-patient-dob-field"
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
          style={s.datePickerBtn}
        >
          <Text style={dob ? s.dateText : s.datePlaceholder}>
            {dob ? formatDobDisplay(dob) : "DD-MM-YYYY"}
          </Text>
          <icons.calendar_month width={exactScale(18)} height={exactScale(18)} />
        </Touchable>
        {errors.dob ? <Text style={s.errorText}>{errors.dob}</Text> : null}
      </View>

      <DatePickerModal
        visible={showDatePicker}
        value={dobDate}
        minimumDate={getMinDob()}
        maximumDate={getMaxDob()}
        onClose={() => setShowDatePicker(false)}
        onChange={(date) => {
          setDobDate(date);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          setDob(`${yyyy}-${mm}-${dd}`);
          if (errors.dob) setErrors((e) => ({ ...e, dob: undefined }));
        }}
      />

      {/* Relationship */}
      <View style={s.fieldWrap}>
        <View style={s.labelRow}>
          <Text style={s.label}>Relationship</Text>
          <RequiredMark />
        </View>
        <View style={s.chipGrid}>
          {PATIENT_RELATIONSHIPS.map((rel) => {
            const isSelected = relationship === rel;
            return (
              <Touchable
                key={rel}
                onPress={() => {
                  setRelationship(rel);
                  if (rel !== "Other") setOtherRelationship("");
                  if (errors.relationship)
                    setErrors((e) => ({
                      ...e,
                      relationship: undefined,
                      otherRelationship: undefined,
                    }));
                }}
                style={[s.chip, isSelected ? s.chipSelected : null]}
              >
                <Text
                  style={[s.chipText, isSelected ? s.chipTextSelected : null]}
                >
                  {rel}
                </Text>
              </Touchable>
            );
          })}
        </View>
        {errors.relationship ? (
          <Text style={s.errorText}>{errors.relationship}</Text>
        ) : null}

        {relationship === "Other" && (
          <View
            style={s.otherInputWrap}
            onLayout={(e) => onOtherLayout?.(e.nativeEvent.layout.y)}
          >
            <TextInput
              testID="add-patient-other-relationship-field"
              value={otherRelationship}
              onChangeText={(text) => {
                setOtherRelationship(text);
                if (errors.otherRelationship)
                  setErrors((e) => ({
                    ...e,
                    otherRelationship: undefined,
                  }));
              }}
              onFocus={onOtherFocus}
              placeholder="Specify relationship (e.g. Grandfather, Cousin)"
              placeholderTextColor="#919EAB80"
              style={s.input}
            />
            {errors.otherRelationship ? (
              <Text style={s.errorText}>{errors.otherRelationship}</Text>
            ) : null}
          </View>
        )}
      </View>

      {/* Gender */}
      <View style={s.fieldWrap}>
        <View style={s.labelRow}>
          <Text style={s.label}>Gender</Text>
          <RequiredMark />
        </View>
        <View style={s.chipGrid}>
          {GENDER_OPTIONS_WITH_ICONS.map((g) => {
            const isSelected = gender === g.value;
            return (
              <Touchable
                key={g.value}
                onPress={() => {
                  setGender(g.value);
                  if (errors.gender)
                    setErrors((e) => ({ ...e, gender: undefined }));
                }}
                style={[
                  s.genderChip,
                  isSelected ? s.genderChipSelected : null,
                ]}
              >
                {g.icon}
                <Text
                  style={[s.chipText, isSelected ? s.chipTextSelected : null]}
                >
                  {g.label}
                </Text>
              </Touchable>
            );
          })}
        </View>
        {errors.gender ? (
          <Text style={s.errorText}>{errors.gender}</Text>
        ) : null}
      </View>
    </View>
  );
};
