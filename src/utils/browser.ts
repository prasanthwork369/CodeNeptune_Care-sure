import * as WebBrowser from "expo-web-browser";
import { Linking, Alert, Platform } from "react-native";
import { queryClient } from "@/src/lib/react-query/queryClient";
import { MobileAppLinks } from "@/src/api/settings.api";

/**
 * Resolves the given URL. If it's a placeholder (contains caresure.app), it attempts to
 * resolve it from the queryClient settings cache ('mobile-app-links').
 */
function resolveUrl(url: string): string {
  if (!url.includes("caresure.app")) {
    return url;
  }

  try {
    const links = queryClient.getQueryData<MobileAppLinks>([
      "mobile-app-links",
    ]);
    if (links) {
      if (url.includes("/terms") && links.termsLink) {
        return links.termsLink;
      }
      if (
        (url.includes("/privacy-policy") || url.includes("/privacy")) &&
        links.privacyLink
      ) {
        return links.privacyLink;
      }
      if (
        (url.includes("/refund-policy") || url.includes("/refund")) &&
        links.refundLink
      ) {
        return links.refundLink;
      }
    }
  } catch (e) {
    if (__DEV__) console.warn("Failed to resolve URL via queryClient:", e);
  }

  return url;
}

/**
 * Opens a legal/policy URL in a browser without allowing this app's broad
 * Android App Link filter to compete for the URL.
 */
export async function openLegalLink(url: string): Promise<void> {
  if (!url) return;

  try {
    if (Platform.OS === "android") {
      let browserPackage: string | undefined;

      try {
        const supported =
          await WebBrowser.getCustomTabsSupportingBrowsersAsync();
        browserPackage =
          supported.defaultBrowserPackage || supported.browserPackages?.[0];
      } catch (error) {
        if (__DEV__) {
          console.warn(
            "[LegalLink] Failed to resolve an Android browser package",
            error,
          );
        }
      }

      // With a package, Android targets the browser directly instead of
      // resolving the URL against CareSure's broad App Link filter. The
      // unscoped call is a graceful fallback for devices without a
      // discoverable Custom Tabs browser.
      await WebBrowser.openBrowserAsync(
        url,
        browserPackage ? { browserPackage } : {},
      );
      return;
    }

    await WebBrowser.openBrowserAsync(url);
  } catch (error) {
    console.warn("[LegalLink] Failed to open URL", error);
  }
}

/**
 * Opens a URL in an In-App Browser modal (Safari View Controller / Chrome Custom Tabs).
 */
export async function openInAppBrowser(
  url: string,
  toolbarColor: string = "#1A1A1A",
): Promise<void> {
  const targetUrl = resolveUrl(url);
  if (!targetUrl) return;

  try {
    const supported = await Linking.canOpenURL(targetUrl);
    if (!supported) return;

    // Try in-app browser first; fall back to system browser on failure
    try {
      await WebBrowser.openBrowserAsync(targetUrl, {
        readerMode: false,
        enableBarCollapsing: true,
        dismissButtonStyle: "close",
        toolbarColor,
      });
    } catch {
      await Linking.openURL(targetUrl);
    }
  } catch (error) {
    if (__DEV__) console.error("[openInAppBrowser] failed:", error);
  }
}

/**
 * Opens a URL in the device's system default/third-party browser.
 */
export async function openExternalBrowser(url: string): Promise<void> {
  const targetUrl = resolveUrl(url);

  try {
    const supported = await Linking.canOpenURL(targetUrl);
    if (supported) {
      await Linking.openURL(targetUrl);
    } else {
      Alert.alert("Error", `Cannot open this URL: ${targetUrl}`);
    }
  } catch (error) {
    if (__DEV__) console.error("Failed to open external URL:", error);
    Alert.alert("Error", "Unable to open the requested web page.");
  }
}
