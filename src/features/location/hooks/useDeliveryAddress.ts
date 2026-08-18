import { useAddress } from "@/src/features/profile/hooks/useAddress";
import { useLocationStore } from "@/src/store/locationStore";
import type { DeliveryLocation } from "@/src/features/home/types";
import {
  addressToLocation,
  pickDeliveryAddress,
} from "@/src/utils/addressLocation";
import { useMemo } from "react";

/**
 * The one place that answers "which address are we delivering to?".
 *
 * The answer is derived, never stored: the store only records what the user
 * explicitly picked, and the fallback to the default (then the first) address
 * is computed here. That means the sheet always has exactly one address
 * highlighted even before anything seeds the store, and the header and
 * checkout cannot disagree, because they read the same resolved address.
 */
export function useDeliveryAddress() {
  const { addresses, loading, loaded } = useAddress();
  const selectedAddressId = useLocationStore((s) => s.selectedAddressId);
  const storeLocation = useLocationStore((s) => s.location);
  const storePincode = useLocationStore((s) => s.pincode);

  const address = useMemo(
    () => pickDeliveryAddress(addresses, selectedAddressId) ?? null,
    [addresses, selectedAddressId],
  );

  // What the header should show. A resolved address always wins so the header
  // names the address the order will actually ship to; the store location is
  // only a fallback for users who have no saved address yet (e.g. a GPS fix).
  const displayLocation: DeliveryLocation | null = useMemo(() => {
    if (address) {
      const { location, pincode } = addressToLocation(address);
      return { ...location, pincode };
    }
    return storeLocation
      ? { ...storeLocation, pincode: storePincode ?? storeLocation.pincode }
      : null;
  }, [address, storeLocation, storePincode]);

  // Until the list loads we cannot say the user has none, and a persisted pick
  // proves they do — labelling a real address "Add Address" was the bug.
  const hasSavedAddress = loaded
    ? addresses.length > 0
    : selectedAddressId !== null;

  return {
    /** The address checkout must ship to, and the sheet must highlight. */
    address,
    /** Drives Add vs Change wording, and never guesses "none" while loading. */
    hasSavedAddress,
    /** Always the resolved address's id, so exactly one card reads selected. */
    selectedId: address?.id ?? null,
    displayLocation,
    addresses,
    loading,
  };
}
