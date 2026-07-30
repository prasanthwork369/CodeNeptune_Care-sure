import { requestQueue } from "@/src/utils/requestQueue";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("RequestQueue — Offline Mutation Queue", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await requestQueue.clear();
  });

  it("enqueues request and persists queue to AsyncStorage", async () => {
    const mockConfig = {
      url: "/api/v1/orders",
      method: "POST",
      data: { item: "rx" },
    };
    const resolve = jest.fn();
    const reject = jest.fn();

    await requestQueue.add(mockConfig, resolve, reject);

    expect(requestQueue.length).toBe(1);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "offline_request_queue",
      JSON.stringify([mockConfig]),
    );
  });

  it("drops requests and rejects with error when queue exceeds MAX_SIZE (50)", async () => {
    const dummyConfig = { url: "/test" };

    // Fill queue to MAX_SIZE (50)
    for (let i = 0; i < 50; i++) {
      await requestQueue.add(
        dummyConfig,
        () => {},
        () => {},
      );
    }
    expect(requestQueue.length).toBe(50);

    // 51st request should be rejected
    const rejectSpy = jest.fn();
    await requestQueue.add(dummyConfig, () => {}, rejectSpy);

    expect(rejectSpy).toHaveBeenCalledWith(
      new Error("Offline queue full — request dropped"),
    );
    expect(requestQueue.length).toBe(50);
  });

  it("processes and replays queued requests sequentially when network is restored", async () => {
    const req1 = { url: "/api/1" };
    const req2 = { url: "/api/2" };

    const resolve1 = jest.fn();
    const resolve2 = jest.fn();

    await requestQueue.add(req1, resolve1, jest.fn());
    await requestQueue.add(req2, resolve2, jest.fn());

    const mockAxiosInstance = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: "ok1" })
      .mockResolvedValueOnce({ status: 200, data: "ok2" });

    await requestQueue.process(mockAxiosInstance);

    expect(mockAxiosInstance).toHaveBeenCalledWith(req1);
    expect(mockAxiosInstance).toHaveBeenCalledWith(req2);
    expect(resolve1).toHaveBeenCalledWith({ status: 200, data: "ok1" });
    expect(resolve2).toHaveBeenCalledWith({ status: 200, data: "ok2" });
    expect(requestQueue.length).toBe(0);
  });

  it("clears queue in memory and removes from storage", async () => {
    await requestQueue.add(
      { url: "/api/test" },
      () => {},
      () => {},
    );
    expect(requestQueue.length).toBe(1);

    await requestQueue.clear();

    expect(requestQueue.length).toBe(0);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      "offline_request_queue",
    );
  });
});
