import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClientProvider, useMutation } from "@tanstack/react-query";
import {
  queryClient,
  BACKGROUND_QUERY_META,
} from "@/src/lib/react-query/queryClient";
import { AppError } from "@/src/api/errors";
import { useToastStore } from "@/src/store/toastStore";
import { useNetworkStore } from "@/src/store/useNetworkStore";
import { resetNetworkFeedback } from "@/src/utils/offline/networkFeedback";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(QueryClientProvider, { client: queryClient }, children);

beforeEach(() => {
  useToastStore.setState({ visible: false, message: "", type: "success" });
  useNetworkStore.setState({
    isConnected: true,
    isInternetReachable: true,
    offlineAlertVisible: false,
  });
  resetNetworkFeedback();
  queryClient.clear();
});

// Every query/mutation above schedules its own gcTime timeout (up to an
// hour, per the real client's config) — clearing only before each test
// leaves the last one's timer open and jest hanging on exit.
afterAll(() => {
  queryClient.clear();
});

describe("queryClient — silent background 401s, everything else unchanged", () => {
  it("stays silent when a background query's first-ever fetch gets a 401", async () => {
    await queryClient.prefetchQuery({
      queryKey: ["test", "bg-401-no-data"],
      queryFn: () =>
        Promise.reject(new AppError("unauthorized", "Session expired", 401)),
      meta: BACKGROUND_QUERY_META,
      retry: false,
    });

    expect(useToastStore.getState().visible).toBe(false);
  });

  it("still toasts a background query's non-auth failure (5xx isn't swallowed)", async () => {
    await queryClient.prefetchQuery({
      queryKey: ["test", "bg-500-no-data"],
      queryFn: () => Promise.reject(new AppError("server", "boom", 500)),
      meta: BACKGROUND_QUERY_META,
      retry: false,
    });

    expect(useToastStore.getState().visible).toBe(true);
  });

  it("toasts a 401 on a query the user is actively waiting on (no background flag)", async () => {
    await queryClient
      .fetchQuery({
        queryKey: ["test", "fg-401-no-data"],
        queryFn: () =>
          Promise.reject(
            new AppError("unauthorized", "Session expired", 401),
          ),
        retry: false,
      })
      .catch(() => {});

    expect(useToastStore.getState().visible).toBe(true);
  });

  it("stays silent for a background query's 401 even when cached data already exists (belt-and-suspenders with the existing data-presence rule)", async () => {
    queryClient.setQueryData(["test", "bg-401-with-data"], "cached");

    await queryClient.prefetchQuery({
      queryKey: ["test", "bg-401-with-data"],
      queryFn: () =>
        Promise.reject(new AppError("unauthorized", "Session expired", 401)),
      meta: BACKGROUND_QUERY_META,
      retry: false,
      staleTime: 0,
    });

    expect(useToastStore.getState().visible).toBe(false);
  });
});

describe("queryClient — mutations follow the same background/401 rule", () => {
  it("stays silent for a background-tagged mutation's 401", async () => {
    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: () =>
            Promise.reject(
              new AppError("unauthorized", "Session expired", 401),
            ),
          meta: BACKGROUND_QUERY_META,
          retry: false,
        }),
      { wrapper },
    );

    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useToastStore.getState().visible).toBe(false);
  });

  it("still toasts a normal (user-triggered) mutation's 401", async () => {
    const { result } = renderHook(
      () =>
        useMutation({
          mutationFn: () =>
            Promise.reject(
              new AppError("unauthorized", "Session expired", 401),
            ),
          retry: false,
        }),
      { wrapper },
    );

    result.current.mutate();
    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(useToastStore.getState().visible).toBe(true);
  });
});
