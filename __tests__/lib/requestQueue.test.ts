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
    // Distinct URLs — identical configs would now fold into one entry via
    // the duplicate-request merge (see "folds duplicate..." below), which
    // would defeat this test's point of actually filling the queue.
    for (let i = 0; i < 50; i++) {
      await requestQueue.add(
        { url: `/test/${i}` },
        () => {},
        () => {},
      );
    }
    expect(requestQueue.length).toBe(50);

    // 51st request should be rejected
    const rejectSpy = jest.fn();
    await requestQueue.add({ url: "/test/50" }, () => {}, rejectSpy);

    expect(rejectSpy).toHaveBeenCalledWith(
      new Error("Offline queue full — request dropped"),
    );
    expect(requestQueue.length).toBe(50);
  });

  it("folds a duplicate (same method+url+body) request into the existing queued entry", async () => {
    const config = { url: "/api/v1/customers/notifications/abc/read", method: "PATCH" };
    const resolve1 = jest.fn();
    const resolve2 = jest.fn();

    await requestQueue.add(config, resolve1, jest.fn());
    await requestQueue.add({ ...config }, resolve2, jest.fn());

    // Second add() folded into the first entry rather than pushing a new one.
    expect(requestQueue.length).toBe(1);

    const mockAxiosInstance = jest
      .fn()
      .mockResolvedValueOnce({ status: 200, data: "ok" });
    await requestQueue.process(mockAxiosInstance);

    expect(mockAxiosInstance).toHaveBeenCalledTimes(1);
    expect(resolve1).toHaveBeenCalledWith({ status: 200, data: "ok" });
    expect(resolve2).toHaveBeenCalledWith({ status: 200, data: "ok" });
  });

  it("does not fold requests with the same method+url but different bodies", async () => {
    await requestQueue.add(
      { url: "/api/v1/customers/search-history", method: "POST", data: { query: "aspirin" } },
      jest.fn(),
      jest.fn(),
    );
    await requestQueue.add(
      { url: "/api/v1/customers/search-history", method: "POST", data: { query: "vitamin c" } },
      jest.fn(),
      jest.fn(),
    );

    expect(requestQueue.length).toBe(2);
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
