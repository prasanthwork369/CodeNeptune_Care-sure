import { act, renderHook } from "@testing-library/react-native";
import { useOtp } from "@/src/hooks/useOtp";

const mockVerifyOtp = jest.fn();
const mockRequestOtp = jest.fn();
const mockAddItem = jest.fn();
const mockRemoveGuestItem = jest.fn();
const mockRequireInternet = jest.fn(() => true);
const mockReplace = jest.fn();

let mockGuestCart: { items: { id: string; medicineId: string }[] } | null = null;

jest.mock("@/src/hooks/mutations/useAuth", () => ({
  useAuth: () => ({
    verifyOtp: mockVerifyOtp,
    requestOtp: mockRequestOtp,
    loading: false,
    error: null,
    resetError: jest.fn(),
  }),
}));

jest.mock("@/src/api/cart.api", () => ({
  cartApi: { addItem: (...a: unknown[]) => mockAddItem(...a) },
}));

jest.mock("@/src/store/cartStore", () => ({
  useCartPendingStore: {
    getState: () => ({
      guestCart: mockGuestCart,
      removeGuestItem: mockRemoveGuestItem,
    }),
  },
}));

jest.mock("@/src/store/notificationNavigationStore", () => ({
  useNotificationNavigationStore: {
    getState: () => ({
      pendingNotification: null,
      clearPendingNotification: jest.fn(),
    }),
  },
}));

jest.mock("@/src/utils/offline", () => ({
  requireInternet: () => mockRequireInternet(),
}));

jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ phone: "9876543210" }),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock("@/src/services/firebase", () => ({
  analyticsService: { logLoginSuccess: jest.fn() },
}));

jest.mock("@/src/services/notifications/NotificationNavigation", () => ({
  NotificationNavigation: { executeNavigation: jest.fn() },
}));

jest.mock("@/src/utils/environment", () => ({ isExpoGo: true }));
jest.mock("@/src/utils/urls", () => ({ IS_LIVE_API: true }));

const VALID = "123456";

// Static import: jest.resetModules() here would give the hook a second React
// copy and every render would fail with "Invalid hook call".

/** Lets the detached background merge settle. */
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe("useOtp duplicate guards", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequireInternet.mockReturnValue(true);
    mockVerifyOtp.mockResolvedValue(undefined);
    mockGuestCart = null;
  });

  describe("verify lock", () => {
    // The defect: `loading` is state, so two taps in one tick both read false.
    it("fires exactly one request for two same-tick verifies", async () => {
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        // Deliberately not awaited individually — this is the same-tick case.
        void result.current.handleVerify(VALID);
        void result.current.handleVerify(VALID);
      });

      expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    });

    it("allows a retry after a failed verify", async () => {
      mockVerifyOtp.mockRejectedValueOnce(new Error("invalid otp"));
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });
      expect(mockVerifyOtp).toHaveBeenCalledTimes(1);

      mockVerifyOtp.mockResolvedValueOnce(undefined);
      await act(async () => {
        await result.current.handleVerify(VALID);
      });

      // Lock released on failure, so the second attempt got through.
      expect(mockVerifyOtp).toHaveBeenCalledTimes(2);
    });

    it("stays locked after success so a late tap cannot verify twice", async () => {
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });
      await act(async () => {
        await result.current.handleVerify(VALID);
      });

      expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    });
  });

  describe("unchanged behaviour", () => {
    it("does not call the API for an invalid code", async () => {
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify("12");
      });

      expect(mockVerifyOtp).not.toHaveBeenCalled();
    });

    it("does not call the API when offline", async () => {
      mockRequireInternet.mockReturnValue(false);
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });

      expect(mockVerifyOtp).not.toHaveBeenCalled();
    });

    // Offline must not consume the lock, or the user is stuck once reconnected.
    it("leaves the lock free after an offline attempt", async () => {
      mockRequireInternet.mockReturnValue(false);
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });

      mockRequireInternet.mockReturnValue(true);
      await act(async () => {
        await result.current.handleVerify(VALID);
      });

      expect(mockVerifyOtp).toHaveBeenCalledTimes(1);
    });
  });

  describe("guest cart merge latch", () => {
    it("merges each guest item once on success", async () => {
      mockGuestCart = {
        items: [
          { id: "a", medicineId: "m1" },
          { id: "b", medicineId: "m2" },
        ],
      };
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });
      await flush();

      expect(mockAddItem).toHaveBeenCalledTimes(2);
      expect(mockRemoveGuestItem).toHaveBeenCalledTimes(2);
    });

    // Two rapid verifies must not produce two merge passes over the same items.
    it("does not double-add when verify is triggered twice in a tick", async () => {
      mockGuestCart = { items: [{ id: "a", medicineId: "m1" }] };
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        void result.current.handleVerify(VALID);
        void result.current.handleVerify(VALID);
      });
      await flush();

      expect(mockAddItem).toHaveBeenCalledTimes(1);
    });

    it("keeps an item that failed to merge", async () => {
      mockGuestCart = { items: [{ id: "a", medicineId: "m1" }] };
      mockAddItem.mockRejectedValueOnce(new Error("500"));
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });
      await flush();

      expect(mockAddItem).toHaveBeenCalledTimes(1);
      // Per-item cleanup preserved: a failure must not drop the guest item.
      expect(mockRemoveGuestItem).not.toHaveBeenCalled();
    });

    // The latch is released in `finally`, so a failed pass cannot wedge it.
    it("can merge again after a failed pass", async () => {
      mockGuestCart = { items: [{ id: "a", medicineId: "m1" }] };
      mockAddItem.mockRejectedValueOnce(new Error("500"));
      const first = renderHook(() => useOtp());

      await act(async () => {
        await first.result.current.handleVerify(VALID);
      });
      await flush();
      expect(mockAddItem).toHaveBeenCalledTimes(1);

      // A fresh sign-in in the same session retries the still-present item.
      mockAddItem.mockResolvedValueOnce(undefined);
      const second = renderHook(() => useOtp());
      await act(async () => {
        await second.result.current.handleVerify(VALID);
      });
      await flush();

      expect(mockAddItem).toHaveBeenCalledTimes(2);
      expect(mockRemoveGuestItem).toHaveBeenCalledTimes(1);
    });

    it("does nothing when the guest cart is empty", async () => {
      mockGuestCart = { items: [] };
      const { result } = renderHook(() => useOtp());

      await act(async () => {
        await result.current.handleVerify(VALID);
      });
      await flush();

      expect(mockAddItem).not.toHaveBeenCalled();
    });
  });
});
