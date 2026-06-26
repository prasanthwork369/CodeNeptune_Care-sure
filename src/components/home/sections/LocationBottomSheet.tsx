import { Address } from "@/src/api/address.api";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useSettings } from "@/src/hooks/queries/useSettings";
import { usePincode } from "@/src/hooks/mutations/usePincode";
import { useNav } from "@/src/hooks/useNav";
import { useLocationStore } from "@/src/store/locationStore";
import { useToastStore } from "@/src/store/toastStore";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import * as Location from "expo-location";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Text,
  View,
} from "react-native";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { exactScale, moderateScale } from "@/src/utils/exactScale";

interface LocationBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect?: (label: string, city: string) => void;
}

interface GooglePrediction {
  description: string;
  place_id: string;
  mainText: string;
  secondaryText: string;
}

const labelToIcon = (label: string) => {
  const l = label.toUpperCase();
  if (l === "HOME")
    return <icons.home_add width={exactScale(16)} height={exactScale(16)} fill="#0F7635" />;
  if (l === "WORK" || l === "OFFICE")
    return <icons.business width={exactScale(16)} height={exactScale(16)} fill="#0F7635" />;
  return <icons.location_pin width={exactScale(16)} height={exactScale(16)} fill="#0F7635" />;
};

export const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  isVisible,
  onClose,
  onSelect,
}) => {
  const router = useNav();
  const adjustedBottom = useAdjustedBottomInset();
  const { setLocation, selectedAddressId } = useLocationStore();
  const showToast = useToastStore((s) => s.show);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<GooglePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { addresses, loading: addressesLoading, refetch } = useAddress();
  const { checkServiceability, isChecking } = usePincode();
  const { data: settings } = useSettings();
  const mapsApiKey =
    settings?.mapsApiKey ?? process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? "";

  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["70%"], []);

  // Debounced Places Autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || !mapsApiKey) {
      setPredictions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchQuery)}&key=${mapsApiKey}&components=country:in&types=geocode|establishment`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.status === "OK") {
          setPredictions(
            (json.predictions ?? []).map((p: any) => ({
              description: p.description,
              place_id: p.place_id,
              mainText: p.structured_formatting?.main_text ?? p.description,
              secondaryText: p.structured_formatting?.secondary_text ?? "",
            })),
          );
        } else {
          setPredictions([]);
        }
      } catch {
        setPredictions([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, mapsApiKey]);

  const handleClose = () => {
    Keyboard.dismiss();
    bottomSheetRef.current?.dismiss();
    setSearchQuery("");
    setPredictions([]);
    setIsSearchFocused(false);
  };

  const handlePredictionSelect = async (prediction: GooglePrediction) => {
    if (!mapsApiKey) {
      showToast("Location search is not configured.", "error");
      return;
    }
    setIsSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&fields=address_components&key=${mapsApiKey}`;
      const res = await fetch(url);
      const json = await res.json();

      if (json.status !== "OK" || !json.result) {
        showToast("Could not fetch location details. Please try again.", "error");
        return;
      }

      const components: any[] = json.result.address_components ?? [];
      const get = (type: string) =>
        components.find((c: any) => c.types.includes(type))?.long_name ?? "";

      const streetNumber = get("street_number");
      const route = get("route");
      const sublocality = get("sublocality_level_1") || get("sublocality") || get("neighborhood");
      const city =
        get("locality") ||
        get("administrative_area_level_2") ||
        sublocality;
      const state = get("administrative_area_level_1");
      const pincode = get("postal_code").replace(/\D/g, "").slice(0, 6);

      if (!pincode || !/^\d{6}$/.test(pincode)) {
        showToast("Could not find a valid pincode for this location.", "warning");
        return;
      }

      const serviceability = await checkServiceability(pincode);
      if (!serviceability.serviceable) {
        showToast(`Sorry, we don't deliver to ${pincode} yet.`, "error");
        return;
      }

      const line2Parts = [
        prediction.description.split(",")[0],
        route,
        sublocality,
      ].filter(Boolean);
      const line2 = [...new Set(line2Parts)].join(", ");

      const params: Record<string, string> = {};
      if (streetNumber) params.prefill_line1 = streetNumber;
      if (line2) params.prefill_line2 = line2;
      if (city) params.prefill_city = city;
      if (state) params.prefill_state = state;
      if (pincode) params.prefill_pincode = pincode;

      handleClose();
      setTimeout(() => {
        router.push({ pathname: "/profile/addresses/add" as any, params });
      }, 500);
    } catch {
      showToast("Failed to get location details. Please try again.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddNewAddress = () => {
    handleClose();
    router.push({
      pathname: "/profile/addresses/add" as any,
      params: { from_location_sheet: "1" },
    });
  };

  const handleSelectAddress = async (addr: Address) => {
    if (!addr.pincode) {
      showToast("This address is missing a pincode.", "warning");
      return;
    }
    try {
      const result = await checkServiceability(addr.pincode);
      if (!result.serviceable) {
        showToast(`Sorry, we don't deliver to ${addr.pincode} yet.`, "error");
        return;
      }
    } catch {
      showToast("Could not verify serviceability. Please try again.", "error");
      return;
    }
    const cityLabel = addr.city || addr.line2 || addr.line1;
    setLocation(
      { label: addr.label, city: cityLabel },
      { addressId: addr.id, pincode: addr.pincode },
    );
    onSelect?.(addr.label, cityLabel);
    showToast(`Delivery location set to ${cityLabel} - ${addr.pincode}`, "success");
    handleClose();
  };

  const handleUseCurrentLocation = async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location permission needed",
          canAskAgain
            ? "We need your location to auto-fill your delivery address."
            : "Enable location access for Caresure in Settings to use this feature.",
          canAskAgain
            ? [{ text: "OK" }]
            : [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Open Settings",
                  onPress: () => Linking.openSettings(),
                },
              ],
        );
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const numberMatch = place?.name?.match(/^(\d+)/);
      const line1 = numberMatch ? numberMatch[1] : "";
      const buildingName = place?.name?.replace(/^\d+[,\s]*/, "").trim() || "";
      const line2 = [
        buildingName,
        place?.street,
        place?.district ?? place?.subregion,
      ]
        .filter(Boolean)
        .join(", ");
      const city = place?.city || place?.subregion || place?.region || "";
      const state = place?.region || "";
      const pincode = place?.postalCode
        ? place.postalCode.replace(/\D/g, "").slice(0, 6)
        : "";
      const params: Record<string, string> = {};
      if (line1) params.prefill_line1 = line1;
      if (line2) params.prefill_line2 = line2;
      if (city) params.prefill_city = city;
      if (state) params.prefill_state = state;
      if (pincode) params.prefill_pincode = pincode;
      handleClose();
      setTimeout(() => {
        router.push({ pathname: "/profile/addresses/add" as any, params });
      }, 500);
    } catch {
      Alert.alert(
        "Could not fetch location",
        "Please check that location services are enabled and try again.",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const showPredictions =
    predictions.length > 0 || (isSearching && !!searchQuery);

  return (
    <GorhomBottomSheet
      ref={bottomSheetRef}
      isVisible={isVisible}
      onClose={onClose}
      onPresent={refetch}
      snapPoints={snapPoints}
      closeButtonOffset="70%"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="none"
      style={{ zIndex: 999 }}
    >
      <View
        style={{ paddingHorizontal: exactScale(20), paddingTop: exactScale(10), paddingBottom: exactScale(10) }}
      >
        <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(16), marginBottom: exactScale(20) }}>
          Change Location
        </Text>

        {/* Search Box */}
        <View className="flex-row items-center" style={{ gap: exactScale(12), marginBottom: exactScale(16) }}>
          <View
            style={{
              flex: 1,
              shadowColor: "#919EAB0A",
              shadowOffset: { width: 0, height: exactScale(10) },
              shadowOpacity: 0.04,
              shadowRadius: exactScale(20),
              elevation: 2,
              borderWidth: 1.05,
              borderColor: "#919EAB33",
              borderRadius: exactScale(6),
              paddingHorizontal: exactScale(16),
              paddingVertical: exactScale(10),
            }}
            className="flex-row items-center bg-white"
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <icons.search_grey width={exactScale(18)} height={exactScale(18)} />
            )}
            <BottomSheetTextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="Search for area, street name"
              placeholderTextColor="#6A6A6A"
              className="flex-1 font-inter text-brand-text"
              style={{ marginLeft: exactScale(12), fontSize: moderateScale(14) }}
              onFocus={() => {
                setIsSearchFocused(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
            />
            {!!searchQuery && (
              <Touchable
                onPress={() => {
                  setSearchQuery("");
                  setPredictions([]);
                }}
                hitSlop={{ top: exactScale(8), bottom: exactScale(8), left: exactScale(8), right: exactScale(8) }}
              >
                <icons.close_dark width={exactScale(14)} height={exactScale(14)} fill="#222222" />
              </Touchable>
            )}
          </View>
        </View>

        {/* Current location + Add new — hidden while searching or focused */}
        {!searchQuery && !isSearchFocused && (
          <View className="flex-row" style={{ gap: exactScale(12), marginBottom: exactScale(8) }}>
            <Touchable
              onPress={handleUseCurrentLocation}
              disabled={isLocating}
              className="flex-1 flex-row items-center border border-[#919EAB33] bg-white"
              style={{ borderRadius: exactScale(16), paddingHorizontal: exactScale(14), paddingVertical: exactScale(16) }}
            >
              <View className="items-center justify-center" style={{ width: exactScale(40), height: exactScale(40), borderRadius: exactScale(20), backgroundColor: "#ECFDF5" }}>
                {isLocating ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <icons.my_location width={exactScale(21)} height={exactScale(21)} fill="#059669" />
                )}
              </View>
              <View style={{ marginLeft: exactScale(12) }}>
                <Text className="font-inter-semibold text-brand-text leading-tight" style={{ fontSize: moderateScale(15) }}>
                  {isLocating ? "Fetching" : "Use Current"}
                </Text>
                <Text className="font-inter-semibold text-brand-text leading-tight" style={{ fontSize: moderateScale(15) }}>
                  Location
                </Text>
              </View>
            </Touchable>
            <Touchable
              onPress={handleAddNewAddress}
              className="flex-1 flex-row items-center border border-[#919EAB33] bg-white"
              style={{ borderRadius: exactScale(16), paddingHorizontal: exactScale(14), paddingVertical: exactScale(16) }}
            >
              <View className="items-center justify-center" style={{ width: exactScale(40), height: exactScale(40), borderRadius: exactScale(20), backgroundColor: "#ECFDF5" }}>
                <icons.add_circle width={exactScale(21)} height={exactScale(21)} fill="#059669" />
              </View>
              <View style={{ marginLeft: exactScale(12) }}>
                <Text className="font-inter-semibold text-brand-text leading-tight" style={{ fontSize: moderateScale(15) }}>
                  Add New
                </Text>
                <Text className="font-inter-semibold text-brand-text leading-tight" style={{ fontSize: moderateScale(15) }}>
                  Addresses
                </Text>
              </View>
            </Touchable>
          </View>
        )}

        {!showPredictions && (
          <Text className="font-inter-bold text-brand-text" style={{ fontSize: moderateScale(15), marginBottom: exactScale(16) }}>
            Your Saved Addresses
          </Text>
        )}
      </View>

      <BottomSheetScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: exactScale(20),
          paddingBottom: Math.max(adjustedBottom, exactScale(24)),
        }}
      >
        {/* Predictions list */}
        {showPredictions ? (
          isSearching && predictions.length === 0 ? (
            <ActivityIndicator color="#0F7635" style={{ marginVertical: exactScale(24) }} />
          ) : (
            <View className="border border-[#919EAB33] bg-white" style={{ borderRadius: exactScale(8), paddingHorizontal: exactScale(16) }}>
              {predictions.map((p, index) => (
                <Touchable
                  key={p.place_id}
                  onPress={() => handlePredictionSelect(p)}
                  disabled={isSearching || isChecking}
                  activeOpacity={0.75}
                  style={
                    index < predictions.length - 1
                      ? {
                          borderBottomWidth: 1,
                          borderColor: "#E5E7EB",
                          borderStyle: "dashed",
                          paddingVertical: exactScale(16),
                        }
                      : { paddingVertical: exactScale(16) }
                  }
                  className="flex-row items-start"
                >
                  <View style={{ marginTop: exactScale(2), marginRight: exactScale(12) }}>
                    <icons.location_on width={exactScale(20)} height={exactScale(20)} fill="#1A1C1E" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-brand-text" style={{ fontSize: moderateScale(15), marginBottom: exactScale(4) }}>
                      {p.mainText}
                    </Text>
                    <Text
                      className="font-inter-regular text-brand-subtext"
                      style={{ fontSize: moderateScale(13), lineHeight: moderateScale(20) }}
                      numberOfLines={2}
                    >
                      {p.description}
                    </Text>
                  </View>
                </Touchable>
              ))}
            </View>
          )
        ) : /* Saved addresses */
        addressesLoading ? (
          <ActivityIndicator color="#0F7635" style={{ marginVertical: exactScale(24) }} />
        ) : addresses.length === 0 ? (
          <Text className="font-inter-medium text-brand-subtext text-center" style={{ fontSize: moderateScale(13), paddingVertical: exactScale(24) }}>
            No saved addresses yet
          </Text>
        ) : (
          addresses.map((addr) => {
            const fullAddress = [
              addr.line1,
              addr.line2,
              addr.city,
              addr.state,
              addr.pincode,
            ]
              .filter(Boolean)
              .join(", ");
            const isSelected = selectedAddressId === addr.id;
            return (
              <Touchable
                key={addr.id}
                activeOpacity={0.85}
                onPress={() => handleSelectAddress(addr)}
                style={{
                  borderWidth: 1,
                  borderColor: isSelected ? "#0F7635" : "#919EAB33",
                  backgroundColor: isSelected ? "#F2FFF7" : "#FFFFFF",
                  position: "relative",
                  borderRadius: exactScale(8),
                  padding: exactScale(20),
                  marginBottom: exactScale(16),
                }}
              >
                {isSelected && (
                  <View style={{ position: "absolute", top: exactScale(14), right: exactScale(14) }}>
                    <icons.check_circle width={exactScale(20)} height={exactScale(20)} fill="#0F7635" />
                  </View>
                )}
                <View className="flex-row items-center" style={{ marginBottom: exactScale(12) }}>
                  <View
                    className="items-center justify-center"
                    style={{
                      width: exactScale(32),
                      height: exactScale(32),
                      borderRadius: exactScale(16),
                      backgroundColor: isSelected ? "#DCFCE7" : "#F9FAFB",
                    }}
                  >
                    {labelToIcon(addr.label)}
                  </View>
                  <Text className="font-inter-semibold text-brand-text capitalize" style={{ marginLeft: exactScale(12), fontSize: moderateScale(14) }}>
                    {addr.label.charAt(0) + addr.label.slice(1).toLowerCase()}
                  </Text>
                  {addr.isDefault && (
                    <View className="bg-[#ECFDF5] rounded-full" style={{ marginLeft: exactScale(8), paddingHorizontal: exactScale(8), paddingVertical: exactScale(2) }}>
                      <Text className="font-inter-semibold text-[#0F7635]" style={{ fontSize: moderateScale(11) }}>
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="font-inter text-brand-subtext" style={{ fontSize: moderateScale(14), lineHeight: moderateScale(20) }}>
                  {fullAddress}
                </Text>
              </Touchable>
            );
          })
        )}
      </BottomSheetScrollView>
    </GorhomBottomSheet>
  );
};
