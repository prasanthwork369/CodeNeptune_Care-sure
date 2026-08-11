import { renderHook } from "@testing-library/react-native";
import { useDeliveryAddress } from "@/src/hooks/useDeliveryAddress";
import { useAddress } from "@/src/hooks/queries/useAddress";
import { useLocationStore } from "@/src/store/locationStore";

jest.mock("@/src/hooks/queries/useAddress", () => ({
  useAddress: jest.fn(),
}));

describe("useDeliveryAddress — Resolved Address & Checkout Location Sync", () => {
  const mockAddresses: any[] = [
    {
      id: "addr-1",
      label: "Home",
      isDefault: false,
      line1: "123 Street",
      line2: "",
      city: "Delhi",
      state: "Delhi",
      pincode: "110001",
    },
    {
      id: "addr-2",
      label: "Work",
      isDefault: true,
      line1: "456 Office Rd",
      line2: "",
      city: "Gurgaon",
      state: "Haryana",
      pincode: "122001",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useLocationStore.setState({
      selectedAddressId: null,
      location: null,
      pincode: null,
    });
  });

  it("selects default address when no user selection is recorded in location store", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: mockAddresses,
      loading: false,
    });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.address?.id).toBe("addr-2");
    expect(result.current.selectedId).toBe("addr-2");
    expect(result.current.displayLocation?.shortCity).toBe("Gurgaon");
  });

  it("prioritizes explicitly selected address over default address", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: mockAddresses,
      loading: false,
    });
    useLocationStore.setState({ selectedAddressId: "addr-1" });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.address?.id).toBe("addr-1");
    expect(result.current.selectedId).toBe("addr-1");
    expect(result.current.displayLocation?.shortCity).toBe("Delhi");
  });

  it("falls back to storeLocation when user has no saved addresses", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: [],
      loading: false,
    });
    useLocationStore.setState({
      location: { label: "GPS Location", city: "Bengaluru", pincode: "560001" },
    });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.address).toBeNull();
    expect(result.current.selectedId).toBeNull();
    expect(result.current.displayLocation?.city).toBe("Bengaluru");
  });
});

describe("useDeliveryAddress — hasSavedAddress", () => {
  const savedAddress = {
    id: "addr-1",
    label: "Home",
    isDefault: true,
    line1: "123 Street",
    city: "Delhi",
    state: "Delhi",
    pincode: "110001",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useLocationStore.setState({
      selectedAddressId: null,
      location: null,
      pincode: null,
    });
  });

  it("is true once the list comes back with an address", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: [savedAddress],
      loading: false,
      loaded: true,
    });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.hasSavedAddress).toBe(true);
  });

  it("is false once the list comes back empty", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: [],
      loading: false,
      loaded: true,
    });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.hasSavedAddress).toBe(false);
  });

  // The reported bug: React Query is not persisted, so on the first cart open
  // after launch the list was still loading and the banner said "Add Address"
  // over the address the persisted location store was already showing.
  it("stays true while loading when a saved address was previously picked", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: [],
      loading: true,
      loaded: false,
    });
    useLocationStore.setState({ selectedAddressId: "addr-1" });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.hasSavedAddress).toBe(true);
  });

  // A GPS or manual-pincode pick records no addressId, so a genuinely new user
  // still sees "Add Address" rather than a wrong "Change Address".
  it("is false while loading for a user who never picked a saved address", () => {
    (useAddress as jest.Mock).mockReturnValue({
      addresses: [],
      loading: true,
      loaded: false,
    });

    const { result } = renderHook(() => useDeliveryAddress());

    expect(result.current.hasSavedAddress).toBe(false);
  });
});
