import { useCouponStore } from "@/src/store/couponStore";
import { useCheckoutDraftStore } from "@/src/store/checkoutDraftStore";

describe("useCouponStore — Coupon State & Draft Mirroring", () => {
  beforeEach(() => {
    useCouponStore.setState({ applied: null, justApplied: false });
    useCheckoutDraftStore.getState().clearDraft();
  });

  it("applies a coupon and mirrors its code into the checkout draft", () => {
    useCouponStore
      .getState()
      .apply({ code: "SAVE30", discount: 30, description: "30 off" });

    expect(useCouponStore.getState().applied).toEqual({
      code: "SAVE30",
      discount: 30,
      description: "30 off",
    });
    expect(useCheckoutDraftStore.getState().couponCode).toBe("SAVE30");
  });

  it("removes the applied coupon and clears the mirrored draft code", () => {
    useCouponStore
      .getState()
      .apply({ code: "SAVE30", discount: 30, description: "30 off" });

    useCouponStore.getState().remove();

    expect(useCouponStore.getState().applied).toBeNull();
    expect(useCheckoutDraftStore.getState().couponCode).toBe("");
  });
});
