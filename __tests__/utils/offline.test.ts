import { AppError, toAppError } from "@/src/api/errors";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { useToastStore } from "@/src/store/toastStore";
import {
  OFFLINE_MESSAGE,
  isOffline,
  markReachable,
  markUnreachable,
  reportActionError,
  requireInternet,
  resetNetworkFeedback,
  runOnlineAction,
} from "@/src/utils/offline";

const goOnline = () =>
  useNetworkStore.setState({
    isConnected: true,
    isInternetReachable: true,
    offlineAlertVisible: false,
  });

const goOffline = () =>
  useNetworkStore.setState({
    isConnected: false,
    isInternetReachable: false,
    offlineAlertVisible: false,
  });

beforeEach(() => {
  goOnline();
  useToastStore.setState({ visible: false, message: "", type: "success" });
  resetNetworkFeedback();
});

describe("isOffline", () => {
  it("is false while state is still undetermined, so a cold start isn't blocked", () => {
    useNetworkStore.setState({
      isConnected: null,
      isInternetReachable: null,
    });
    expect(isOffline()).toBe(false);
  });

  it("is true when disconnected or unreachable", () => {
    useNetworkStore.setState({ isConnected: false });
    expect(isOffline()).toBe(true);

    useNetworkStore.setState({ isConnected: true, isInternetReachable: false });
    expect(isOffline()).toBe(true);
  });
});

describe("requireInternet", () => {
  it("blocks an everyday action with no toast or modal — the banner owns it", () => {
    goOffline();

    expect(requireInternet()).toBe(false);
    expect(useToastStore.getState().visible).toBe(false);
    expect(useNetworkStore.getState().offlineAlertVisible).toBe(false);
  });

  it("adds the modal only for a critical action", () => {
    goOffline();

    expect(requireInternet({ critical: true })).toBe(false);
    expect(useNetworkStore.getState().offlineAlertVisible).toBe(true);
    expect(useToastStore.getState().visible).toBe(false);
  });

  it("reports nothing when silent, even if critical", () => {
    goOffline();

    expect(requireInternet({ silent: true, critical: true })).toBe(false);
    expect(useToastStore.getState().visible).toBe(false);
    expect(useNetworkStore.getState().offlineAlertVisible).toBe(false);
  });
});

describe("reportActionError", () => {
  it("collapses repeats of the same message into one toast", () => {
    reportActionError(new AppError("server", "boom"));
    const firstShownAt = useToastStore.getState().message;
    useToastStore.setState({ visible: false });

    reportActionError(new AppError("server", "boom"));

    expect(firstShownAt).toBe(
      "Server temporarily unavailable. Please try again in a moment.",
    );
    expect(useToastStore.getState().visible).toBe(false);
  });

  it("stays silent for cancelled requests", () => {
    reportActionError(new AppError("cancelled", "aborted"));
    expect(useToastStore.getState().visible).toBe(false);
  });

  it("leaves connection failures to the banner alone when offline", () => {
    goOffline();
    reportActionError(new AppError("offline", "never sent"));
    reportActionError(new AppError("network", "socket hang up"));

    expect(useToastStore.getState().visible).toBe(false);
    expect(useNetworkStore.getState().offlineAlertVisible).toBe(false);
  });

  it("toasts a connection failure when online", () => {
    reportActionError(new AppError("network", "socket hang up"));

    expect(useToastStore.getState().visible).toBe(true);
    expect(useToastStore.getState().message).toBe(
      "Unable to reach server. Please try again.",
    );
  });

  it("still toasts a server failure, which the banner says nothing about", () => {
    reportActionError(new AppError("server", "500"));
    expect(useToastStore.getState().visible).toBe(true);
  });

  it("returns the normalized AppError", () => {
    const result = reportActionError(new Error("raw"));
    expect(result).toBeInstanceOf(AppError);
    expect(result.kind).toBe("unknown");
  });
});

describe("runOnlineAction", () => {
  it("never calls the action while offline", async () => {
    goOffline();
    const action = jest.fn().mockResolvedValue("done");

    const result = await runOnlineAction(action);

    expect(action).not.toHaveBeenCalled();
    expect(result).toEqual({ ok: false, reason: "offline" });
    // Banner only — no second message for the same state.
    expect(useToastStore.getState().visible).toBe(false);
  });

  it("returns the action's value when online", async () => {
    const result = await runOnlineAction(async () => 42);
    expect(result).toEqual({ ok: true, data: 42 });
  });

  it("reports a failure and resolves instead of throwing", async () => {
    const result = await runOnlineAction(async () => {
      throw new AppError("server", "500");
    });

    expect(result.ok).toBe(false);
    expect(result.ok === false && result.error?.kind).toBe("server");
    expect(useToastStore.getState().visible).toBe(true);
  });

  it("honours a custom message and silence", async () => {
    await runOnlineAction(
      async () => {
        throw new AppError("server", "500");
      },
      { message: "Could not apply coupon." },
    );
    expect(useToastStore.getState().message).toBe("Could not apply coupon.");

    useToastStore.setState({ visible: false, message: "" });
    await runOnlineAction(
      async () => {
        throw new AppError("server", "500");
      },
      { silent: true },
    );
    expect(useToastStore.getState().visible).toBe(false);
  });
});

describe("learned reachability — OS-level per-app network block", () => {
  it("marks unreachable so the next tap is gated instantly", () => {
    // NetInfo still reports a live transport; only the app is blocked.
    useNetworkStore.setState({
      isConnected: true,
      isInternetReachable: true,
    });
    expect(isOffline()).toBe(false);

    markUnreachable();

    expect(isOffline()).toBe(true);
    expect(requireInternet()).toBe(false);
  });

  it("clears on a successful request, so a wrong reading can never latch", () => {
    useNetworkStore.setState({
      isConnected: true,
      isInternetReachable: false,
    });
    expect(isOffline()).toBe(true);

    markReachable();

    expect(isOffline()).toBe(false);
  });

  it("leaves a hard disconnect alone — only NetInfo clears that", () => {
    useNetworkStore.setState({
      isConnected: false,
      isInternetReachable: false,
    });

    markReachable();

    expect(isOffline()).toBe(true);
  });
});

describe("toAppError — standardized transport failures", () => {
  it("maps the offline gate rejection", () => {
    const err = Object.assign(new Error("Network offline"), {
      code: "NETWORK_OFFLINE",
    });
    expect(toAppError(err).kind).toBe("offline");
    expect(toAppError(err).message).toBe(OFFLINE_MESSAGE);
  });

  it("maps cancellations", () => {
    expect(toAppError({ code: "ERR_CANCELED" }).kind).toBe("cancelled");
    expect(toAppError({ name: "CanceledError" }).kind).toBe("cancelled");
  });

  it("maps timeouts", () => {
    expect(
      toAppError({ isAxiosError: true, code: "ECONNABORTED" }).kind,
    ).toBe("timeout");
    expect(toAppError({ isAxiosError: true, code: "ETIMEDOUT" }).kind).toBe(
      "timeout",
    );
  });

  it("maps DNS/connection failure with no response to network", () => {
    expect(
      toAppError({ isAxiosError: true, code: "ENOTFOUND", message: "dns" }).kind,
    ).toBe("network");
  });
});
