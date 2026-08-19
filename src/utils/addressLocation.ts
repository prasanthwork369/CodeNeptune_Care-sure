import type { Address } from "@/src/types/address";
import type { DeliveryLocation } from "@/src/features/home/types";

/** Location details to seed the location store */
export interface AddressLocation {
  location: DeliveryLocation;
  addressId: string;
  pincode?: string;
}

/** Maps a saved account address into a location store delivery location */
export const addressToLocation = (addr: Address): AddressLocation => {
  const fullAddress = [addr.line1, addr.line2, addr.city]
    .filter(Boolean)
    .join(", ");
  return {
    location: { label: addr.label, city: fullAddress, shortCity: addr.city },
    addressId: addr.id,
    pincode: addr.pincode || undefined,
  };
};

/** Picks the default saved address */
export const pickDefaultAddress = (addresses: Address[]): Address | undefined =>
  addresses.find((a) => a.isDefault) ?? addresses[0];

/** Resolves the active delivery address, prioritizing user pick, default flag, then first element. */
export const pickDeliveryAddress = (
  addresses: Address[],
  selectedAddressId: string | null,
): Address | undefined =>
  addresses.find((a) => a.id === selectedAddressId) ??
  pickDefaultAddress(addresses);
