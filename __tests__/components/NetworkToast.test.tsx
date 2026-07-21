import React from "react";
import { renderWithProviders } from "@/__tests__/test-utils/renderWithProviders";
import NetworkToast from "@/src/components/common/NetworkToast";
import { useNetworkStore } from "@/src/store/useNetworkStore";

jest.mock("@/src/constants/icons", () => ({
  icons: {
    no_internet: () => null,
    internet: () => null,
    wifi_1: () => null,
    wifi_2: () => null,
    wifi_3: () => null,
    wifi_4: () => null,
  },
}));

describe("NetworkToast Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNetworkStore.setState({
      isConnected: true,
      isInternetReachable: true,
      offlineAlertVisible: false,
    });
  });

  it("renders offline alert dialog when offlineAlertVisible is true and device is offline", () => {
    useNetworkStore.setState({ isConnected: false, offlineAlertVisible: true });

    const { getByText } = renderWithProviders(<NetworkToast />);
    expect(getByText(/No Internet Connection/i)).toBeTruthy();
  });

  it("displays 'Internet connection lost' toast message when offline", () => {
    useNetworkStore.setState({ isConnected: false });

    const { getByText } = renderWithProviders(<NetworkToast />);
    expect(getByText("Internet connection lost")).toBeTruthy();
    expect(getByText(/Refresh/i)).toBeTruthy();
  });

  it("displays 'Low network connection' toast message when reachability is false", () => {
    useNetworkStore.setState({ isConnected: true, isInternetReachable: false });

    const { getByText } = renderWithProviders(<NetworkToast />);
    expect(getByText("Low network connection")).toBeTruthy();
  });
});
