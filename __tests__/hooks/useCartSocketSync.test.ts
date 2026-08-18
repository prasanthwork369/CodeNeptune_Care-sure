import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useCartSocketSync } from "@/src/features/cart/hooks/useCartSocketSync";

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
