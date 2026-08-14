import { act, renderHook, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useRefillReminder } from "@/src/hooks/useRefillReminder";
import { prescriptionService } from "@/src/services/prescription.service";

jest.mock("@/src/services/prescription.service", () => ({
  prescriptionService: {
    getById: jest.fn(),
    setReminder: jest.fn(),
    cancelReminder: jest.fn(),
  },
}));

const mockPush = jest.fn();
jest.mock("@/src/hooks/useNav", () => ({
  useNav: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    canGoBack: jest.fn(),
  }),
}));

const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

const service = prescriptionService as jest.Mocked<typeof prescriptionService>;
const activeReminder = {
  status: "active" as const,
  frequencyDays: 14 as const,
  nextRemindAt: "2026-08-06T10:00:00.000Z",
};

describe("useRefillReminder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  it("hydrates reminder state from the server when none is supplied", async () => {
    service.getById.mockResolvedValue({
      success: true,
      data: { id: "rx-1", reminder: activeReminder } as any,
    });

    const { result } = renderHook(() =>
      useRefillReminder({ prescriptionId: "rx-1" }),
    );

    await waitFor(() => expect(result.current.isActive).toBe(true));
    expect(result.current.frequencyDays).toBe(14);
    expect(result.current.nextRemindDate?.toISOString()).toBe(
      activeReminder.nextRemindAt,
    );
  });

  it("uses initialReminder without refetching (list rows)", () => {
    const { result } = renderHook(() =>
      useRefillReminder({
        prescriptionId: "rx-1",
        initialReminder: activeReminder,
      }),
    );

    expect(service.getById).not.toHaveBeenCalled();
    expect(result.current.isActive).toBe(true);
  });

  it("activates after a successful setReminder call", async () => {
    service.setReminder.mockResolvedValue({
      success: true,
      data: activeReminder,
    });

    const { result } = renderHook(() =>
      useRefillReminder({ prescriptionId: "rx-1", initialReminder: null }),
    );

    await act(async () => {
      expect(await result.current.setReminder({ frequencyDays: 14 })).toBe(
        true,
      );
    });

    expect(service.setReminder).toHaveBeenCalledWith("rx-1", {
      frequencyDays: 14,
    });
    expect(result.current.isActive).toBe(true);
    // Stale cached lists must refetch so reopened screens show the new state.
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ["customer", "prescriptions"],
    });
  });

  it("deactivates after cancelReminder", async () => {
    service.cancelReminder.mockResolvedValue({ success: true, data: null });

    const { result } = renderHook(() =>
      useRefillReminder({
        prescriptionId: "rx-1",
        initialReminder: activeReminder,
      }),
    );

    await act(async () => {
      expect(await result.current.cancelReminder()).toBe(true);
    });

    expect(result.current.isActive).toBe(false);
    expect(result.current.nextRemindDate).toBeNull();
  });

  it("shows the Health Updates alert on HEALTH_UPDATES_DISABLED and stays off", async () => {
    service.setReminder.mockResolvedValue({
      success: false,
      error: "Health Updates disabled",
      code: "HEALTH_UPDATES_DISABLED",
    });

    const { result } = renderHook(() =>
      useRefillReminder({ prescriptionId: "rx-1", initialReminder: null }),
    );

    await act(async () => {
      expect(await result.current.setReminder({ frequencyDays: 7 })).toBe(
        false,
      );
    });

    expect(result.current.isActive).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith(
      "Turn on Health Updates",
      expect.any(String),
      expect.any(Array),
    );
  });

  it("sends a custom date as a day-count frequencyDays (one-time reminder)", async () => {
    const frequencyDays = 10;
    const serverNextRemindAt = "2026-09-01T03:30:00.000Z";
    service.setReminder.mockResolvedValue({
      success: true,
      data: {
        status: "active",
        type: "once",
        frequencyDays,
        nextRemindAt: serverNextRemindAt,
      },
    });

    const { result } = renderHook(() =>
      useRefillReminder({ prescriptionId: "rx-1", initialReminder: null }),
    );

    await act(async () => {
      expect(await result.current.setReminder({ frequencyDays })).toBe(true);
    });

    expect(service.setReminder).toHaveBeenCalledWith("rx-1", {
      frequencyDays,
    });
    expect(result.current.isActive).toBe(true);
    expect(result.current.nextRemindDate?.toISOString()).toBe(
      serverNextRemindAt,
    );
  });

  it("does nothing without a prescriptionId", async () => {
    const { result } = renderHook(() => useRefillReminder({}));

    await act(async () => {
      expect(await result.current.setReminder({ frequencyDays: 7 })).toBe(
        false,
      );
    });

    expect(service.setReminder).not.toHaveBeenCalled();
  });
});
