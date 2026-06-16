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
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface LocationBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect?: (label: string, city: string) => void;
}

interface GooglePrediction {
  description: string;
  place_id: string;
}

const labelToIcon = (label: string) => {
  const l = label.toUpperCase();
  if (l === "HOME")
    return <icons.home_add width={16} height={16} fill="#0F7635" />;
  if (l === "WORK" || l === "OFFICE")
    return <icons.business width={16} height={16} fill="#0F7635" />;
  return <icons.location_pin width={16} height={16} fill="#0F7635" />;
};

export const LocationBottomSheet: React.FC<LocationBottomSheetProps> = ({
  isVisible,
  onClose,
  onSelect,
}) => {
  const router = useNav();
  const insets = useSafeAreaInsets();
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
      keyboardBlurBehavior="restore"
      style={{ zIndex: 999 }}
    >
      <View
        style={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 }}
      >
        <Text className="text-[16px] font-inter-bold text-brand-text mb-5">
          Change Location
        </Text>

        {/* Search Box + Cancel */}
        <View className="flex-row items-center gap-x-3 mb-4">
          <View
            style={{
              flex: 1,
              shadowColor: "#919EAB0A",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.04,
              shadowRadius: 20,
              elevation: 2,
              borderWidth: 1.05,
              borderColor: "#919EAB33",
            }}
            className="flex-row items-center bg-white rounded-lg px-4 py-2.5"
          >
            {isSearching ? (
              <ActivityIndicator size="small" color="#0F7635" />
            ) : (
              <icons.search width={18} height={18} />
            )}
            <BottomSheetTextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="words"
              autoCorrect={false}
              placeholder="Search for area, street name"
              placeholderTextColor="#6A6A6A"
              className="flex-1 ml-3 text-[14px] font-inter text-brand-text"
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
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <icons.close_small width={16} height={16} fill="#919EAB" />
              </Touchable>
            )}
          </View>
          {(!!searchQuery || isSearchFocused) && (
            <Touchable
              onPress={() => {
                setSearchQuery("");
                setPredictions([]);
                setIsSearchFocused(false);
                Keyboard.dismiss();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-[13px] font-inter-semibold text-brand-primary">
                Cancel
              </Text>
            </Touchable>
          )}
        </View>

        {/* Current location + Add new — hidden while searching or focused */}
        {!searchQuery && !isSearchFocused && (
          <View className="flex-row gap-x-3 mb-2">
            <Touchable
              onPress={handleUseCurrentLocation}
              disabled={isLocating}
              className="flex-1 flex-row items-center border border-[#919EAB33] rounded-[16px] px-3.5 py-4 bg-white"
            >
              <View className="w-10 h-10 rounded-full bg-[#ECFDF5] items-center justify-center">
                {isLocating ? (
                  <ActivityIndicator size="small" color="#059669" />
                ) : (
                  <icons.my_location width={21} height={21} fill="#059669" />
                )}
              </View>
              <View className="ml-3">
                <Text className="text-[15px] font-inter-semibold text-brand-text leading-tight">
                  {isLocating ? "Fetching" : "Use Current"}
                </Text>
                <Text className="text-[15px] font-inter-semibold text-brand-text leading-tight">
                  Location
                </Text>
              </View>
            </Touchable>
            <Touchable
              onPress={handleAddNewAddress}
              className="flex-1 flex-row items-center border border-[#919EAB33] rounded-[16px] px-3.5 py-4 bg-white"
            >
              <View className="w-10 h-10 rounded-full bg-[#ECFDF5] items-center justify-center">
                <icons.add_circle width={21} height={21} fill="#059669" />
              </View>
              <View className="ml-3">
                <Text className="text-[15px] font-inter-semibold text-brand-text leading-tight">
                  Add New
                </Text>
                <Text className="text-[15px] font-inter-semibold text-brand-text leading-tight">
                  Addresses
                </Text>
              </View>
            </Touchable>
          </View>
        )}

        {!showPredictions && (
          <Text className="text-[15px] font-inter-bold text-brand-text mb-4">
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
          paddingHorizontal: 20,
          paddingBottom: Math.max(insets.bottom, 24),
        }}
      >
        {/* Predictions list */}
        {showPredictions ? (
          isSearching && predictions.length === 0 ? (
            <ActivityIndicator color="#0F7635" style={{ marginVertical: 24 }} />
          ) : (
            predictions.map((p) => (
              <Touchable
                key={p.place_id}
                onPress={() => handlePredictionSelect(p)}
                disabled={isSearching || isChecking}
                activeOpacity={0.75}
                className="flex-row items-start py-3 border-b border-[#F3F4F6]"
              >
                <View className="mt-0.5 mr-3">
                  <icons.location_pin width={16} height={16} fill="#6B7280" />
                </View>
                <Text
                  className="flex-1 text-[13px] font-inter-medium text-brand-text leading-5"
                  numberOfLines={2}
                >
                  {p.description}
                </Text>
              </Touchable>
            ))
          )
        ) : /* Saved addresses */
        addressesLoading ? (
          <ActivityIndicator color="#0F7635" style={{ marginVertical: 24 }} />
        ) : addresses.length === 0 ? (
          <Text className="text-[13px] font-inter-medium text-brand-subtext text-center py-6">
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
                }}
                className="rounded-lg p-5 mb-4"
              >
                {isSelected && (
                  <View style={{ position: "absolute", top: 14, right: 14 }}>
                    <icons.check_circle width={20} height={20} fill="#0F7635" />
                  </View>
                )}
                <View className="flex-row items-center mb-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor: isSelected ? "#DCFCE7" : "#F9FAFB",
                    }}
                  >
                    {labelToIcon(addr.label)}
                  </View>
                  <Text className="ml-3 text-[14px] font-inter-semibold text-brand-text capitalize">
                    {addr.label.charAt(0) + addr.label.slice(1).toLowerCase()}
                  </Text>
                  {addr.isDefault && (
                    <View className="ml-2 bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                      <Text className="text-[11px] font-inter-semibold text-[#0F7635]">
                        Default
                      </Text>
                    </View>
                  )}
                </View>
                <Text className="text-[14px] font-inter text-brand-subtext leading-[20px]">
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
