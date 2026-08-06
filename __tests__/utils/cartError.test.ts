import { AppError } from "@/src/api/errors";
import { cartErrorMessage, notifyCartError } from "@/src/utils/cartError";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useToastStore } from "@/src/store/toastStore";
import {
  OFFLINE_MESSAGE,
  requireInternet,
  resetNetworkFeedback,
} from "@/src/utils/offline";

describe("cartErrorMessage — cart write error sanitization", () => {
  it("uses the shared offline copy for offline and network kinds", () => {
    expect(cartErrorMessage(new AppError("network", "socket hang up"))).toBe(
      OFFLINE_MESSAGE,
    );
    expect(cartErrorMessage(new AppError("offline", "never sent"))).toBe(
      OFFLINE_MESSAGE,
    );
  });

  it("returns retry guidance for timeouts", () => {
    expect(cartErrorMessage(new AppError("timeout", "ECONNABORTED"))).toBe(
      "That took too long. Please try again.",
    );
  });

  it("returns session expired message for auth errors", () => {
    expect(cartErrorMessage(new AppError("unauthorized", "no token"))).toBe(
      "Your session has expired. Please log in and try again.",
    );
    expect(cartErrorMessage(new AppError("forbidden", "denied"))).toBe(
      "Your session has expired. Please log in and try again.",
    );
  });

  it("never leaks a raw backend message", () => {
    const err = new AppError("server", "PG::UniqueViolation on cart_items");
    expect(cartErrorMessage(err)).toBe(
      "We couldn't reach our servers. Please try again in a moment.",
    );
  });

  it("returns a safe default for unknown errors", () => {
    expect(cartErrorMessage(new Error("boom"))).toBe(
      "We couldn't update your cart. Please try again.",
    );
    expect(cartErrorMessage(null)).toBe(
      "We couldn't update your cart. Please try again.",
    );
  });
});

describe("notifyCartError", () => {
  beforeEach(() => {
    useToastStore.setState({ visible: false, message: "", type: "success" });
    useNetworkStore.setState({ offlineAlertVisible: false });
    resetNetworkFeedback();
  });

  it("shows an error toast", () => {
    notifyCartError(new AppError("server", "500"));

    expect(useToastStore.getState()).toMatchObject({
      visible: true,
      type: "error",
      message: "We couldn't reach our servers. Please try again in a moment.",
    });
  });

  it("stays quiet while the offline dialog is already up", () => {
    useNetworkStore.setState({ offlineAlertVisible: true });

    notifyCartError(new AppError("network", "offline"));

    expect(useToastStore.getState().visible).toBe(false);
  });
});

describe("requireInternet — the cart's pre-flight gate", () => {
  beforeEach(() => {
    useNetworkStore.setState({
      isConnected: true,
      isInternetReachable: true,
      offlineAlertVisible: false,
    });
    useToastStore.setState({ visible: false, message: "", type: "success" });
    resetNetworkFeedback();
  });

  it("allows the action when the connection is usable", () => {
    expect(requireInternet()).toBe(true);
    expect(useToastStore.getState().visible).toBe(false);
  });

  it("blocks the write when disconnected, leaving the banner to explain", () => {
    useNetworkStore.setState({ isConnected: false });

    expect(requireInternet()).toBe(false);
    expect(useToastStore.getState().visible).toBe(false);
  });

  it("treats connected-but-unreachable as offline", () => {
    useNetworkStore.setState({ isConnected: true, isInternetReachable: false });

    expect(requireInternet()).toBe(false);
  });

  it("allows the action while reachability is still unknown", () => {
    useNetworkStore.setState({ isConnected: true, isInternetReachable: null });

    expect(requireInternet()).toBe(true);
  });
});
