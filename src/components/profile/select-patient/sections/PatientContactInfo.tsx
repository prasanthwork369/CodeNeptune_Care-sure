import { Touchable } from "@/src/components/ui/Touchable";
import { PatientContactInfoProps } from "@/src/types/patient";
import { sanitize, validate } from "@/src/utils/validation";
import React, { useState } from "react";
import { ActivityIndicator, Text, TextInput, View } from "react-native";
import { moderateScale } from "@/src/utils/exactScale";

const stripCountryCode = (raw: string) =>
  raw.startsWith("+91") ? raw.slice(3) : raw;

export const PatientContactInfo: React.FC<PatientContactInfoProps> = ({
  phone,
  isEditing,
  onEdit,
  onSave,
  saving,
}) => {
  const [localValue, setLocalValue] = useState(() => stripCountryCode(phone));
  const [error, setError] = useState("");

  const handleEdit = () => {
    setLocalValue(stripCountryCode(phone));
    setError("");
    onEdit();
  };

  const handleSave = () => {
    const result = validate.phone(localValue);
    if (!result.valid) {
      setError(result.message);
      return;
    }
    setError("");
    onSave(localValue);
  };

  const displayPhone = phone ? `+91 ${stripCountryCode(phone)}` : "";

  return (
    <View className="mb-4">
      <Text className="font-inter-semibold text-[#222222] mb-2" style={{ fontSize: moderateScale(13) }}>
        Doctor will reach you at
      </Text>
      <View
        className="flex-row items-center justify-between border border-[#919EAB33] rounded-md px-[14px] bg-white"
        style={{ minHeight: 52 }}
      >
        {isEditing ? (
          <View className="flex-1 flex-row items-center">
            <Text className="font-inter-semibold text-[#1A1C1E] mr-2" style={{ fontSize: moderateScale(14) }}>
              +91
            </Text>
            <View
              style={{
                width: 1,
                height: 20,
                backgroundColor: "#919EAB33",
                marginRight: 10,
              }}
            />
            <TextInput
              className="flex-1 font-inter-normal text-[#1A1C1E] py-3"
              style={{ fontSize: moderateScale(14) }}
              value={localValue}
              onChangeText={(text) => {
                setLocalValue(sanitize.phone(text));
                setError("");
              }}
              keyboardType="number-pad"
              maxLength={10}
              autoFocus
              cursorColor="#6A6A6A"
              placeholderTextColor="#919EAB"
              placeholder="10 digit number"
            />
          </View>
        ) : (
          <Text
            className="flex-1 py-3"
            style={{
              fontFamily: phone ? "Inter_600SemiBold" : "Inter_400Regular",
              color: phone ? "#1A1C1E" : "#919EAB",
              fontSize: moderateScale(14),
            }}
          >
            {displayPhone || "e.g. +91 98765 43210"}
          </Text>
        )}
        <Touchable
          onPress={() => (isEditing ? handleSave() : handleEdit())}
          disabled={saving}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#0F7635" />
          ) : (
            <Text className="font-inter-bold text-[#0F7635]" style={{ fontSize: moderateScale(13) }}>
              {isEditing ? "Done" : "Edit"}
            </Text>
          )}
        </Touchable>
      </View>
      {!!error && (
        <Text className="font-inter-medium text-[#EF4444] mt-1.5 px-1" style={{ fontSize: moderateScale(12) }}>
          {error}
        </Text>
      )}
    </View>
  );
};
