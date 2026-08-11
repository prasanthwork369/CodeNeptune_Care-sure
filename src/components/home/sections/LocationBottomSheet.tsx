import { Address } from "@/src/api/address.api";
import { locationApi } from "@/src/api/location.api";
import { BottomSheetTextInput } from "@/src/components/ui/BottomSheetTextInput";
import { GorhomBottomSheet } from "@/src/components/ui/GorhomBottomSheet";
import { Touchable } from "@/src/components/ui/Touchable";
import { icons } from "@/src/constants/icons";
import { typography } from "@/src/constants/typography";
import { usePincode } from "@/src/hooks/mutations/usePincode";
import { useAddress } from "@/src/hooks/queries/useAddress";
import {
  LocationSuggestion,
  useLocationSearch,
} from "@/src/hooks/queries/useLocationSearch";
import { useAdjustedBottomInset } from "@/src/hooks/ui/useBottomInset";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { useNav } from "@/src/hooks/useNav";
import { locationService } from "@/src/services/location.service";
import { useLocationStore } from "@/src/store/locationStore";
import { useToastStore } from "@/src/store/toastStore";
import { addressToLocation } from "@/src/utils/addressLocation";
import { exactScale, moderateScale } from "@/src/utils/exactScale";
import { toPrefillParams } from "@/src/utils/locationPrefill";
import { reportActionError, requireInternet } from "@/src/utils/offline";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Platform,
  Text,
  View,
} from "react-native";

interface LocationBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect?: (label: string, city: string, address?: Address) => void;
  title?: string;
}

const labelToIcon = (label: string) => {
  const l = label.toUpperCase();
  if (l === "HOME")
    return (
      <icons.home_add
        width={exactScale(16)}
        height={exactScale(16)}
        fill="#0F7635"
      />
    );
  if (l === "WORK" || l === "OFFICE")
    return (
      <icons.business
        width={exactScale(16)}
        height={exactScale(16)}
        fill="#0F7635"
      />
    );
  return (
    <icons.location_pin
      width={exactScale(16)}
      height={exactScale(16)}
      fill="#0F7635"
    />
  );
};

// Memoised: always mounted under the Home feed, which re-renders often.
export const LocationBottomSheet: React.FC<LocationBottomSheetProps> =
  React.memo(({ isVisible, onClose, onSelect, title }) => {
    const router = useNav();
    const adjustedBottom = useAdjustedBottomInset();
    const setLocation = useLocationStore((s) => s.setLocation);
    // Derived, not read straight from the store: this falls back to the default
    // (then the first) address, so exactly one card is always checked — and it
    // is the same address checkout will ship to.
    const { selectedId, hasSavedAddress } = useDeliveryAddress();
    const showToast = useToastStore((s) => s.show);
    const [isLocating, setIsLocating] = useState(false);
    const [inputValue, setInputValue] = useState("");
    // Resolving a tapped suggestion — separate from the search spinner.
    const [isResolving, setIsResolving] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const {
      addresses,
      loading: addressesLoading,
      refetch,
    } = useAddress();
    const { checkServiceability } = usePincode();
    const { predictions, isSearching } = useLocationSearch(inputValue);

    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const inputRef = useRef<React.ComponentRef<
      typeof BottomSheetTextInput
    > | null>(null);
    const snapPoints = useMemo(() => ["70%"], []);

    const handleClose = () => {
      Keyboard.dismiss();
      bottomSheetRef.current?.dismiss();
      inputRef.current?.clear();
      setInputValue("");
      setIsSearchFocused(false);
    };

    // The sheet has to dismiss before navigating, or the push lands under it.
    const goToAddAddress = (params: Record<string, string>) => {
      handleClose();
      setTimeout(() => {
        router.push({ pathname: "/profile/addresses/add", params });
      }, 500);
    };

    const handlePredictionSelect = async (prediction: LocationSuggestion) => {
      // Gate before the spinner: an offline tap must look inert, not busy.
      if (!requireInternet()) return;
      setIsResolving(true);
      try {
        const resolved = await locationApi.resolvePlace(prediction.placeId);

        if (!resolved.pincode || !/^\d{6}$/.test(resolved.pincode)) {
          showToast(
            "Could not find a valid pincode for this location.",
            "warning",
          );
          return;
        }
        if (!resolved.serviceable) {
          showToast(
            `Sorry, we don't deliver to ${resolved.pincode} yet.`,
            "error",
          );
          return;
        }

        goToAddAddress(toPrefillParams(resolved, prediction.mainText));
      } catch (err) {
        // Connection failures go to the banner; everything else gets this toast.
        reportActionError(err, {
          message: "Failed to get location details. Please try again.",
        });
      } finally {
        setIsResolving(false);
      }
    };

    const handleAddNewAddress = () => {
      handleClose();
      router.push({
        pathname: "/profile/addresses/add",
        params: { from_location_sheet: "1" },
      });
    };

    // Opens the system LOCATION toggle page (GPS on/off). Use this when the
    // device's location services are disabled.
    const openLocationSettings = async () => {
      try {
        if (Platform.OS === "android" && Linking.sendIntent) {
          // Open the Android Location source settings directly.
          try {
            await Linking.sendIntent(
              "android.settings.LOCATION_SOURCE_SETTINGS",
            );
            return;
          } catch {}
        }
      } catch {}
      // Fallback to opening app settings.
      try {
        await Linking.openSettings();
      } catch {}
    };

    // Opens THIS app's settings page (App info → Permissions → Location). Use
    // this when the app's own location permission was denied — the user needs
    // the permission page, not the device GPS toggle. `Linking.openSettings()`
    // maps to ACTION_APPLICATION_DETAILS_SETTINGS on Android and the app's
    // settings pane on iOS.
    const openAppSettings = async () => {
      try {
        await Linking.openSettings();
      } catch {}
    };

    const handleSelectAddress = async (addr: Address) => {
      if (!addr.pincode) {
        showToast("This address is missing a pincode.", "warning");
        return;
      }
      // Serviceability is a server call, so the address cannot be selected offline.
      if (!requireInternet()) return;
      try {
        const result = await checkServiceability(addr.pincode);
        if (!result.serviceable) {
          showToast(`Sorry, we don't deliver to ${addr.pincode} yet.`, "error");
          return;
        }
      } catch (err) {
        reportActionError(err, {
          message: "Could not verify serviceability. Please try again.",
        });
        return;
      }
      const { location, addressId, pincode } = addressToLocation(addr);
      setLocation(location, { addressId, pincode });
      onSelect?.(addr.label, location.city, addr);
      showToast(
        `Delivery location set to ${addr.city} - ${addr.pincode}`,
        "success",
      );
      handleClose();
    };

    const handleUseCurrentLocation = async () => {
      if (isLocating) return;
      // GPS itself works offline but resolveCoords does not, so gate before the
      // spinner — otherwise it fetches coords for seconds only to fail at the end.
      if (!requireInternet()) return;
      setIsLocating(true);
      try {
        // This is a user-initiated action so allow the OS dialog to appear.
        const { granted, canAskAgain } =
          await locationService.requestPermission({
            interactive: true,
          });
        if (!granted) {
          if (!canAskAgain) {
            // Permission is permanently denied at the app level (this is the
            // app's location permission, NOT device GPS). Explain that before
            // sending the user to Settings so it doesn't feel like a random
            // redirect when GPS itself is already on.
            Alert.alert(
              "Location permission is off",
              "Location access for CareSure is turned off. Open Settings to allow it and auto-detect your address.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  // App permission issue → app's permission page, not GPS toggle.
                  text: "Open Settings",
                  onPress: () => openAppSettings(),
                },
              ],
            );
            return;
          }
          Alert.alert(
            "Location access needed",
            "Allow location access while you use the app to auto-fill your delivery address.",
            [{ text: "OK" }],
          );
          return;
        }
        const { coords, error } = await locationService.getCurrentCoords();
        if (!coords) {
          // If the underlying failure indicates services are disabled,
          // show the Enable GPS alert. Otherwise show a generic failure.
          if (error?.code === "SERVICES_DISABLED") {
            Alert.alert(
              "Location services are off",
              "Please enable location services (GPS) to auto-detect your address.",
              [
                { text: "Cancel", style: "cancel" },
                { text: "Enable GPS", onPress: () => openLocationSettings() },
              ],
            );
            return;
          }
          Alert.alert(
            "Could not fetch location",
            error?.message ||
              "Please check that location services are enabled and try again.",
          );
          return;
        }

        // The backend turns raw coordinates into a pincode and tells us whether
        // we deliver there, so the address form never opens on a dead pincode.
        const resolved = await locationApi.resolveCoords(
          coords.latitude,
          coords.longitude,
        );
        if (!resolved.pincode) {
          showToast(
            "Could not find a valid pincode for your location.",
            "warning",
          );
          return;
        }
        if (!resolved.serviceable) {
          showToast(
            `Sorry, we don't deliver to ${resolved.pincode} yet.`,
            "error",
          );
          return;
        }

        const city = resolved.area?.city ?? "";
        // Persist last-known location for fast startup and header rendering.
        try {
          await AsyncStorage.setItem(
            "@caresure:last_known_location",
            JSON.stringify({
              location: {
                label: city,
                city,
                shortCity: city,
                pincode: resolved.pincode,
              },
              coords,
              pincode: resolved.pincode,
            }),
          );
          try {
            await AsyncStorage.removeItem("@caresure:gps_prompt_not_now");
          } catch {}
        } catch {}

        goToAddAddress(toPrefillParams(resolved));
      } catch (err) {
        // GPS problems are already handled above, so anything landing here is the
        // resolveCoords call — never blame location services for a network failure.
        reportActionError(err, {
          message: "Could not fetch location. Please try again.",
        });
      } finally {
        setIsLocating(false);
      }
    };

    const showPredictions =
      predictions.length > 0 || (isSearching && !!inputValue);

    return (
      <GorhomBottomSheet
        ref={bottomSheetRef}
        isVisible={isVisible}
        onClose={onClose}
        onPresent={refetch}
        snapPoints={snapPoints}
        closeButtonOffset="70%"
        // iOS "interactive" translates the sheet up by the keyboard height, past the snap point.
        keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
        keyboardBlurBehavior="none"
        style={{ zIndex: 999 }}
      >
        <View
          style={{
            paddingHorizontal: exactScale(20),
            paddingTop: exactScale(10),
            paddingBottom: exactScale(10),
          }}
        >
          <Text
            className="font-inter-bold text-brand-text"
            style={{
              fontSize: moderateScale(16),
              marginBottom: exactScale(20),
            }}
          >
            {title ?? (hasSavedAddress ? "Change Address" : "Add Address")}
          </Text>

          {/* Search Box */}
          <View
            className="flex-row items-center"
            style={{ gap: exactScale(12), marginBottom: exactScale(16) }}
          >
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
                // iOS text fields have no intrinsic height, so the row needs its own.
                minHeight: exactScale(48),
              }}
              className="flex-row items-center bg-white"
            >
              {isSearching || isResolving ? (
                <ActivityIndicator size="small" color="#0F7635" />
              ) : (
                <icons.search_grey
                  width={exactScale(18)}
                  height={exactScale(18)}
                />
              )}
              <BottomSheetTextInput
                ref={inputRef}
                defaultValue=""
                onChangeText={setInputValue}
                returnKeyType="search"
                autoCapitalize="words"
                autoCorrect={false}
                placeholder="Search for area, street name"
                placeholderTextColor="#6A6A6A"
                className="flex-1 font-inter text-brand-text"
                style={{
                  marginLeft: exactScale(12),
                  fontSize: moderateScale(14),
                  // iOS has no intrinsic height; fixing it keeps both platforms identical.
                  height: exactScale(32),
                  paddingVertical: 0,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                }}
                onFocus={() => {
                  setIsSearchFocused(true);
                }}
                onBlur={() => setIsSearchFocused(false)}
              />
              {!!inputValue && (
                <Touchable
                  onPress={() => {
                    inputRef.current?.clear();
                    setInputValue("");
                  }}
                  hitSlop={{
                    top: exactScale(8),
                    bottom: exactScale(8),
                    left: exactScale(8),
                    right: exactScale(8),
                  }}
                >
                  <icons.close_dark
                    width={exactScale(14)}
                    height={exactScale(14)}
                    fill="#222222"
                  />
                </Touchable>
              )}
            </View>
          </View>

          {/* Current location + Add new — hidden while searching or focused */}
          {!inputValue && !isSearchFocused && (
            <View
              className="flex-row"
              style={{ gap: exactScale(12), marginBottom: exactScale(8) }}
            >
              <Touchable
                onPress={handleUseCurrentLocation}
                disabled={isLocating}
                className="flex-1 flex-row items-center border border-[#919EAB33] bg-white"
                style={{
                  borderRadius: exactScale(16),
                  paddingHorizontal: exactScale(14),
                  paddingVertical: exactScale(16),
                }}
              >
                <View
                  className="items-center justify-center"
                  style={{
                    width: exactScale(40),
                    height: exactScale(40),
                    borderRadius: exactScale(20),
                    backgroundColor: "#ECFDF5",
                  }}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color="#059669" />
                  ) : (
                    <icons.my_location
                      width={exactScale(21)}
                      height={exactScale(21)}
                      fill="#059669"
                    />
                  )}
                </View>
                <View style={{ marginLeft: exactScale(12) }}>
                  <Text
                    className="font-inter-semibold text-brand-text leading-tight"
                    style={{ fontSize: moderateScale(15) }}
                  >
                    {isLocating ? "Fetching" : "Use Current"}
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-text leading-tight"
                    style={{ fontSize: moderateScale(15) }}
                  >
                    Location
                  </Text>
                </View>
              </Touchable>
              <Touchable
                onPress={handleAddNewAddress}
                className="flex-1 flex-row items-center border border-[#919EAB33] bg-white"
                style={{
                  borderRadius: exactScale(16),
                  paddingHorizontal: exactScale(14),
                  paddingVertical: exactScale(16),
                }}
              >
                <View
                  className="items-center justify-center"
                  style={{
                    width: exactScale(40),
                    height: exactScale(40),
                    borderRadius: exactScale(20),
                    backgroundColor: "#ECFDF5",
                  }}
                >
                  <icons.add_circle
                    width={exactScale(21)}
                    height={exactScale(21)}
                    fill="#059669"
                  />
                </View>
                <View style={{ marginLeft: exactScale(12) }}>
                  <Text
                    className="font-inter-semibold text-brand-text leading-tight"
                    style={{ fontSize: moderateScale(15) }}
                  >
                    Add New
                  </Text>
                  <Text
                    className="font-inter-semibold text-brand-text leading-tight"
                    style={{ fontSize: moderateScale(15) }}
                  >
                    Addresses
                  </Text>
                </View>
              </Touchable>
            </View>
          )}

          {!showPredictions && (
            <Text
              className="font-inter-bold text-brand-text"
              style={{
                fontSize: moderateScale(15),
                marginBottom: exactScale(16),
              }}
            >
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
              <ActivityIndicator
                color="#0F7635"
                style={{ marginVertical: exactScale(24) }}
              />
            ) : (
              <View
                className="border border-[#919EAB33] bg-white"
                style={{
                  borderRadius: exactScale(8),
                  paddingHorizontal: exactScale(16),
                }}
              >
                {predictions.map((p, index) => (
                  <Touchable
                    key={p.placeId}
                    onPress={() => handlePredictionSelect(p)}
                    disabled={isResolving}
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
                    <View
                      style={{
                        marginTop: exactScale(2),
                        marginRight: exactScale(12),
                      }}
                    >
                      <icons.location_on
                        width={exactScale(20)}
                        height={exactScale(20)}
                        fill="#1A1C1E"
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="font-inter-semibold text-brand-text"
                        style={{
                          fontSize: moderateScale(15),
                          marginBottom: exactScale(4),
                        }}
                      >
                        {p.mainText}
                      </Text>
                      <Text
                        className="font-inter-regular text-brand-subtext"
                        style={{
                          fontSize: moderateScale(13),
                          lineHeight: moderateScale(20),
                        }}
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
            <ActivityIndicator
              color="#0F7635"
              style={{ marginVertical: exactScale(24) }}
            />
          ) : addresses.length === 0 ? (
            <Text
              className="font-inter-medium text-brand-subtext text-center"
              style={{
                fontSize: moderateScale(13),
                paddingVertical: exactScale(24),
              }}
            >
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
              const isSelected = selectedId === addr.id;
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
                    <View
                      style={{
                        position: "absolute",
                        top: exactScale(14),
                        right: exactScale(14),
                      }}
                    >
                      <icons.check_circle
                        width={exactScale(20)}
                        height={exactScale(20)}
                        fill="#0F7635"
                      />
                    </View>
                  )}
                  <View
                    className="flex-row items-center"
                    style={{ marginBottom: exactScale(12) }}
                  >
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
                    <Text
                      className="font-inter-semibold text-brand-text capitalize"
                      style={{
                        marginLeft: exactScale(12),
                        fontSize: moderateScale(14),
                      }}
                    >
                      {addr.label.charAt(0) + addr.label.slice(1).toLowerCase()}
                    </Text>
                    {addr.isDefault && (
                      <View
                        className="bg-[#ECFDF5] rounded-full"
                        style={{
                          marginLeft: exactScale(8),
                          paddingHorizontal: exactScale(8),
                          paddingVertical: exactScale(2),
                        }}
                      >
                        <Text
                          className="font-inter-semibold text-[#0F7635]"
                          style={{ fontSize: moderateScale(11) }}
                        >
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    className="font-inter text-brand-subtext"
                    style={{
                      fontSize: typography.body.fontSize,
                      lineHeight: typography.body.lineHeight,
                    }}
                  >
                    {fullAddress}
                  </Text>
                </Touchable>
              );
            })
          )}
        </BottomSheetScrollView>
      </GorhomBottomSheet>
    );
  });
LocationBottomSheet.displayName = "LocationBottomSheet";
