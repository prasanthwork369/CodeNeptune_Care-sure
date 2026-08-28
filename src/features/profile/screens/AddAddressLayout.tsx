import { FormField } from "@/src/components/ui/FormField";
import { ScreenHeader } from "@/src/components/ui/ScreenHeader";
import { Touchable } from "@/src/components/ui/Touchable";
import { UnsavedChangesGuard } from "@/src/components/ui/UnsavedChangesGuard";
import { icons } from "@/src/constants/icons";
import { useAddress } from "@/src/features/profile/hooks/useAddress";
import { useIsOffline } from "@/src/hooks/ui/useIsOffline";
import { useNav } from "@/src/hooks/useNav";
import { applyDigitsOnlyFilter } from "@/src/modules/TextInputFilter";
import { useLocationStore } from "@/src/store/locationStore";
import { LABELS, LabelType } from "@/src/types/address";
import { addressToLocation } from "@/src/utils/addressLocation";
import { exactScale } from "@/src/utils/exactScale";
import { sanitize, validate } from "@/src/utils/validation";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles as s } from "./AddAddressLayout.styles";

export const AddAddressLayout: React.FC = () => {
  const router = useNav();
  const {
    id,
    from_location_sheet,
    prefill_line1,
    prefill_line2,
    prefill_city,
    prefill_state,
    prefill_pincode,
  } = useLocalSearchParams<{
    id?: string;
    from_location_sheet?: string;
    prefill_line1?: string;
    prefill_line2?: string;
    prefill_city?: string;
    prefill_state?: string;
    prefill_pincode?: string;
  }>();
  const isEdit = !!id;
  const setLocation = useLocationStore((st) => st.setLocation);
  const {
    addresses,
    addAddress,
    updateAddress,
    submitting,
    error: apiError,
  } = useAddress();
  const isFirstAddress = !isEdit && (addresses ?? []).length === 0;
  const isOffline = useIsOffline();
  const existing = addresses.find((a) => a.id === id);

  const scrollRef = useRef<ScrollView>(null);
  const fieldY = useRef<Record<string, number>>({});

  const mobileRef = useRef<TextInput | null>(null);
  const setMobileRef = (ref: TextInput | null) => {
    mobileRef.current = ref;
    if (ref) applyDigitsOnlyFilter(ref, 10);
  };
  const line1Ref = useRef<TextInput>(null);
  const line2Ref = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const pincodeRef = useRef<TextInput>(null);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState<LabelType | null>(null);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [saveCompleted, setSaveCompleted] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (e) => setKeyboardHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (isFirstAddress) setIsDefault(true);
  }, [isFirstAddress]);

  useEffect(() => {
    if (
      prefill_line1 ||
      prefill_line2 ||
      prefill_city ||
      prefill_state ||
      prefill_pincode
    ) {
      if (prefill_line1) setLine1(prefill_line1);
      if (prefill_line2) setLine2(prefill_line2);
      if (prefill_city) setCity(prefill_city);
      if (prefill_state) setState(prefill_state);
      if (prefill_pincode) {
        setPincode(prefill_pincode);
        const pr = validate.pincode(prefill_pincode);
        setPincodeError(pr.valid ? "" : pr.message);
      }
    }
  }, [
    prefill_line1,
    prefill_line2,
    prefill_city,
    prefill_state,
    prefill_pincode,
  ]);

  useEffect(() => {
    if (!existing) return;
    setAddressLabel((existing.label as LabelType) ?? "HOME");
    setName(existing.name ?? "");
    setMobile(existing.phone ?? "");
    setLine1(existing.line1 ?? "");
    setLine2(existing.line2 ?? "");
    setCity(existing.city ?? "");
    setState(existing.state ?? "");
    setPincode(existing.pincode ?? "");
    setIsDefault(existing.isDefault ?? false);
  }, [existing]);

  const scrollToField = (key: string) => {
    const y = fieldY.current[key];
    if (y != null)
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
  };

  const handleSave = async () => {
    setValidationError(null);
    const vError = validate.form([
      validate.required(name, "Name"),
      validate.required(line1, "House Number"),
      validate.required(city, "City"),
      validate.required(state, "State"),
      validate.pincode(pincode),
      validate.phone(mobile),
    ]);
    if (vError) {
      setValidationError(vError);
      return;
    }
    if (!addressLabel) {
      setValidationError("Please select an Address Type");
      return;
    }
    try {
      if (isEdit && id) {
        await updateAddress({
          id,
          label: addressLabel!,
          name: name.trim(),
          phone: mobile.trim(),
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          isDefault,
        });
      } else {
        const created = await addAddress({
          label: addressLabel!,
          name: name.trim(),
          phone: mobile.trim(),
          line1: line1.trim(),
          line2: line2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: "India",
          isDefault,
        });

        const cameFromLocationSheet = !!(
          from_location_sheet ||
          prefill_city ||
          prefill_state ||
          prefill_pincode
        );
        if (cameFromLocationSheet && created?.id) {
          const {
            location,
            addressId,
            pincode: addrPincode,
          } = addressToLocation(created);
          setLocation(location, { addressId, pincode: addrPincode });
        }
      }
      setSaveCompleted(true);
      requestAnimationFrame(() => router.back());
    } catch (err) {
      if (__DEV__) console.error("[Address Save Error]", err);
    }
  };

  const handleMobileChange = (text: string) => {
    if (mobile.length === 10 && text.startsWith(mobile)) return;
    const c = sanitize.phone(text);
    setMobile(c);
    if (c.length > 0) {
      const r = validate.phone(c);
      setMobileError(r.valid ? "" : r.message);
    } else setMobileError("");
  };

  const handlePincodeChange = (text: string) => {
    const c = sanitize.pincode(text);
    setPincode(c);
    if (c.length > 0) {
      const r = validate.pincode(c);
      setPincodeError(r.valid ? "" : r.message);
    } else setPincodeError("");
  };

  const isValid =
    !!addressLabel &&
    name.trim() &&
    validate.phone(mobile).valid &&
    line1.trim() &&
    city.trim() &&
    state.trim() &&
    validate.pincode(pincode).valid;

  const isDirty = existing
    ? addressLabel !== ((existing.label as LabelType) ?? "HOME") ||
      name.trim() !== (existing.name ?? "").trim() ||
      mobile.trim() !== (existing.phone ?? "").trim() ||
      line1.trim() !== (existing.line1 ?? "").trim() ||
      line2.trim() !== (existing.line2 ?? "").trim() ||
      city.trim() !== (existing.city ?? "").trim() ||
      state.trim() !== (existing.state ?? "").trim() ||
      pincode.trim() !== (existing.pincode ?? "").trim() ||
      isDefault !== (existing.isDefault ?? false)
    : !!(
        addressLabel ||
        name ||
        mobile ||
        line1 ||
        line2 ||
        city ||
        state ||
        pincode
      );

  const isButtonDisabled =
    submitting ||
    saveCompleted ||
    !isValid ||
    isOffline ||
    (isEdit && !isDirty);

  return (
    <View style={s.root}>
      <UnsavedChangesGuard
        hasUnsavedChanges={!saveCompleted && isDirty && (!isEdit || !!existing)}
      />
      <ScreenHeader title={isEdit ? "Edit Address" : "Add New Address"} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.keyboardAvoid}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          overScrollMode="auto"
          contentContainerStyle={[
            s.scrollContent,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + exactScale(2)
                  : exactScale(30),
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <FormField
            label="Full Name"
            required
            value={name}
            onChangeText={setName}
            placeholder="Enter Full Name"
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            returnKeyType="next"
            onSubmitEditing={() => {
              mobileRef.current?.focus();
              scrollToField("mobile");
            }}
            onLayout={(y) => {
              fieldY.current.name = y;
            }}
          />

          <FormField
            ref={setMobileRef}
            label="Mobile Number"
            required
            value={mobile}
            onChangeText={handleMobileChange}
            placeholder="Enter Mobile Number"
            keyboardType="number-pad"
            error={mobileError}
            autoComplete="off"
            textContentType="none"
            importantForAutofill="no"
            returnKeyType="next"
            onSubmitEditing={() => {
              line1Ref.current?.focus();
              scrollToField("line1");
            }}
            onFocus={() => scrollToField("mobile")}
            onLayout={(y) => {
              fieldY.current.mobile = y;
            }}
          />

          <FormField
            ref={line1Ref}
            label="House Number"
            required
            value={line1}
            onChangeText={setLine1}
            placeholder="Enter House Number"
            returnKeyType="next"
            onSubmitEditing={() => {
              line2Ref.current?.focus();
              scrollToField("line2");
            }}
            onFocus={() => scrollToField("line1")}
            onLayout={(y) => {
              fieldY.current.line1 = y;
            }}
          />

          <FormField
            ref={line2Ref}
            label="Building Name, Locality"
            value={line2}
            onChangeText={setLine2}
            placeholder="Enter Building Name"
            returnKeyType="next"
            onSubmitEditing={() => {
              cityRef.current?.focus();
              scrollToField("city");
            }}
            onFocus={() => scrollToField("line2")}
            onLayout={(y) => {
              fieldY.current.line2 = y;
            }}
          />

          <FormField
            ref={cityRef}
            label="City"
            required
            value={city}
            onChangeText={setCity}
            placeholder="Enter City"
            returnKeyType="next"
            onSubmitEditing={() => {
              stateRef.current?.focus();
              scrollToField("state");
            }}
            onFocus={() => scrollToField("city")}
            onLayout={(y) => {
              fieldY.current.city = y;
            }}
          />

          <FormField
            ref={stateRef}
            label="State"
            required
            value={state}
            onChangeText={setState}
            placeholder="Enter State"
            returnKeyType="next"
            onSubmitEditing={() => {
              pincodeRef.current?.focus();
              scrollToField("pincode");
            }}
            onFocus={() => scrollToField("state")}
            onLayout={(y) => {
              fieldY.current.state = y;
            }}
          />

          <FormField
            ref={pincodeRef}
            label="Pincode"
            required
            value={pincode}
            onChangeText={handlePincodeChange}
            placeholder="Enter Pincode"
            keyboardType="number-pad"
            maxLength={6}
            error={pincodeError}
            returnKeyType="done"
            onFocus={() => scrollToField("pincode")}
            onLayout={(y) => {
              fieldY.current.pincode = y;
            }}
          />

          <View style={s.sectionWrap}>
            <Text style={s.typeLabel}>Address Type</Text>
            <View style={s.typeRow}>
              {LABELS.map((l) => {
                const isActive = addressLabel === l;
                const iconColor = isActive ? "#FFFFFF" : "#6A6A6A";
                const icon =
                  l === "HOME" ? (
                    isActive ? (
                      <icons.home_add_light
                        width={exactScale(14)}
                        height={exactScale(14)}
                      />
                    ) : (
                      <icons.home_add
                        width={exactScale(14)}
                        height={exactScale(14)}
                        fill={iconColor}
                      />
                    )
                  ) : l === "WORK" ? (
                    isActive ? (
                      <icons.business_light
                        width={exactScale(14)}
                        height={exactScale(14)}
                      />
                    ) : (
                      <icons.business
                        width={exactScale(14)}
                        height={exactScale(14)}
                        fill={iconColor}
                      />
                    )
                  ) : isActive ? (
                    <icons.location_pin_light
                      width={exactScale(14)}
                      height={exactScale(14)}
                    />
                  ) : (
                    <icons.location_pin
                      width={exactScale(14)}
                      height={exactScale(14)}
                      fill={iconColor}
                    />
                  );
                return (
                  <Touchable
                    key={l}
                    onPress={() => setAddressLabel(l)}
                    activeOpacity={0.8}
                    throttleMs={0}
                    style={[
                      s.typeChip,
                      isActive ? s.typeChipActive : s.typeChipInactive,
                    ]}
                  >
                    {icon}
                    <Text
                      style={[
                        s.typeChipText,
                        isActive
                          ? s.typeChipTextActive
                          : s.typeChipTextInactive,
                      ]}
                    >
                      {l}
                    </Text>
                  </Touchable>
                );
              })}
            </View>
          </View>

          {!isFirstAddress && (
            <Touchable
              activeOpacity={0.8}
              onPress={() => setIsDefault(!isDefault)}
              style={s.defaultToggleRow}
            >
              <View
                style={[
                  s.toggleTrack,
                  isDefault ? s.toggleTrackActive : s.toggleTrackInactive,
                ]}
              >
                <View
                  style={[
                    s.toggleThumb,
                    {
                      transform: [
                        { translateX: isDefault ? exactScale(20) : 0 },
                      ],
                    },
                  ]}
                />
              </View>
              <Text style={s.defaultText}>Set as default address</Text>
            </Touchable>
          )}

          {validationError || apiError ? (
            <Text style={s.errorText}>{validationError || apiError}</Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView edges={["bottom"]} style={s.bottomArea}>
        <View style={s.bottomPadding}>
          <Touchable
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={isButtonDisabled}
            style={[
              s.submitBtn,
              isButtonDisabled ? s.submitBtnDisabled : s.submitBtnEnabled,
            ]}
          >
            {submitting || saveCompleted ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={s.submitBtnText}>
                {isEdit ? "Save Changes  →" : "Save Address →"}
              </Text>
            )}
          </Touchable>
        </View>
      </SafeAreaView>
    </View>
  );
};
