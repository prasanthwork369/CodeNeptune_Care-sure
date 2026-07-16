import type { Address } from "@/src/api/address.api";
import type { DeliveryLocation } from "@/src/types/home";

/** The args needed to seed the location store from a saved address. */
export interface AddressLocation {
    location: DeliveryLocation;
    addressId: string;
    pincode?: string;
}

/**
 * Maps a saved account address into the shape the location store expects.
 * `city` holds the full joined address for detailed display, `shortCity` the
 * plain city name — matching how the location sheet sets a delivery location.
 * Shared so the home onboarding fallback and the location sheet stay in sync.
 */
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

/** Picks the address to show by default: the one flagged default, else the first. */
export const pickDefaultAddress = (addresses: Address[]): Address | undefined =>
    addresses.find((a) => a.isDefault) ?? addresses[0];

/**
 * The single rule for which address the app delivers to: the user's explicit
 * pick when it still exists, otherwise the default, otherwise the first.
 *
 * Everything that shows or ships an address must resolve through this. The
 * header and checkout used to decide independently — the header read the
 * location store while checkout re-derived `isDefault` — so a picked address
 * could be displayed while the order shipped somewhere else.
 */
export const pickDeliveryAddress = (
    addresses: Address[],
    selectedAddressId: string | null,
): Address | undefined =>
    addresses.find((a) => a.id === selectedAddressId) ?? pickDefaultAddress(addresses);
