import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCartSocketSync } from "@/src/features/cart/hooks/useCartSocketSync";
import { tokenStorage } from "@/src/lib/storage";

const mockGetAccessToken = jest.fn();
jest.mock("@/src/api/client", () => ({
  getAccessToken: () => mockGetAccessToken(),
}));

jest.mock("@/src/lib/storage", () => ({
  tokenStorage: { get: jest.fn().mockResolvedValue("initial-token") },
}));

let mockIsAuthenticated = true;
jest.mock("@/src/store/authStore", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean }) => unknown) =>
    selector({ isAuthenticated: mockIsAuthenticated }),
}));

// useIsAppForeground itself is unit-tested where it's defined
// (src/hooks/ui/useVisibleInterval.ts); here it's swapped for a controllable
// mock so this file can drive foreground/background transitions directly.
let mockIsForeground = true;
jest.mock("@/src/hooks/ui/useVisibleInterval", () => ({
  useIsAppForeground: () => mockIsForeground,
}));

const mockSetCart = jest.fn();
jest.mock("@/src/store/cartStore", () => ({
  useCartPendingStore: (selector: (s: { setCart: unknown }) => unknown) =>
    selector({ setCart: mockSetCart }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    setQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  }),
}));

// Fake socket: `.on` records namespace-level handlers, `.io.on` records
// Manager-level ones (reconnect_attempt lives on the Manager, not the socket).
const socketHandlers: Record<string, (...args: unknown[]) => void> = {};
const managerHandlers: Record<string, (...args: unknown[]) => void> = {};
const mockDisconnect = jest.fn();
const mockIo = jest.fn((_url: string, opts: { extraHeaders: Record<string, string> }) => ({
  extraHeaders: opts.extraHeaders,
  on: (event: string, handler: (...args: unknown[]) => void) => {
    socketHandlers[event] = handler;
  },
  io: {
    on: (event: string, handler: (...args: unknown[]) => void) => {
      managerHandlers[event] = handler;
    },
  },
  disconnect: mockDisconnect,
}));

jest.mock("socket.io-client", () => ({
  io: (...args: [string, { extraHeaders: Record<string, string> }]) =>
    mockIo(...args),
}));

describe("useCartSocketSync reconnect token freshness", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = true;
    mockIsForeground = true;
    mockGetAccessToken.mockReturnValue("refreshed-token");
    Object.keys(socketHandlers).forEach((k) => delete socketHandlers[k]);
    Object.keys(managerHandlers).forEach((k) => delete managerHandlers[k]);
  });

  it("connects with the initial token", async () => {
    renderHook(() => useCartSocketSync());

    await waitFor(() => expect(mockIo).toHaveBeenCalled());
    const [, opts] = mockIo.mock.calls[0];
    expect(opts.extraHeaders).toEqual({
      Authorization: "Bearer initial-token",
    });
  });

  it("updates the same extraHeaders object with the refreshed token on reconnect_attempt", async () => {
    renderHook(() => useCartSocketSync());

    await waitFor(() => expect(mockIo).toHaveBeenCalled());
    const [, opts] = mockIo.mock.calls[0];
    expect(opts.extraHeaders.Authorization).toBe("Bearer initial-token");

    await waitFor(() => expect(managerHandlers.reconnect_attempt).toBeDefined());
    act(() => {
      managerHandlers.reconnect_attempt(1);
    });

    // Same object reference, mutated in place — not replaced.
    expect(opts.extraHeaders.Authorization).toBe("Bearer refreshed-token");
  });

  it("disconnects immediately on logout", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalled());

    mockIsAuthenticated = false;
    rerender({});

    expect(mockDisconnect).toHaveBeenCalled();
  });
});

describe("useCartSocketSync AppState lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAuthenticated = true;
    mockIsForeground = true;
    mockGetAccessToken.mockReturnValue("refreshed-token");
    (tokenStorage.get as jest.Mock).mockResolvedValue("initial-token");
    Object.keys(socketHandlers).forEach((k) => delete socketHandlers[k]);
    Object.keys(managerHandlers).forEach((k) => delete managerHandlers[k]);
  });

  it("opens exactly one connection on mount while authenticated and foregrounded", async () => {
    renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));
  });

  it("disconnects when the app goes to background", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));

    mockIsForeground = false;
    rerender({});

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });

  it("reconnects exactly once when the app returns to foreground", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));

    mockIsForeground = false;
    rerender({});
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    mockIsForeground = true;
    rerender({});
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(2));
  });

  it("survives repeated background/foreground cycles with one connect + one disconnect per cycle", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));

    // Each foreground reconnect is awaited before the next background flip —
    // real AppState transitions are seconds apart, not same-tick, so this
    // gives the async connect() its microtask turn each cycle instead of
    // racing it (a same-tick flip correctly aborts the pending connect,
    // covered separately below).
    for (let i = 0; i < 3; i++) {
      mockIsForeground = false;
      rerender({});
      mockIsForeground = true;
      rerender({});
      await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(2 + i));
    }
    expect(mockDisconnect).toHaveBeenCalledTimes(3);
  });

  it("aborts a same-tick background flip instead of leaving an orphaned connect in flight", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));

    mockIsForeground = false;
    rerender({});
    // Foreground again before the pending connect()'s token read resolves.
    mockIsForeground = true;
    rerender({});
    mockIsForeground = false;
    rerender({});

    // The aborted connect must never call io() a second time, and must never
    // leave a socket needing disconnect.
    await new Promise((r) => setTimeout(r, 0));
    expect(mockIo).toHaveBeenCalledTimes(1);
  });

  it("uses the latest token on foreground reconnect after a background token refresh", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));
    expect(mockIo.mock.calls[0][1].extraHeaders).toEqual({
      Authorization: "Bearer initial-token",
    });

    mockIsForeground = false;
    rerender({});

    (tokenStorage.get as jest.Mock).mockResolvedValue("background-refreshed-token");
    mockIsForeground = true;
    rerender({});

    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(2));
    expect(mockIo.mock.calls[1][1].extraHeaders).toEqual({
      Authorization: "Bearer background-refreshed-token",
    });
  });

  it("does not reconnect on foreground after logout", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));

    mockIsAuthenticated = false;
    rerender({});
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    mockIsForeground = false;
    rerender({});
    mockIsForeground = true;
    rerender({});

    expect(mockIo).toHaveBeenCalledTimes(1);
  });

  it("disconnects on logout while backgrounded and never reconnects afterward", async () => {
    const { rerender } = renderHook(() => useCartSocketSync());
    await waitFor(() => expect(mockIo).toHaveBeenCalledTimes(1));

    mockIsForeground = false;
    rerender({});
    expect(mockDisconnect).toHaveBeenCalledTimes(1);

    mockIsAuthenticated = false;
    rerender({});

    mockIsForeground = true;
    rerender({});

    expect(mockIo).toHaveBeenCalledTimes(1);
  });
});
