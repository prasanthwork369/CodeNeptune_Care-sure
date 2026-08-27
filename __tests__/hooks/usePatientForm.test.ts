import { act, renderHook } from "@testing-library/react-native";
import { usePatientForm } from "@/src/features/profile/hooks/usePatientForm";
import type { FamilyMember } from "@/src/features/profile/types";

const editPatient: FamilyMember = {
  id: "member-1",
  name: "Jane Smith",
  phone: "+919876543210",
  dateOfBirth: "1990-05-15",
  relationship: "Wife",
  gender: "FEMALE",
} as FamilyMember;

describe("usePatientForm", () => {
  describe("add mode", () => {
    it("starts with empty fields and an invalid, non-dirty form", () => {
      const { result } = renderHook(() => usePatientForm(null));

      expect(result.current.name).toBe("");
      expect(result.current.mobile).toBe("");
      expect(result.current.isFormValid).toBe(false);
    });

    it("becomes valid once all required fields are filled", () => {
      const { result } = renderHook(() => usePatientForm(null));

      act(() => {
        result.current.setName("New Patient");
        result.current.setMobile("9998887776");
        result.current.setDob("2000-01-01");
        result.current.setRelationship("Self");
        result.current.setGender("MALE");
      });

      expect(result.current.isFormValid).toBe(true);
    });

    it("requires the specify-relationship text when 'Other' is selected", () => {
      const { result } = renderHook(() => usePatientForm(null));

      act(() => {
        result.current.setName("New Patient");
        result.current.setMobile("9998887776");
        result.current.setDob("2000-01-01");
        result.current.setRelationship("Other");
        result.current.setGender("MALE");
      });
      expect(result.current.isFormValid).toBe(false);

      act(() => {
        result.current.setOtherRelationship("Cousin");
      });
      expect(result.current.isFormValid).toBe(true);
    });

    it("validate() reports the missing-field errors and buildPayload() strips whitespace", () => {
      const { result } = renderHook(() => usePatientForm(null));

      act(() => {
        expect(result.current.validate()).toBe(false);
      });
      expect(result.current.errors.name).toBeTruthy();
      expect(result.current.errors.mobile).toBeTruthy();
      expect(result.current.errors.relationship).toBeTruthy();
      expect(result.current.errors.gender).toBeTruthy();

      act(() => {
        result.current.setName("  New Patient  ");
        result.current.setMobile("9998887776");
        result.current.setDob("2000-01-01");
        result.current.setRelationship("Self");
        result.current.setGender("MALE");
      });

      expect(result.current.buildPayload()).toEqual({
        name: "New Patient",
        relationship: "Self",
        dateOfBirth: "2000-01-01",
        gender: "MALE",
        phone: "+919998887776",
      });
    });
  });

  describe("edit mode", () => {
    it("hydrates fields from the patient being edited", () => {
      const { result } = renderHook(() => usePatientForm(editPatient));

      expect(result.current.name).toBe("Jane Smith");
      expect(result.current.mobile).toBe("9876543210");
      expect(result.current.dob).toBe("1990-05-15");
      expect(result.current.relationship).toBe("Wife");
      expect(result.current.gender).toBe("FEMALE");
      expect(result.current.isDirty).toBe(false);
    });

    it("is not dirty until a field actually changes, and ignores trim-only edits", () => {
      const { result } = renderHook(() => usePatientForm(editPatient));

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setName("Jane Smith ");
      });
      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.setName("Jane Doe");
      });
      expect(result.current.isDirty).toBe(true);
    });

    it("re-hydrates only when the edited patient's id changes, not on every rerender", () => {
      const { result, rerender } = renderHook(
        (patient: FamilyMember | null) => usePatientForm(patient),
        { initialProps: editPatient },
      );

      act(() => {
        result.current.setName("In Progress Edit");
      });
      expect(result.current.name).toBe("In Progress Edit");

      // Same id, new object reference (e.g. a refetch): must not stomp the edit.
      rerender({ ...editPatient });
      expect(result.current.name).toBe("In Progress Edit");

      // A different patient: should re-hydrate.
      rerender({ ...editPatient, id: "member-2", name: "Other Patient" });
      expect(result.current.name).toBe("Other Patient");
    });

    it("resets to empty when resetSignal changes and editPatient is null (sheet reopened for add)", () => {
      const { result, rerender } = renderHook(
        ({ patient, signal }: { patient: FamilyMember | null; signal: boolean }) =>
          usePatientForm(patient, signal),
        { initialProps: { patient: null, signal: true } },
      );

      act(() => {
        result.current.setName("Leftover text");
      });
      expect(result.current.name).toBe("Leftover text");

      rerender({ patient: null, signal: false });
      expect(result.current.name).toBe("");
    });
  });
});
