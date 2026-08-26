import { renderHook } from "@testing-library/react-native";
import { useProfileFormState } from "@/src/features/profile/hooks/useProfileFormState";
import { normalizeDob } from "@/src/features/profile/utils/profileForm.utils";
import type { CustomerProfile } from "@/src/features/profile/types";

describe("normalizeDob", () => {
  it("returns empty string for null, undefined, or empty values", () => {
    expect(normalizeDob(null)).toBe("");
    expect(normalizeDob(undefined)).toBe("");
    expect(normalizeDob("")).toBe("");
  });

  it("normalizes Date objects to YYYY-MM-DD", () => {
    const d = new Date(1995, 4, 12); // May 12, 1995
    expect(normalizeDob(d)).toBe("1995-05-12");
  });

  it("normalizes ISO date strings to YYYY-MM-DD", () => {
    expect(normalizeDob("1995-05-12T00:00:00.000Z")).toBe("1995-05-12");
  });
});

describe("useProfileFormState", () => {
  const baseProfile: CustomerProfile = {
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "+919876543210",
    gender: "MALE",
    dateOfBirth: "1995-05-12T00:00:00.000Z",
    isEmailVerified: true,
  };

  const defaultParams = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    gender: "MALE",
    dob: new Date("1995-05-12T00:00:00.000Z"),
    profile: baseProfile,
    updating: false,
    isOffline: false,
  };

  it("returns hasChanges: false and isSaveDisabled: true on initial baseline", () => {
    const { result } = renderHook(() => useProfileFormState(defaultParams));

    expect(result.current.hasChanges).toBe(false);
    expect(result.current.isFirstNameChanged).toBe(false);
    expect(result.current.isLastNameChanged).toBe(false);
    expect(result.current.isEmailChanged).toBe(false);
    expect(result.current.isGenderChanged).toBe(false);
    expect(result.current.isDobChanged).toBe(false);
    expect(result.current.isFormValid).toBe(true);
    expect(result.current.isSaveDisabled).toBe(true);
  });

  it("detects first name change and trim equality", () => {
    const { result, rerender } = renderHook(
      (props: typeof defaultParams) => useProfileFormState(props),
      { initialProps: { ...defaultParams, firstName: " Johnny " } },
    );

    expect(result.current.hasChanges).toBe(true);
    expect(result.current.isFirstNameChanged).toBe(true);
    expect(result.current.isSaveDisabled).toBe(false);

    // Restoring to original with spaces around it should still match trimmed baseline
    rerender({ ...defaultParams, firstName: " John " });
    expect(result.current.hasChanges).toBe(false);
    expect(result.current.isSaveDisabled).toBe(true);
  });

  it("detects last name change", () => {
    const { result } = renderHook(() =>
      useProfileFormState({ ...defaultParams, lastName: "Smith" }),
    );

    expect(result.current.hasChanges).toBe(true);
    expect(result.current.isLastNameChanged).toBe(true);
    expect(result.current.isSaveDisabled).toBe(false);
  });

  it("validates email format and disables save for invalid email", () => {
    const { result: validResult } = renderHook(() =>
      useProfileFormState({
        ...defaultParams,
        email: "new.valid@example.com",
      }),
    );
    expect(validResult.current.hasChanges).toBe(true);
    expect(validResult.current.isEmailValid).toBe(true);
    expect(validResult.current.isSaveDisabled).toBe(false);

    const { result: invalidResult } = renderHook(() =>
      useProfileFormState({
        ...defaultParams,
        email: "invalid-email",
      }),
    );
    expect(invalidResult.current.hasChanges).toBe(true);
    expect(invalidResult.current.isEmailValid).toBe(false);
    expect(invalidResult.current.isFormValid).toBe(false);
    expect(invalidResult.current.isSaveDisabled).toBe(true);
  });

  it("detects gender change", () => {
    const { result } = renderHook(() =>
      useProfileFormState({ ...defaultParams, gender: "FEMALE" }),
    );

    expect(result.current.hasChanges).toBe(true);
    expect(result.current.isGenderChanged).toBe(true);
    expect(result.current.isSaveDisabled).toBe(false);
  });

  it("detects DOB change and disables for future date", () => {
    const { result } = renderHook(() =>
      useProfileFormState({
        ...defaultParams,
        dob: new Date(1990, 0, 1),
      }),
    );
    expect(result.current.hasChanges).toBe(true);
    expect(result.current.isDobChanged).toBe(true);
    expect(result.current.isDobValid).toBe(true);
    expect(result.current.isSaveDisabled).toBe(false);

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const { result: futureResult } = renderHook(() =>
      useProfileFormState({
        ...defaultParams,
        dob: futureDate,
      }),
    );
    expect(futureResult.current.hasChanges).toBe(true);
    expect(futureResult.current.isDobValid).toBe(false);
    expect(futureResult.current.isSaveDisabled).toBe(true);
  });

  it("disables save when offline or updating", () => {
    const { result: offlineResult } = renderHook(() =>
      useProfileFormState({
        ...defaultParams,
        firstName: "Johnny",
        isOffline: true,
      }),
    );
    expect(offlineResult.current.hasChanges).toBe(true);
    expect(offlineResult.current.isSaveDisabled).toBe(true);

    const { result: updatingResult } = renderHook(() =>
      useProfileFormState({
        ...defaultParams,
        firstName: "Johnny",
        updating: true,
      }),
    );
    expect(updatingResult.current.hasChanges).toBe(true);
    expect(updatingResult.current.isSaveDisabled).toBe(true);
  });
});
