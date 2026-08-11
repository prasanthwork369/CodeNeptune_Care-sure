import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";

describe("useCheckoutDraftStore — Checkout Draft Recovery State", () => {
  beforeEach(() => {
    useCheckoutDraftStore.getState().clearDraft();
  });

  it("initializes with empty patient/coupon and COD payment method", () => {
    const state = useCheckoutDraftStore.getState();
    expect(state.patientMemberId).toBe("");
    expect(state.patientPhone).toBe("");
    expect(state.paymentMethod).toBe("COD");
    expect(state.couponCode).toBe("");
  });

  it("sets the selected patient", () => {
    useCheckoutDraftStore.getState().setPatient("patient-1", "+919876543210");

    const state = useCheckoutDraftStore.getState();
    expect(state.patientMemberId).toBe("patient-1");
    expect(state.patientPhone).toBe("+919876543210");
  });

  it("sets the selected payment method", () => {
    useCheckoutDraftStore.getState().setPaymentMethod("CARD");

    expect(useCheckoutDraftStore.getState().paymentMethod).toBe("CARD");
  });

  it("sets the applied coupon code", () => {
    useCheckoutDraftStore.getState().setCouponCode("SAVE30");

    expect(useCheckoutDraftStore.getState().couponCode).toBe("SAVE30");
  });

  it("clears the draft back to defaults", () => {
    useCheckoutDraftStore.getState().setPatient("patient-1", "+919876543210");
    useCheckoutDraftStore.getState().setPaymentMethod("CARD");
    useCheckoutDraftStore.getState().setCouponCode("SAVE30");

    useCheckoutDraftStore.getState().clearDraft();

    const state = useCheckoutDraftStore.getState();
    expect(state.patientMemberId).toBe("");
    expect(state.patientPhone).toBe("");
    expect(state.paymentMethod).toBe("COD");
    expect(state.couponCode).toBe("");
  });
});
