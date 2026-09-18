/**
 * Mobile could create and view returns but never cancel one, so a return filed
 * by mistake was a support ticket. order-service exposes
 * POST /returns/:id/cancel, which the website already uses.
 */
import { returnApi } from "@/src/features/orders/api/return.api";
import { isReturnCancellable, RETURN_STATUS } from "@/src/features/orders/constants/return-status";
import { apiClient } from "@/src/api/client";
import { API_ENDPOINTS } from "@/src/utils/urls";

jest.mock("@/src/api/client", () => ({
  apiClient: { post: jest.fn(), get: jest.fn() },
}));

const mockPost = apiClient.post as jest.Mock;

describe("returnApi.cancelReturn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ data: { data: { id: "ret-1", status: 7 } } });
  });

  it("posts to the cancel endpoint with the reason", async () => {
    await returnApi.cancelReturn("ret-1", "Changed my mind");

    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe(API_ENDPOINTS.RETURN_CANCEL("ret-1"));
    expect(body).toEqual({ reason: "Changed my mind" });
  });

  it("builds the documented URL shape", () => {
    expect(API_ENDPOINTS.RETURN_CANCEL("abc")).toBe(
      "/api/v1/returns/abc/cancel",
    );
  });

  // Server caps reason at 1000 chars.
  it("truncates an over-long reason", async () => {
    await returnApi.cancelReturn("ret-1", "x".repeat(1500));

    expect(mockPost.mock.calls[0][1].reason).toHaveLength(1000);
  });

  it("returns the updated record", async () => {
    const result = await returnApi.cancelReturn("ret-1");
    expect(result).toEqual({ id: "ret-1", status: 7 });
  });
});

describe("isReturnCancellable", () => {
  // Mirrors order-service assertCancellable — only before pickup.
  it("allows REQUESTED and APPROVED", () => {
    expect(isReturnCancellable(RETURN_STATUS.REQUESTED)).toBe(true);
    expect(isReturnCancellable(RETURN_STATUS.APPROVED)).toBe(true);
  });

  it("blocks everything from pickup onward", () => {
    [
      RETURN_STATUS.PICKED_UP,
      RETURN_STATUS.RECEIVED,
      RETURN_STATUS.COMPLETED,
      RETURN_STATUS.REJECTED,
      RETURN_STATUS.CANCELLED,
    ].forEach((status) => {
      expect(isReturnCancellable(status)).toBe(false);
    });
  });
});
