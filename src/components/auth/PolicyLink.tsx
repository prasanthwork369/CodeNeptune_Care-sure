import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";

// ─── Component ────────────────────────────────────────────────────────────────

interface PolicyLinkProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  url?: string;
}

export const PolicyLink: React.FC<PolicyLinkProps> = ({
  isVisible,
  onClose,
  url,
}) => {
  useEffect(() => {
    if (!isVisible || !url) return;

    let active = true;
    WebBrowser.openBrowserAsync(url).finally(() => {
      if (active) onClose();
    });

    return () => {
      active = false;
    };
  }, [isVisible, url, onClose]);

  return null;
};
