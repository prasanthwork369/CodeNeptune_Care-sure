/**
 * Mobile's Call-Us path dialled a number but created no record, so pharmacist
 * requests never reached the staff queue the website feeds via
 * POST /prescription-callback-requests.
 */
import { requestPharmacistCallback } from "@/src/features/prescription/services/prescriptionCallback.service";
import { prescriptionCallbackApi } from "@/src/features/prescription/api/prescription-callback.api";
import { useAuthStore } from "@/src/store/authStore";
import type { CustomerProfile } from "@/src/features/profile/types";

jest.mock(
  "@/src/features/prescription/api/prescription-callback.api",
  () => ({ prescriptionCallbackApi: { create: jest.fn() } }),
);

const createMock = prescriptionCallbackApi.create as jest.Mock;

const setUser = (user: Partial<CustomerProfile> | null) =>
  useAuthStore.setState({ user: user as CustomerProfile | null });

describe("requestPharmacistCallback", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    createMock.mockResolvedValue(undefined);
  });

  it("sends the customer's own details, like the website modal does", async () => {
    setUser({
      id: "cust-1",
      firstName: "Asha",
      lastName: "Rao",
      phoneNumber: "9876543210",
      email: "asha@example.com",
    });

    await expect(requestPharmacistCallback("note")).resolves.toBe(true);

    expect(createMock).toHaveBeenCalledWith({
      customerInfo: {
        id: "cust-1",
        name: "Asha Rao",
        phone: "9876543210",
        email: "asha@example.com",
      },
      notes: "note",
    });
  });

  // Server requires name >= 2 chars, so a nameless profile must not 400.
  it("falls back to a placeholder name when the profile has none", async () => {
    setUser({ id: "cust-2", phoneNumber: "9876543210" });

    await requestPharmacistCallback();

    expect(createMock.mock.calls[0][0].customerInfo.name).toBe("Customer");
  });

  it("sends null rather than an empty email", async () => {
    setUser({ id: "c", phoneNumber: "9876543210", email: "   " });

    await requestPharmacistCallback();

    expect(createMock.mock.calls[0][0].customerInfo.email).toBeNull();
  });

  // Server caps notes at 1000 chars.
  it("truncates notes to the server limit", async () => {
    setUser({ id: "c", phoneNumber: "9876543210" });

    await requestPharmacistCallback("x".repeat(1500));

    expect(createMock.mock.calls[0][0].notes).toHaveLength(1000);
  });

  it("skips the call when there is no usable phone to ring back", async () => {
    setUser({ id: "c", phoneNumber: "123" });

    await expect(requestPharmacistCallback()).resolves.toBe(false);
    expect(createMock).not.toHaveBeenCalled();
  });

  it("never throws when the request fails — checkout must continue", async () => {
    setUser({ id: "c", phoneNumber: "9876543210" });
    createMock.mockRejectedValueOnce(new Error("500"));

    await expect(requestPharmacistCallback()).resolves.toBe(false);
  });
});
